# grammY-style Open API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `@teamgaga/open-api` as a grammY-style TypeScript SDK with `Bot`, `Composer`, `Context`, typed `Api`, OAuth support, and unified errors.

**Architecture:** `Api` and `OAuth` sit on an internal HTTP `ApiClient`, while `Bot` owns an `Api` and dispatches polled updates through `Composer` middleware. `Context` wraps each update and provides grammY-like shortcuts such as `ctx.reply`.

**Tech Stack:** TypeScript ESM, vite-plus test runner, native `fetch`, Node 22.

---

## File Structure

- Create `src/errors.ts`: `ApiError` and related response metadata.
- Replace `src/client.ts`: shared HTTP client with auth schemes, query/body/form-data helpers, and response envelope unwrapping.
- Replace `src/types.ts`: public re-export hub for type modules.
- Create `src/types/models.ts`: documented TeamGaga response models.
- Create `src/types/api.ts`: Bot API parameter and option types.
- Create `src/types/bot.ts`: bot, polling, update, and middleware types.
- Create `src/types/context.ts`: context-related helper types.
- Create `src/types/oauth.ts`: OAuth parameter and response types.
- Create `src/api.ts`: public Bot API facade.
- Create `src/oauth.ts`: public OAuth facade.
- Create `src/composer.ts`: middleware composition and filter registration.
- Replace `src/context.ts`: per-update context and helper methods.
- Replace `src/bot.ts`: runtime, polling loop, stop/catch integration.
- Replace `src/index.ts`: clean public exports.
- Replace `test/client.test.ts`: shared HTTP client and error tests.
- Add `test/api.test.ts`: endpoint mapping tests.
- Replace `test/bot.test.ts`: bot runtime and context tests.
- Add `test/composer.test.ts`: middleware/filter tests.
- Add `test/oauth.test.ts`: OAuth auth scheme tests.
- Modify `README.md`: new from-zero usage examples.

## Task 1: Shared Client, Errors, and Types

**Files:**

- Create: `src/errors.ts`
- Modify: `src/client.ts`
- Modify: `src/types.ts`
- Create: `src/types/models.ts`
- Create: `src/types/api.ts`
- Create: `src/types/oauth.ts`
- Test: `test/client.test.ts`

- [ ] **Step 1: Write failing client and error tests**

```ts
import { expect, test, vi } from "vite-plus/test";
import { Client } from "../src/client";
import { ApiError } from "../src/errors";

test("Client unwraps successful TeamGaga envelopes", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: { ok: true },
      request_id: "request-id",
    }),
  );
  const client = new Client({
    token: "token",
    auth: "Bot",
    fetch: fetchMock as unknown as typeof fetch,
  });

  const result = await client.request<{ ok: boolean }>("/bot/v1/me", { method: "GET" });

  expect(result).toEqual({ ok: true });
  expect(fetchMock).toHaveBeenCalledWith(
    new URL("https://open.teamgaga.com/bot/v1/me"),
    expect.objectContaining({ method: "GET" }),
  );
});

test("Client serializes query params and bot auth header", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json({ status: true, code: 1000, message: "Ok", data: [], request_id: "request-id" }),
  );
  const client = new Client({
    token: "token",
    auth: "Bot",
    fetch: fetchMock as unknown as typeof fetch,
  });

  await client.request("/bot/v1/messages", {
    method: "GET",
    query: { limit: 10, filter: ["im", "event"] },
  });

  const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
  expect(url.toString()).toBe(
    "https://open.teamgaga.com/bot/v1/messages?limit=10&filter=im&filter=event",
  );
  expect((init.headers as Headers).get("Authorization")).toBe("Bot token");
});

test("Client throws ApiError for failed envelopes", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json({
      status: false,
      code: 4001,
      message: "Nope",
      data: null,
      request_id: "request-id",
    }),
  );
  const client = new Client({
    token: "token",
    auth: "Bot",
    fetch: fetchMock as unknown as typeof fetch,
  });

  await expect(client.request("/bot/v1/me", { method: "GET" })).rejects.toMatchObject({
    name: "ApiError",
    code: 4001,
    request_id: "request-id",
    status: 200,
    message: "Nope",
  });
});

test("Client throws ApiError for non-2xx HTTP responses", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json(
      { status: false, code: 5000, message: "Broken", data: null, request_id: "request-id" },
      { status: 500 },
    ),
  );
  const client = new Client({
    token: "token",
    auth: "Bot",
    fetch: fetchMock as unknown as typeof fetch,
  });

  await expect(client.request("/bot/v1/me", { method: "GET" })).rejects.toBeInstanceOf(ApiError);
});
```

