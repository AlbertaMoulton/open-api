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

Important: releases are tag-driven. Do not run `npm publish` from a local
machine during the normal release flow. Commit the version bump, push `main`,
then push a matching `vX.Y.Z` tag so GitHub Actions publishes the package.

This package is published to npm by GitHub Actions. Do not publish from a local
machine unless the workflow is unavailable.

### One-time npm setup

Configure npm Trusted Publishing for `@teamgaga/open-api` in the npm package
settings:

- Publisher: GitHub Actions
- Owner: `AlbertaMoulton`
- Repository: `open-api`
- Workflow filename: `publish.yml`
- Environment: leave empty unless the workflow is later changed to use one

The workflow uses npm provenance/OIDC through GitHub Actions, so a local npm
login or an `NPM_TOKEN` secret is not required for normal releases.

### Release steps

1. Make sure all intended code changes are merged or committed on `main`.
2. Make sure the working tree is clean:

   ```bash
   git status --short --branch
   ```

3. Create the version bump commit and matching tag:

   ```bash
   pnpm run release:patch
   ```

   Use `pnpm run release:minor` or `pnpm run release:major` when the change
   requires it.

4. Push both `main` and the generated tag:

   ```bash
   git push origin main vX.Y.Z
   ```

   Replace `vX.Y.Z` with the tag printed by the release script.

### What the release script does

`scripts/release.mjs` protects the local release preparation step:

- aborts if the working tree is dirty
- aborts unless the current branch is `main`
- bumps `package.json`
- runs `pnpm run ready`
- runs `pnpm pack --dry-run`
- commits `release: vX.Y.Z`
- creates the local `vX.Y.Z` tag

### What GitHub Actions does

Pushing a `v*` tag triggers `.github/workflows/publish.yml`. The workflow:

- checks out the tagged commit
- installs Node.js and pnpm dependencies
- runs `pnpm run ready`
- verifies the tag version matches `package.json`
- packs the package into `.release`
- publishes the tarball to npm with public access

### Verify the release

After pushing the tag, check the `Publish Package` workflow run in GitHub
Actions. A successful run should publish the same version as the tag.

You can also verify npm directly:

```bash
npm view @teamgaga/open-api version
```

### Notes and pitfalls

- The workflow only runs for pushed tags matching `v*`; pushing `main` alone
  will not publish to npm.
- Local `npm publish` is not the release path for this project. If it fails
  with an auth or permission error, use the GitHub Actions tag workflow instead
  of trying to fix local npm login for a normal release.
- The tag must match `package.json` exactly. For example, tag `v0.1.7` requires
  `"version": "0.1.7"`.
- Do not reuse or move a published release tag. Create a new patch version
  instead.
- Keep local test fixtures, tokens, and scratch files untracked. The package
  only publishes `dist`, `README.md`, `LICENSE`, and `package.json`, but dirty
  working trees can still block the release script.
- If `npm publish` fails in GitHub Actions with a permission or OIDC error,
  re-check the npm Trusted Publishing settings for owner, repository, workflow
  filename, and package scope.
