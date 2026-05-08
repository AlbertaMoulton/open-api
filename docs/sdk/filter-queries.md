# Filter 参数与 bot.on()

`bot.on(filter, handler)` 用来只处理某一类 update。当前 SDK 支持的 filter 是一个小而明确的集合，覆盖消息和事件的常见场景。

## 支持的 filter

```ts
bot.on("message", handler);
bot.on("message:text", handler);
bot.on("message:markdown", handler);
bot.on("event", handler);
bot.on("event:Reaction", handler);
bot.on("event:Join", handler);
bot.on("event:Callback", handler);
bot.on("event:DeleteMessage", handler);
```

`event:*` 的 `*` 对应事件的 `action` 字段。只要接口返回的 `event.action` 与冒号后的文本一致，就会命中。

## 消息 filter

处理所有消息：

```ts
bot.on("message", async (ctx) => {
  console.log(ctx.message);
});
```

处理有文本内容的消息：

```ts
bot.on("message:text", async (ctx) => {
  await ctx.reply(`文本内容：${ctx.text}`);
});
```

处理 Markdown 类型消息：

```ts
bot.on("message:markdown", async (ctx) => {
  console.log(ctx.message);
});
```

当前 `message:markdown` 的判断依据是消息对象的 `type === 15`。如果服务端后续调整消息类型定义，应同步更新 SDK。

## 事件 filter

处理所有事件：

```ts
bot.on("event", async (ctx) => {
  console.log(ctx.event?.action, ctx.event?.data);
});
```

处理 Reaction 事件：

```ts
bot.on("event:Reaction", async (ctx) => {
  console.log("reaction event:", ctx.event?.data);
});
```

处理加入事件：

```ts
bot.on("event:Join", async (ctx) => {
  await ctx.reply("欢迎加入");
});
```

处理 Callback 事件：

```ts
bot.on("event:Callback", async (ctx) => {
  console.log(ctx.event?.data);
});
```

SDK 不提供 `answerCallback` helper。你可以观察 Callback 事件，但当前没有对应的“回复 callback” API。

## 自定义 filter

如果内置 filter 不够，可以使用 `bot.filter(predicate, middleware)`。

```ts
bot.filter(
  (ctx) => ctx.text?.includes("urgent") === true,
  async (ctx) => {
    await ctx.reply("收到紧急消息");
  },
);
```

自定义 filter 返回 `true` 时执行对应 middleware，返回 `false` 时跳过。

## filter 与 middleware 顺序

middleware 按注册顺序执行。`bot.on`、`bot.command`、`bot.filter` 本质上都是带过滤条件的 middleware。

```ts
bot.use(async (ctx, next) => {
  console.log("所有 update 都会经过这里");
  await next();
});

bot.on("message:text", async (ctx, next) => {
  console.log("只有文本消息经过这里");
  await next();
});

bot.command("ping", async (ctx) => {
  await ctx.reply("pong");
});
```

如果某个 middleware 不调用 `next()`，后续 middleware 不会执行。

## 与拉取参数的关系

`bot.start({ allowed_updates })` 用于控制轮询时向服务端请求哪些类型：

```ts
await bot.start({
  allowed_updates: ["message"],
});
```

`bot.on(...)` 用于本地处理时筛选。推荐两者结合使用：先用 `allowed_updates` 减少不需要的 update，再用 `bot.on` 做业务路由。
