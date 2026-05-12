# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

```bash
pnpm run ready        # Full CI pipeline: lint + fmt check + typecheck + test + build
pnpm run build        # Bundle the library (vp pack)
pnpm run dev          # Watch mode build
pnpm run test         # Run tests (vp test)
pnpm run check        # Lint + format check + typecheck
pnpm run check:fix    # Lint + format check + typecheck with auto-fixes
pnpm run fmt          # Format source files
pnpm run lint         # Lint only
pnpm run typecheck    # TypeScript type checking only (no emit)
```

Single test (vitest filter pattern):

```bash
pnpm exec vp test -t "test name substring"
```

## Architecture

This is a TypeScript SDK for the TeamGaga Open Platform bot API — a chat platform where bots poll for messages over HTTP. The package bundles to ESM (`dist/index.mjs` + `.d.mts` types). There are zero runtime dependencies.

**Module graph**

```
src/types.ts         — All type definitions (no logic)
src/client.ts        — Low-level REST client for the TeamGaga API
                         ↳ Depends on: types.ts
src/bot.ts           — High-level bot framework with polling loop
                         ↳ Depends on: client.ts, types.ts
src/index.ts         — Public API surface (barrel re-export)
                         ↳ Depends on: client.ts, bot.ts, types.ts
```

**Key design points**

- `Client` (in [client.ts](src/client.ts)) is the HTTP layer. It handles auth headers (`Bot <token>`), response unwrapping (`TeamGagaApiResponse<T> → T.data`), and error mapping. Accepts an optional custom `fetch` implementation in constructor options — this enables testing with `vi.fn()` mocks rather than network-level mocking.
- `Bot` (in [bot.ts](src/bot.ts)) wraps `Client` and adds a polling loop with an in-memory handler registry. `bot.on("message", handler)` pushes to an array; `bot.start({ pollInterval, signal })` polls in a `while` loop, dispatching each message through all registered handlers. The `signal` parameter (an `AbortSignal`) is the graceful shutdown mechanism.
- `MessageContext` (in [bot.ts](src/bot.ts)) is the shape passed to each message handler: `{ message, text, reply }`. `text` is `message.content` for convenience; `reply(content)` calls `client.sendMessage` quoting the triggering message.
- `verbatimModuleSyntax` is enabled — all type-only imports must use `import type` or `export type`.

**Release process**

Manual: `pnpm run release:patch|minor|major` (see [scripts/release.mjs](scripts/release.mjs)). The script checks clean git working tree, verifies you're on `main`, bumps `package.json` version, runs `pnpm run ready` + `pnpm pack --dry-run`, then commits and tags. Pushing the tag triggers the GitHub Actions workflow in `.github/workflows/publish.yml` which publishes to npm.