- [ ] **Step 2: Run red test**

Run: `pnpm test test/client.test.ts`

Expected: FAIL because `Client` does not accept `{ token, auth }` and does not expose the new request shape.

- [ ] **Step 3: Implement minimal client, errors, and core types**

Create `ApiError`, rewrite `Client` around `request(path, options)`, add query serialization, JSON body serialization, auth header schemes, and response envelope unwrapping.

- [ ] **Step 4: Run green test**

Run: `pnpm test test/client.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/errors.ts src/client.ts src/types.ts src/types test/client.test.ts
git commit -m "feat: add shared TeamGaga HTTP client"
```

## Task 2: Typed Bot Api Facade

**Files:**

- Create: `src/api.ts`
- Modify: `src/types/api.ts`
- Modify: `src/types/models.ts`
- Test: `test/api.test.ts`

- [ ] **Step 1: Write failing Api endpoint tests**

```ts
import { expect, test, vi } from "vite-plus/test";
import { Api } from "../src/api";

function createApi() {
  const fetchMock = vi.fn(async () =>
    Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: { message_id: "message-1" },
      request_id: "request-id",
    }),
  );
  return {
    api: new Api("token", { fetch: fetchMock as unknown as typeof fetch }),
    fetchMock,
  };
}

test("sendMessage uses latest v2 endpoint without versioned method name", async () => {
  const { api, fetchMock } = createApi();

  await api.sendMessage({ channel_id: "channel-1", content: "hello", quote_id: "message-0" });

  expect(fetchMock).toHaveBeenCalledWith(
    new URL("https://open.teamgaga.com/bot/v2/messages"),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ channel_id: "channel-1", content: "hello", quote_id: "message-0" }),
    }),
  );
});

test("getUpdates maps polling options to query params", async () => {
  const { api, fetchMock } = createApi();

  await api.getUpdates({ limit: 5, allowed_updates: ["message", "event"] });

  const [url] = fetchMock.mock.calls[0] as [URL, RequestInit];
  expect(url.toString()).toBe(
    "https://open.teamgaga.com/bot/v1/messages?limit=5&filter=im&filter=event",
  );
});

test("community and role methods use documented paths", async () => {
  const { api, fetchMock } = createApi();

  await api.getCommunity("community-1");
  await api.getCommunityRoleMembers("community-1", "role-1", { limit: 20, after: "cursor" });

  expect((fetchMock.mock.calls[0] as [URL, RequestInit])[0].pathname).toBe(
    "/bot/v1/communities/community-1",
  );
  expect((fetchMock.mock.calls[1] as [URL, RequestInit])[0].toString()).toBe(
    "https://open.teamgaga.com/bot/v1/communities/community-1/roles/role-1/members?limit=20&after=cursor",
  );
});
```

- [ ] **Step 2: Run red test**

Run: `pnpm test test/api.test.ts`

Expected: FAIL because `src/api.ts` does not exist.

- [ ] **Step 3: Implement minimal `Api` facade**

Add all phase-one methods from the design, using `Client` internally and passing documented snake_case params through to JSON/query fields.

- [ ] **Step 4: Run green test**

Run: `pnpm test test/api.test.ts test/client.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api.ts src/types/api.ts src/types/models.ts test/api.test.ts
git commit -m "feat: add typed bot api facade"
```

## Task 3: Composer and Context

**Files:**

- Create: `src/composer.ts`
- Create: `src/context.ts`
- Create: `src/types/bot.ts`
- Create: `src/types/context.ts`
- Test: `test/composer.test.ts`

