# 发送和接收信息

本文介绍如何使用 `@teamgaga/open-api` 接收消息、发送消息，以及发送带回复关系的消息。SDK 的使用方式参考了 grammY 的组织思路，但示例均基于当前 TeamGaga SDK 已实现的能力。

## 启动 Bot

```ts
import { Bot } from "@teamgaga/open-api";

const bot = new Bot(process.env.TEAMGAGA_BOT_TOKEN!);

await bot.start({
  interval: 3000,
  allowed_updates: ["message", "event"],
});
```

当前 SDK 使用轮询拉取更新。`allowed_updates` 会映射到底层拉消息接口的 `filter` 参数：

- `"message"` 对应 `im`
- `"event"` 对应 `event`

## 接收信息

最常见的方式是监听所有消息：

```ts
bot.on("message", async (ctx) => {
  console.log(ctx.message);
});
```

如果只关心文本消息，可以在消息回调中检查 `ctx.text`：

```ts
bot.on("message", async (ctx) => {
  if (!ctx.text) return;

  console.log(ctx.text);
});
```

命令消息可以用 `bot.command`：

```ts
bot.command("ping", async (ctx) => {
  await ctx.reply("pong");
});
```

`bot.command("ping", ...)` 会匹配 `/ping` 以及 `/ping 后续文本`。当前 SDK 不会自动解析命令参数，你可以从 `ctx.text` 中自行解析。

## 发送信息

你可以通过 `bot.api.sendMessage` 主动发送消息。参数字段保持与 `docs/api` 一致，使用下划线命名。

```ts
await bot.api.sendMessage({
  channel_id: "channel-id",
  content: "Hello from TeamGaga SDK.",
});
```

`sendMessage` 会调用最新版本的接口：`POST /bot/v2/messages`。公开方法名不带版本号。

如果你在消息处理函数中回复当前频道，可以直接使用 `ctx.reply`：

```ts
bot.on("message", async (ctx) => {
  if (!ctx.text) return;

  await ctx.reply(`收到：${ctx.text}`);
});
```

`ctx.reply` 是对 `ctx.api.sendMessage` 的便捷封装，会自动使用当前消息所在的 `channel_id`。

## 发送带回复的信息

默认情况下，`ctx.reply` 会把当前消息的 `message_id` 作为 `quote_id`，也就是回复当前消息。

```ts
bot.on("message", async (ctx) => {
  await ctx.reply("这是对当前消息的回复");
});
```

如果你想回复指定消息，可以传入 `quote_id`：

```ts
await ctx.reply("回复指定消息", {
  quote_id: "message-id",
});
```

如果你只想向同一频道发送消息，但不建立回复关系，可以关闭 quote：

```ts
await ctx.reply("普通消息，不引用当前消息", {
  quote: false,
});
```

## Markdown 消息

如果要发送 Markdown 消息，可以使用 `sendMarkdownMessage` 或 `ctx.replyMarkdown`：

```ts
await bot.api.sendMarkdownMessage({
  channel_id: "channel-id",
  title: "更新",
  content: "**上线完成**",
});

bot.on("message", async (ctx) => {
  await ctx.replyMarkdown("**收到**");
});
```

## 常见注意事项

- 对象参数字段使用下划线，例如 `channel_id`、`quote_id`、`user_ids`。
- `ctx.reply` 需要当前 update 中存在 `channel_id`，否则会抛出错误。
- 当前 SDK 没有 `hears` 方法；如果要做文本匹配，请使用 `bot.on("message", ...)` 后在回调中判断 `ctx.text`。
- 当前 SDK 没有 webhook runner；所有示例都基于 `bot.start()` 轮询。
