# Bot API

`Api` 是访问 TeamGaga Bot API 的主要入口。每个 `Bot` 实例都会持有一个 `api`：

```ts
const bot = new Bot(process.env.TEAMGAGA_BOT_TOKEN!);

await bot.api.getMe();
```

你也可以单独创建 `Api`：

```ts
import { Api } from "@teamgaga/open-api";

const api = new Api(process.env.TEAMGAGA_BOT_TOKEN!);
```

## 参数命名

当前 SDK 的对象参数字段与 `docs/api` 保持一致，使用下划线命名：

```ts
await bot.api.sendMessage({
  channel_id: "channel-id",
  content: "hello",
  quote_id: "message-id",
});
```

方法名使用 JavaScript 风格，例如 `sendMessage`、`getCommunityMembers`。对象字段使用接口文档风格，例如 `channel_id`、`message_id`。

## 当前已接入的方法

消息相关：

```ts
api.getUpdates(options?);
api.sendMessage(params);
api.sendBatchMessages(params);
api.sendMarkdownMessage(params);
api.editMessage(message_id, params);
api.deleteMessage(channel_id, message_id);
api.setMessageReaction(channel_id, message_id, params);
api.addMessageKeys(params);
api.deleteMessageKey(params);
```

社区与成员：

```ts
api.getCommunity(community_id);
api.getCommunityChannels(community_id);
api.getCommunityMembers(community_id, options?);
api.getCommunityMemberCount(community_id);
api.getCommunityOwner(community_id);
api.banCommunityMember(community_id, params);
api.unbanCommunityMember(community_id, user_id);
api.muteCommunityMember(community_id, user_id, params);
api.unmuteCommunityMember(community_id, user_id);
```

身份组：

```ts
api.getCommunityRoles(community_id);
api.updateCommunityMemberRoles(community_id, params);
api.getCommunityRoleMembers(community_id, role_id, options?);
```

用户、私信、机器人：

```ts
api.getUser(user_id, options?);
api.createDmChannel(user_id);
api.getMe();
```

当前 SDK 不提供 `uploadImage`。

## raw API

`api.raw` 提供更接近接口文档的调用方式。它的 payload 直接使用文档字段：

```ts
await bot.api.raw.sendMessage({
  channel_id: "channel-id",
  content: "hello",
});
```

facade 方法会复用 raw 方法，所以 transformer 能同时观察 raw 调用和 facade 调用。

```ts
bot.api.use(async (prev, method, payload, signal) => {
  console.log(method, payload);
  return prev(method, payload, signal);
});

await bot.api.getMe(); // transformer 会看到 method === "getMe"
```

如果只针对某个方法写 transformer，可以使用 `MethodTransformer` 获取更精确的 payload 类型：

```ts
import type { MethodTransformer } from "@teamgaga/open-api";

const rewriteText: MethodTransformer<"sendMessage"> = async (prev, method, payload, signal) => {
  return prev(method, { ...payload, content: `[bot] ${payload.content}` }, signal);
};

bot.api.use(rewriteText);
```

## OAuth API

OAuth 不挂在 `Bot` 上，因为它使用不同的认证方式。请使用独立的 `OAuth` 类：

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

## 自定义 base_url 与 fetch

测试或自建环境中可以传入 `base_url` 和 `fetch`：

```ts
const bot = new Bot("token", {
  base_url: "https://open.teamgaga.com",
  fetch: customFetch,
});
```

## 错误

API 返回非 2xx 或业务 envelope 的 `status` 为 `false` 时，会抛出 `ApiError`。详见 [错误处理](./errors)。
