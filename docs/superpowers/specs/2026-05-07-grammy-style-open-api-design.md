# grammY-style TeamGaga Open API SDK Design

Date: 2026-05-07

## Purpose

Design `@teamgaga/open-api` as a clean, from-zero TypeScript SDK inspired by grammY's architecture and developer experience. The SDK should make bot development pleasant while keeping the lower-level HTTP API complete, typed, and easy to extend.

The files under `docs/api` are reference inputs only. This design does not modify those files.

## Goals

- Provide a grammY-style bot API with `Bot`, `Composer`, `Context`, and middleware.
- Provide a typed `Api` facade over the TeamGaga Bot API.
- Keep OAuth separate from bot usage because it uses a different authentication model.
- Use the latest endpoint version for each public feature. Public method names must not include version suffixes.
- Avoid compatibility baggage from the current prototype. This is a clean first-principles SDK design.
- Keep server response models close to documented payloads to avoid surprising data reshaping.

## Non-goals

- Do not preserve the current `Client.pollMessages` or `Client.sendMessage` public API.
- Do not expose duplicate public methods for older endpoint versions such as `sendMessageV1` or `sendMessageV2`.
- Do not build a full plugin ecosystem, webhook runner, or code generator in the first implementation phase.
- Do not edit or reorganize `docs/api`.

## Architecture

The SDK should be split into five conceptual layers.

### Bot

`Bot` is the runtime entry point. It owns an `Api` instance, registers middleware, starts and stops polling, converts incoming messages and events into `Context` instances, and routes them through the middleware stack.

### Composer

`Composer` composes middleware and filters. `Bot` should extend or wrap `Composer` so developers can write code in a grammY-like style:

```ts
const bot = new Bot(process.env.TEAMGAGA_BOT_TOKEN!);

bot.command("ping", async (ctx) => {
  await ctx.reply("pong");
});

bot.on("message:text", async (ctx) => {
  await ctx.reply(`You said: ${ctx.text}`);
});

await bot.start();
```

### Context

`Context` represents a single update. It exposes the raw update, typed shortcuts, and convenience methods backed by `ctx.api`.

### Api

`Api` is the public, typed facade over TeamGaga Bot API endpoints. It should use TypeScript-friendly camelCase parameter names while keeping returned server models close to the documented field names.

### Internal ApiClient and Raw HTTP

The lower-level `ApiClient` handles base URL, auth headers, query strings, JSON bodies, multipart form data, response unwrapping, and error construction. It is an internal implementation detail and must not be exported from the package entry point. The public low-level escape hatch should follow grammY's shape: `bot.api.raw` for documented payloads and `bot.api.use(...)` for API call transformers.

## Proposed File Layout

```text
src/
  bot.ts
  composer.ts
  context.ts
  api.ts
  oauth.ts
  client.ts
  errors.ts
  types/
    api.ts
    bot.ts
    context.ts
    models.ts
    oauth.ts
  utils/
    endpoint.ts
    middleware.ts
```

## Public Bot API

`Bot` construction:

```ts
const bot = new Bot(token, {
  base_url: "https://open.teamgaga.com",
  fetch,
  polling: {
    limit: 200,
    interval: 3000,
    allowed_updates: ["message", "event"],
  },
});
```

`Bot` exposes:

```ts
bot.api;
bot.use(middleware);
bot.on(filter, middleware);
bot.command(name, middleware);
bot.filter(predicate, middleware);
bot.start(options);
bot.stop();
bot.catch(errorHandler);
```

First-phase filters:

```ts
"message";
"message:text";
"message:markdown";
"event";
"event:Reaction";
"event:Join";
"event:Callback";
```

`command(name, middleware)` should match text messages whose text starts with `/${name}`. The implementation should leave room for command parsing improvements later, but the first phase should keep the rule simple and predictable.

## Middleware Model

Middleware should follow grammY's shape:

```ts
type Middleware<C extends Context = Context> = (
  ctx: C,
  next: () => Promise<void>,
) => unknown | Promise<unknown>;
```

Middleware runs in registration order. A middleware may stop propagation by not calling `next`.

Errors thrown by middleware should flow to `bot.catch(handler)`. If no error handler is registered, `Bot.start()` should surface or log errors in a documented way. Polling should continue after a handled per-update error.

## Context API

`Context` should expose:

```ts
ctx.update;
ctx.api;
ctx.message;
ctx.event;
ctx.chatId;
ctx.channel_id;
ctx.communityId;
ctx.userId;
ctx.messageId;
ctx.text;
```

Convenience methods:

```ts
ctx.reply(content, options?);
ctx.replyMarkdown(content, options?);
ctx.editMessage(content, options?);
ctx.deleteMessage();
ctx.react(reaction);
ctx.answerCallback(data?);
```

`ctx.reply` should send to the current channel and quote the current message when a message ID is available. Options should allow callers to override quote behavior and pass message fields such as attachments, reactions, ephemeral visibility, and rich text flags.

`ctx.answerCallback` should not be included until a documented callback response endpoint is available. The current API references define callback event payloads, but they do not document how a bot should acknowledge or answer such callbacks.

## Public Api Facade

The first phase should cover the Bot API main surface from `docs/api/new_general.md`.

Message methods:

```ts
api.getUpdates(options?);
api.sendMessage(params);
api.sendBatchMessages(params);
api.sendMarkdownMessage(params);
api.editMessage(messageId, params);
api.deleteMessage(channel_id, messageId);
api.setMessageReaction(channel_id, messageId, params);
api.addMessageKeys(params);
api.deleteMessageKey(params);
```

Community methods:

