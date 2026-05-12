# 错误处理

本文介绍 SDK 中 API 错误、中间件错误和轮询错误的处理方式。

## ApiError

当 HTTP 响应不是 2xx，或接口返回 envelope 中的 `status` 为 `false` 时，SDK 会抛出 `ApiError`。

```ts
import { ApiError } from "@teamgaga/open-api";

try {
  await bot.api.getMe();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status);
    console.error(error.code);
    console.error(error.request_id);
    console.error(error.message);
  }
}
```

`ApiError` 包含：

- `status`：HTTP 状态码。
- `code`：业务错误码，取自接口返回。
- `request_id`：接口返回的请求 ID。
- `response`：原始 `Response` 对象。
- `message`：错误信息。

## bot.catch

middleware 或 handler 中抛出的错误会交给 `bot.catch`。

```ts
bot.catch((error, ctx) => {
  console.error("bot error", error);
  console.error("update", ctx?.update);
});
```

如果没有注册 `bot.catch`，错误会继续抛出。

## 单个 update 的错误

`Bot` 会把每个 update 转成独立的 `Context` 并逐个处理。如果某个 update 的 middleware 抛错，且你注册了 `bot.catch`，SDK 会调用错误处理器，然后继续处理同一批次里的后续 update。

```ts
bot.on("message", async (ctx) => {
  if (ctx.text === "boom") {
    throw new Error("broken message");
  }
});

bot.catch((error, ctx) => {
  console.error("failed text:", ctx?.text);
});
```

## API 调用错误

API 调用错误也可以在业务代码中局部捕获。

```ts
bot.command("me", async (ctx) => {
  try {
    const me = await ctx.api.getMe();
    await ctx.reply(`bot: ${me.name}`);
  } catch (error) {
    if (error instanceof ApiError) {
      await ctx.reply(`API 调用失败：${error.message}`);
      return;
    }

    throw error;
  }
});
```

如果局部不捕获，错误会进入 `bot.catch`。

## transformer 中的错误

`bot.api.use` 注册的 transformer 如果抛错，调用方会收到该错误。

```ts
bot.api.use(async (prev, method, payload, signal) => {
  if (method === "sendMessage") {
    console.log("sending message");
  }

  return prev(method, payload, signal);
});
```

如果 transformer 用于重试、限流或日志，建议避免吞掉未知错误。除非你明确知道如何恢复，否则应重新抛出。

## 轮询错误

`bot.start()` 内部会调用 `api.getUpdates()`。如果拉取更新失败，该错误会进入 `bot.catch`。如果没有注册错误处理器，`bot.start()` 会抛出错误。

```ts
bot.catch((error) => {
  console.error("polling or middleware error", error);
});

await bot.start();
```

## 推荐实践

- 在生产环境始终注册 `bot.catch`。
- 对关键 API 调用做局部 `try/catch`，给用户返回可理解的提示。
- 不要在错误处理中打印 bot token。
- 对 `ApiError` 记录 `status`、`code`、`request_id`，便于排查。
- 未知错误不要静默吞掉。
