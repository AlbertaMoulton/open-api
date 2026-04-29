# TeamGaga Open API SDK for JavaScript

JavaScript and TypeScript SDK for the TeamGaga Open Platform.

## Install

```bash
pnpm add @teamgaga/open-api
```

## Bot Example

```ts
import { Bot } from "@teamgaga/open-api";

const bot = new Bot(process.env.TEAMGAGA_BOT_TOKEN!);

bot.on("message", async (ctx) => {
  if (ctx.text !== "roll") return;

  const point = Math.floor(Math.random() * 6) + 1;
  await ctx.reply(`You rolled ${point}.`);
});

bot.start({ pollInterval: 3000 });
```

TeamGaga bots currently receive messages by polling. Keep `pollInterval` at `3000` milliseconds or higher unless you have a good reason to change it.

## API Client Example

```ts
import { Client } from "@teamgaga/open-api";

const client = new Client({
  botToken: process.env.TEAMGAGA_BOT_TOKEN!,
});

const messages = await client.pollMessages();

await client.sendMessage({
  channelId: messages.im[0].channel_id,
  content: "Hello from TeamGaga SDK.",
  quoteId: messages.im[0].message_id,
});
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