```ts
api.getCommunity(communityId);
api.getCommunityChannels(communityId);
api.getCommunityMembers(communityId, options?);
api.getCommunityMemberCount(communityId);
api.getCommunityOwner(communityId);
api.banCommunityMember(communityId, params);
api.unbanCommunityMember(communityId, userId);
api.muteCommunityMember(communityId, userId, params);
api.unmuteCommunityMember(communityId, userId);
```

Role methods:

```ts
api.getCommunityRoles(communityId);
api.updateCommunityMemberRoles(communityId, params);
api.getCommunityRoleMembers(communityId, roleId, options?);
```

User, DM, bot, and image methods:

```ts
api.getUser(userId, options?);
api.createDmChannel(userId);
api.getMe();
api.uploadImage(params);
```

`Api` should also expose a grammY-style transformable raw layer:

```ts
api.raw.sendMessage({
  channel_id: "channel-id",
  content: "Hello",
});

api.use(async (prev, method, payload, signal) => {
  return prev(method, payload, signal);
});
```

`Client` or `ApiClient` must not be exported from `src/index.ts`.

The raw layer should cover the Bot API methods implemented by the facade so transformers can observe both raw calls and facade calls.

## Endpoint Version Policy

For the same feature, the public `Api` must use the latest documented endpoint version and expose an unversioned method name.

Example:

```ts
api.sendMessage(params);
```

must call:

```text
POST /bot/v2/messages
```

The SDK must not expose public methods named `sendMessageV1` or `sendMessageV2`.

Older endpoints may exist inside private endpoint metadata or an advanced raw layer later, but they should not appear in the primary public API.

## OAuth API

OAuth should be a separate entry point because it uses `Oauth` and `Access` auth headers instead of bot tokens.

```ts
import { OAuth } from "@teamgaga/open-api";

const oauth = new OAuth({
  app_id,
  app_secret,
});

const token = await oauth.createToken({
  grant_type: "access_token",
  code,
});

const user = await oauth.getUser(token.access_token);
const communities = await oauth.getCommunities(token.access_token);
```

OAuth methods:

```ts
oauth.createToken(params);
oauth.getUser(accessToken);
oauth.getCommunities(accessToken);
```

The token request should send:

```text
Authorization: Oauth <base64(app_id:app_secret)>
```

OAuth resource requests should send:

```text
Authorization: Access <access_token>
```

## Type Strategy

Public request parameter types should use camelCase names:

```ts
type SendMessageParams = {
  channel_id: string;
  content: string;
  type?: number;
  attachments?: Attachment[];
  ephemeral?: boolean;
  user_ids?: string[];
  disable_reactions?: boolean;
  reactions?: ReactionItem[];
  richtext?: boolean;
  quote_id?: string;
};
```

Server response models should stay close to documented JSON:

```ts
type Message = {
  channel_id: string;
  user_id: string;
  message_id: string;
  content: string;
  created_at: string;
};
```

This creates a clear rule: inputs are ergonomic TypeScript, outputs are faithful API data.

Type names should prefer:

- `Params` for public method inputs.
- `Response` for response payloads.
- Documented model names for server objects, such as `Community`, `Channel`, `ApiUserInfo`, `Event`, and `Message`.

Avoid public `Req` and `Resp` suffixes unless mirroring a documented object is necessary.

## Error Model

All failed API calls should throw `TeamGagaApiError`.

```ts
class TeamGagaApiError extends Error {
  readonly status: number;
  readonly code?: number;
  readonly request_id?: string;
  readonly response?: Response;
}
```

The error should cover:

- Non-2xx HTTP responses.
- API envelopes whose `status` field is false.
- Invalid or unexpected response envelopes.

Network and abort errors from `fetch` may pass through unchanged or be wrapped in a separate `TeamGagaNetworkError` later. Phase one should document the chosen behavior in tests.

## Testing Strategy

Use the existing test runner setup.

Required first-phase tests:

- Each `Api` method sends the correct HTTP method, path, query, body, and auth header.
- `api.sendMessage` calls `POST /bot/v2/messages`.
- `Bot.start()` converts polled messages and events into `Context` objects.
- `Composer` dispatches `message`, `message:text`, `event:*`, and `command` filters correctly.
- Middleware order and `next()` behavior match the documented model.
- `Context` convenience methods call the expected `Api` methods.
- API envelope failures throw `TeamGagaApiError` with code, status, message, and request ID.
- OAuth token and resource methods use the correct auth header schemes.

## Implementation Phases

### Phase 1: Core Runtime and API Surface

- Replace the current prototype public API with the new `Bot`, `Composer`, `Context`, `Api`, `OAuth`, and error model.
- Add model and parameter types for the first-phase API methods.
- Implement polling-based updates.
- Add focused unit tests for API calls, middleware, context helpers, and errors.
- Update README to show the new from-zero usage.

### Phase 2: API Coverage Hardening

- Fill any missing Bot API models from `docs/api/api-object.md`.
- Add more edge case tests for optional fields, query serialization, multipart upload, and update filtering.
- Add examples for command bots, moderation bots, OAuth login, and markdown messages.

### Phase 3: Extension Points

- Add plugin conventions if real use cases emerge.
- Consider webhook or custom update source support if TeamGaga adds or documents the capability.

## Open Questions

- Whether `ctx.answerCallback` has a documented endpoint in the current API references. If not, it should be removed from phase one.
- Whether `Authorization: Teamgaga Token <bot_token>` in `new_general.md` or `Authorization: Bot <bot_token>` in `index.md` is the canonical Bot API auth scheme. The implementation should verify this before coding.
- Whether markdown messages should be treated as a distinct message type filter or only as a sending method. Phase one can support `message:text` first and add `message:markdown` only if incoming payloads identify it reliably.