- [ ] **Step 1: Write failing Composer and Context tests**

```ts
import { expect, test, vi } from "vite-plus/test";
import { Composer } from "../src/composer";
import { Context } from "../src/context";

function createContext(content = "/ping hello") {
  const api = { sendMessage: vi.fn(async () => ({ message_id: "reply-1" })) };
  const ctx = new Context({
    update: {
      type: "message",
      message: {
        channel_id: "channel-1",
        user_id: "user-1",
        message_id: "message-1",
        channel_type: 0,
        content,
        created_at: "2026-05-07T00:00:00Z",
      },
    },
    api: api as never,
  });
  return { ctx, api };
}

test("Composer dispatches command middleware", async () => {
  const composer = new Composer();
  const handler = vi.fn();
  composer.command("ping", handler);
  const { ctx } = createContext("/ping hello");

  await composer.middleware()(ctx);

  expect(handler).toHaveBeenCalledWith(ctx, expect.any(Function));
});

test("Composer dispatches message:text filters", async () => {
  const composer = new Composer();
  const handler = vi.fn();
  composer.on("message:text", handler);
  const { ctx } = createContext("plain text");

  await composer.middleware()(ctx);

  expect(handler).toHaveBeenCalled();
});

test("Context reply quotes current message", async () => {
  const { ctx, api } = createContext("hello");

  await ctx.reply("pong");

  expect(api.sendMessage).toHaveBeenCalledWith({
    channel_id: "channel-1",
    content: "pong",
    quote_id: "message-1",
  });
});
```

- [ ] **Step 2: Run red test**

Run: `pnpm test test/composer.test.ts`

Expected: FAIL because `Composer` and `Context` do not exist in the new form.

- [ ] **Step 3: Implement Composer and Context**

Implement middleware composition, `use`, `on`, `command`, `filter`, and context shortcuts. Do not add `ctx.answerCallback`.

- [ ] **Step 4: Run green test**

Run: `pnpm test test/composer.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/composer.ts src/context.ts src/types/bot.ts src/types/context.ts test/composer.test.ts
git commit -m "feat: add composer and context"
```

## Task 4: Bot Runtime

**Files:**

- Modify: `src/bot.ts`
- Test: `test/bot.test.ts`

- [ ] **Step 1: Write failing Bot runtime tests**

```ts
import { expect, test, vi } from "vite-plus/test";
import { Bot } from "../src/bot";

test("Bot polls updates and dispatches message contexts", async () => {
  const abort = new AbortController();
  const fetchMock = vi.fn(async (_url: URL, init: RequestInit) => {
    if (init.method === "GET") {
      abort.abort();
      return Response.json({
        status: true,
        code: 1000,
        message: "Ok",
        data: {
          im: [
            {
              channel_id: "channel-1",
              user_id: "user-1",
              message_id: "message-1",
              channel_type: 0,
              content: "/ping",
              created_at: "2026-05-07T00:00:00Z",
            },
          ],
          event: [],
        },
        request_id: "request-id",
      });
    }
    return Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: { message_id: "reply-1" },
      request_id: "request-id",
    });
  });

  const bot = new Bot("token", { fetch: fetchMock as unknown as typeof fetch });
  bot.command("ping", async (ctx) => {
    await ctx.reply("pong");
  });

  await bot.start({ interval: 1, signal: abort.signal });

  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1]?.[1]?.body).toBe(
    JSON.stringify({
      channel_id: "channel-1",
      content: "pong",
      quote_id: "message-1",
    }),
  );
});

test("Bot catch handles middleware errors and continues polling batch", async () => {
  const abort = new AbortController();
  const fetchMock = vi.fn(async () => {
    abort.abort();
    return Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: {
        im: [
          {
            channel_id: "c1",
            user_id: "u1",
            message_id: "m1",
            channel_type: 0,
            content: "first",
            created_at: "2026-05-07T00:00:00Z",
          },
          {
            channel_id: "c2",
            user_id: "u2",
            message_id: "m2",
            channel_type: 0,
            content: "second",
            created_at: "2026-05-07T00:00:00Z",
          },
        ],
        event: [],
      },
      request_id: "request-id",
    });
  });
  const bot = new Bot("token", { fetch: fetchMock as unknown as typeof fetch });
  const errors: unknown[] = [];
  const seen: string[] = [];
  bot.on("message:text", (ctx) => {
    seen.push(ctx.text ?? "");
    if (ctx.text === "first") throw new Error("boom");
  });
  bot.catch((error) => errors.push(error));

  await bot.start({ interval: 1, signal: abort.signal });

  expect(errors).toHaveLength(1);
  expect(seen).toEqual(["first", "second"]);
});
```

