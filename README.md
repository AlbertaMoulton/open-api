# TeamGaga Open API SDK for JavaScript

TypeScript-first SDK for building TeamGaga bots and OAuth integrations.

The bot runtime follows a grammY-style shape: `Bot` runs polling, `Composer` routes middleware, `Context` wraps every update, and `Api` exposes typed TeamGaga Bot API methods.

## Install

```bash
pnpm add @teamgaga/open-api
```

## Bot Example

```ts
import { Bot } from "@teamgaga/open-api";

const bot = new Bot(process.env.TEAMGAGA_BOT_TOKEN!);

bot.command("ping", async (ctx) => {
  await ctx.reply("pong");
});

bot.on("message", async (ctx) => {
  if (ctx.text === "roll") {
    const point = Math.floor(Math.random() * 6) + 1;
    await ctx.reply(`You rolled ${point}.`);
  }
});

await bot.start({
  interval: 3000,
  allowed_updates: ["message", "event"],
});
```

## API Example

```ts
import { Bot } from "@teamgaga/open-api";

const bot = new Bot(process.env.TEAMGAGA_BOT_TOKEN!);

const me = await bot.api.getMe();

await bot.api.sendMessage({
  channel_id: "channel-id",
  content: `Hello from ${me.name}.`,
});
```

Public API methods always use the newest documented endpoint for a feature and do not include version suffixes. For example, `bot.api.sendMessage(...)` calls `POST /bot/v2/messages`.

## Raw API and Transformers

`bot.api` is the friendly method facade. For lower-level integrations, `bot.api.raw` exposes documented payload fields directly:

```ts
await bot.api.raw.sendMessage({
  channel_id: "channel-id",
  content: "Hello from the raw API.",
});
```

API transformers can observe or modify calls before they are sent. This is useful for logging, rate limiting, retries, or metrics:

```ts
bot.api.use(async (prev, method, payload, signal) => {
  console.log(method);
  return prev(method, payload, signal);
});
```

For transformers that only target one method, use `MethodTransformer<"methodName">` to get exact payload and result types for that method.

Callback events can be handled with `bot.on("event:Callback", ...)`. The SDK does not provide an `answerCallback` helper.

## OAuth Example

```ts
import { OAuth } from "@teamgaga/open-api";

const oauth = new OAuth({
  app_id: process.env.TEAMGAGA_APP_ID!,
  app_secret: process.env.TEAMGAGA_APP_SECRET!,
});

const token = await oauth.createToken({
  grant_type: "access_token",
  code: "authorization-code",
});

const user = await oauth.getUser(token.access_token);
const communities = await oauth.getCommunities(token.access_token);
```

## Error Handling

```ts
import { ApiError } from "@teamgaga/open-api";

try {
  await bot.api.getMe();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status, error.code, error.request_id, error.message);
  }
}
```

## Release

Configure npm Trusted Publishing for `@teamgaga/open-api`:

- Publisher: GitHub Actions
- Owner: `AlbertaMoulton`
- Repository: `open-api`
- Workflow filename: `publish.yml`

Then create a release tag from `main`:

```bash
pnpm run release:patch
git push origin main v0.1.3
```

Use `minor` or `major` when needed. The release script updates `package.json`, runs checks, tests, build, and `pnpm pack --dry-run`, then commits the version bump and creates the tag. GitHub Actions publishes tagged releases to npm.
