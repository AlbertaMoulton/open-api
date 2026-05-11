# 消息表态

消息表态用于对一条消息添加、启用或禁用反应。当前 SDK 涉及的 API 是 `setMessageReaction`，上下文快捷方法是 `ctx.react`。

## 使用 bot.api.setMessageReaction

你可以直接指定频道 ID 和消息 ID：

```ts
await bot.api.setMessageReaction("channel-id", "message-id", {
  enable: true,
  name: "thumbs_up",
});
```

`name` 需要使用 SDK 支持的表态名称：

```text
ok, thumbs_up, hand_ok, applause, fist_bump, plus_one, get, blush, laugh, smile,
support, whimper, obsessed, show_off, adoration, tongue, terror, sob, toasted,
angry, apathy, lol, disbelief, kiss, scrunch, dizzy, sleep, strive, shocked,
phone_frustrated, facepalm, hug, see_no_evil, speak_no_evil, hear_no_evil,
disapproval, thumbs_down, watermelon, rose, heart, confetti, clown, monster,
flame, rainbow, poop, check_mark, cross_mark, 100, eyes, yes, no, number_1,
number_2, number_3, number_4, option_A, option_B, option_C, option_D
```

## 使用 ctx.react

在消息处理函数中，你通常可以直接对当前消息表态：

```ts
bot.on("message", async (ctx) => {
  if (ctx.text === "赞") {
    await ctx.react({ name: "thumbs_up" });
  }
});
```

`ctx.react` 会自动读取当前上下文中的 `channel_id` 和 `message_id`，并默认设置 `enable: true`。

等价于：

```ts
await ctx.api.setMessageReaction(ctx.channelId!, ctx.messageId!, {
  enable: true,
  name: "thumbs_up",
});
```

## 取消或禁用表态

传入 `enable: false`：

```ts
await ctx.react({
  enable: false,
  name: "thumbs_up",
});
```

或者使用 API 方法：

```ts
await bot.api.setMessageReaction("channel-id", "message-id", {
  enable: false,
  name: "thumbs_up",
});
```

## 监听 Reaction 事件

如果你要处理用户对消息的表态事件，可以监听 `event:Reaction`。

```ts
bot.on("event:Reaction", async (ctx) => {
  console.log(ctx.event?.data);
});
```

`ctx.event.data` 的具体结构取决于服务端事件内容。当前 SDK 不会对它做额外转换。

## 常见错误

`ctx.react` 需要当前上下文有 `channel_id` 和 `message_id`。如果你在没有消息 ID 的事件上调用它，会抛出错误。

```ts
bot.on("event", async (ctx) => {
  // 不推荐：普通事件未必有 message_id
  if (ctx.messageId) {
    await ctx.react({ name: "thumbs_up" });
  }
});
```

更稳妥的方式是只在消息处理器里使用：

```ts
bot.on("message", async (ctx) => {
  await ctx.react({ name: "ok" });
});
```
