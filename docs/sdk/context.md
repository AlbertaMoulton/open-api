# 上下文

`Context` 是每次处理 update 时传入 middleware 的对象。它把原始 update、Bot API、常用字段和快捷方法组织在一起，让你在一个回调里完成读取消息、判断事件、发送回复等操作。

## 可用信息

每个 `ctx` 都包含：

```ts
ctx.update;
ctx.api;
ctx.message;
ctx.event;
ctx.chatId;
ctx.channelId;
ctx.communityId;
ctx.userId;
ctx.messageId;
ctx.text;
```

含义如下：

- `ctx.update`：当前原始 update，形态为 `{ type: "message", message }` 或 `{ type: "event", event }`。
- `ctx.api`：当前 bot 的 `Api` 实例，等同于 `bot.api`。
- `ctx.message`：当前 update 是消息时存在。
- `ctx.event`：当前 update 是事件时存在。
- `ctx.channelId` / `ctx.chatId`：来自 `channel_id` 的便捷别名。
- `ctx.communityId`：来自 `community_id`。
- `ctx.userId`：来自 `user_id`。
- `ctx.messageId`：来自 `message_id`。
- `ctx.text`：当前消息的 `content`。

示例：

```ts
bot.on("message:text", async (ctx) => {
  console.log(ctx.userId, ctx.channelId, ctx.text);
  await ctx.reply("已收到");
});
```

## 快捷方法

当前 `Context` 提供这些快捷方法：

```ts
ctx.reply(content, options?);
ctx.replyMarkdown(content, options?);
ctx.editMessage(content, options?);
ctx.deleteMessage();
ctx.react(reaction);
```

它们都基于 `ctx.api` 实现。例如：

```ts
await ctx.reply("hello");
```

等价于使用当前频道和当前消息 ID 调用：

```ts
await ctx.api.sendMessage({
  channel_id: ctx.channelId!,
  content: "hello",
  quote_id: ctx.messageId,
});
```

## 通过 Has Checks 进行检测

grammY 文档中常提到 “has checks”：先确认上下文里是否存在某类数据，再安全访问。当前 SDK 没有内置 `ctx.has(...)` 类型守卫方法，但你可以用普通 TypeScript 条件判断完成同样的事。

判断当前 update 是否是消息：

```ts
bot.use(async (ctx, next) => {
  if (ctx.message) {
    console.log("message id:", ctx.message.message_id);
  }

  await next();
});
```

判断当前 update 是否是事件：

```ts
bot.on("event", async (ctx) => {
  if (!ctx.event) return;

  console.log(ctx.event.action, ctx.event.data);
});
```

判断是否有文本：

```ts
bot.on("message", async (ctx) => {
  if (!ctx.text) return;

  if (ctx.text.startsWith("/")) {
    await ctx.reply("这是一个命令样式的消息");
  }
});
```

推荐优先使用更精确的 filter，例如 `message:text`、`event:Reaction`，减少手写判断。

## 上下文对象是如何被创造的

`bot.start()` 会轮询 `bot.api.getUpdates()`。底层返回数据中：

- `im` 数组会转换成 `{ type: "message", message }`
- `event` 数组会转换成 `{ type: "event", event }`

每一个转换后的 update 都会创建一个新的 `Context`：

```ts
new Context({
  update,
  api: bot.api,
});
```

然后这个 `ctx` 会按注册顺序进入 middleware 链。

```ts
bot.use(async (ctx, next) => {
  console.log("before");
  await next();
  console.log("after");
});

bot.on("message:text", async (ctx) => {
  await ctx.reply("handled");
});
```

如果某个 middleware 不调用 `next()`，后续 middleware 不会继续执行。

## 不提供的上下文能力

当前 SDK 不提供以下 grammY 中常见的上下文能力：

- `ctx.has(...)`
- `ctx.match`
- `ctx.callbackQuery`
- `ctx.answerCallback`
- session 或 conversation 相关字段

这些能力不会被假装存在。需要时应基于当前 `ctx.message`、`ctx.event` 和 `ctx.api` 自行组合。
