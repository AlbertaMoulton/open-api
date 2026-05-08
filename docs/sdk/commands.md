# Commands

命令是一类特殊的文本消息，通常以 `/` 开头。当前 SDK 提供 `bot.command(name, handler)` 来处理命令。

## 基本用法

```ts
bot.command("start", async (ctx) => {
  await ctx.reply("欢迎使用");
});

bot.command("ping", async (ctx) => {
  await ctx.reply("pong");
});
```

`bot.command("ping", ...)` 会匹配：

- `/ping`
- `/ping hello`

不会匹配：

- `ping`
- `/pingpong`

## 读取命令参数

当前 SDK 不内置 `ctx.match` 或命令参数解析。你可以直接从 `ctx.text` 解析。

```ts
bot.command("echo", async (ctx) => {
  const text = ctx.text ?? "";
  const payload = text.replace(/^\/echo\s*/, "");

  if (!payload) {
    await ctx.reply("请在 /echo 后输入要复读的内容");
    return;
  }

  await ctx.reply(payload);
});
```

更严格的写法：

```ts
function commandPayload(text: string, command: string) {
  const prefix = `/${command}`;
  if (text === prefix) return "";
  if (text.startsWith(`${prefix} `)) return text.slice(prefix.length + 1);
  return undefined;
}

bot.command("ban", async (ctx) => {
  const user_id = commandPayload(ctx.text ?? "", "ban");
  if (!user_id) {
    await ctx.reply("用法：/ban <user_id>");
    return;
  }

  if (!ctx.communityId) {
    await ctx.reply("只能在社区上下文中使用");
    return;
  }

  await ctx.api.banCommunityMember(ctx.communityId, { user_id });
  await ctx.reply(`已封禁 ${user_id}`);
});
```

## 命令与 bot.on 的关系

`bot.command` 是一种带条件的 middleware。它可以和 `bot.on("message:text")` 一起使用。

```ts
bot.command("help", async (ctx) => {
  await ctx.reply("可用命令：/help /ping");
});

bot.on("message:text", async (ctx) => {
  if (ctx.text?.startsWith("/")) return;
  await ctx.reply("普通文本消息");
});
```

注册顺序会影响执行顺序。如果前面的 middleware 不调用 `next()`，后面的 middleware 不会继续执行。

## 错误处理

命令处理函数里抛出的错误会进入 `bot.catch`。

```ts
bot.command("boom", async () => {
  throw new Error("broken command");
});

bot.catch((error, ctx) => {
  console.error("command failed", ctx?.text, error);
});
```

## 当前不支持的命令能力

当前 SDK 不提供：

- 命令菜单注册
- 命令参数自动解析
- `ctx.match`
- scoped commands
- i18n 命令名

需要这些能力时，可以先基于 `bot.command` 和普通函数自行封装。