- [ ] **Step 2: Run red test**

Run: `pnpm test test/bot.test.ts`

Expected: FAIL because `Bot` still uses the prototype handler model.

- [ ] **Step 3: Implement Bot runtime**

Make `Bot` extend `Composer`, own `api`, support `start`, `stop`, `catch`, polling options, update conversion, and per-update error handling.

- [ ] **Step 4: Run green test**

Run: `pnpm test test/bot.test.ts test/composer.test.ts test/api.test.ts test/client.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bot.ts test/bot.test.ts
git commit -m "feat: add grammY-style bot runtime"
```

## Task 5: OAuth Facade and Public Exports

**Files:**

- Create: `src/oauth.ts`
- Modify: `src/index.ts`
- Modify: `src/types/oauth.ts`
- Test: `test/oauth.test.ts`

- [ ] **Step 1: Write failing OAuth and export tests**

```ts
import { expect, test, vi } from "vite-plus/test";
import { OAuth, Bot, Api, ApiError } from "../src";

test("public exports include new primary classes", () => {
  expect(Bot).toBeDefined();
  expect(Api).toBeDefined();
  expect(OAuth).toBeDefined();
  expect(ApiError).toBeDefined();
});

test("OAuth createToken uses Oauth base credential auth", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: { access_token: "access", refresh_token: "refresh", expire: 3600 },
      request_id: "request-id",
    }),
  );
  const oauth = new OAuth({
    app_id: "app",
    app_secret: "secret",
    fetch: fetchMock as unknown as typeof fetch,
  });

  await oauth.createToken({ grant_type: "access_token", code: "code" });

  const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
  expect((init.headers as Headers).get("Authorization")).toBe("Oauth YXBwOnNlY3JldA==");
});

test("OAuth getUser uses Access auth", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: { user_id: "user-1" },
      request_id: "request-id",
    }),
  );
  const oauth = new OAuth({
    app_id: "app",
    app_secret: "secret",
    fetch: fetchMock as unknown as typeof fetch,
  });

  await oauth.getUser("access-token");

  const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
  expect((init.headers as Headers).get("Authorization")).toBe("Access access-token");
});
```

- [ ] **Step 2: Run red test**

Run: `pnpm test test/oauth.test.ts`

Expected: FAIL because `OAuth`, `Api`, and `ApiError` are not exported yet.

- [ ] **Step 3: Implement OAuth and public exports**

Add `OAuth` wrapper methods and update `src/index.ts` to export only the new clean public surface.

- [ ] **Step 4: Run green test**

Run: `pnpm test test/oauth.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/oauth.ts src/index.ts src/types/oauth.ts test/oauth.test.ts
git commit -m "feat: add oauth facade and public exports"
```

## Task 6: README and Full Verification

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Update README**

Replace prototype examples with the new `Bot`, `bot.api`, and `OAuth` examples. State the endpoint version policy: public methods use the newest documented endpoint without version suffixes.

- [ ] **Step 2: Run full verification**

Run: `pnpm run ready`

Expected: typecheck, tests, and build pass.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update sdk usage guide"
```

## Self-Review

- Spec coverage: Covered Bot, Composer, Context, Api, OAuth, Client, errors, latest endpoint policy, no legacy compatibility, and README update.
- Intentional omission: `ctx.answerCallback` is not part of this SDK.
- Placeholder scan: No placeholder steps are required for execution; implementation choices are constrained by exact files, tests, and expected commands.
- Type consistency: Public inputs and server models both use documented snake_case fields.
