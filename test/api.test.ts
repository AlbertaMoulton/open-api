import { expect, test, vi } from "vite-plus/test";
import {
  Api,
  type MethodTransformer,
  type RawApi,
  type RawPayload,
  type Transformer,
} from "../src/api";

function createApi(data: unknown = { message_id: "message-1" }) {
  const fetchMock = vi.fn(async () =>
    Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data,
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
      body: JSON.stringify({
        channel_id: "channel-1",
        content: "hello",
        quote_id: "message-0",
      }),
    }),
  );
});

test("raw sendMessage accepts documented snake_case payload", async () => {
  const { api, fetchMock } = createApi();

  await api.raw.sendMessage({
    channel_id: "channel-1",
    content: "hello",
  });

  expect(fetchMock).toHaveBeenCalledWith(
    new URL("https://open.teamgaga.com/bot/v2/messages"),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        channel_id: "channel-1",
        content: "hello",
      }),
    }),
  );
});

test("Api transformers can observe and modify calls", async () => {
  const { api, fetchMock } = createApi();
  const seen: string[] = [];

  const transformer = (async (prev, method, payload, signal) => {
    seen.push(method);
    if (method === "sendMessage") {
      return (await prev(
        "sendMessage",
        { ...(payload as RawPayload<"sendMessage">), content: "changed" },
        signal,
      )) as never;
    }

    return prev(method, payload, signal);
  }) as Transformer;

  api.use(transformer);

  await api.raw.sendMessage({
    channel_id: "channel-1",
    content: "original",
  });

  expect(seen).toEqual(["sendMessage"]);
  expect(fetchMock).toHaveBeenCalledWith(
    new URL("https://open.teamgaga.com/bot/v2/messages"),
    expect.objectContaining({
      body: JSON.stringify({
        channel_id: "channel-1",
        content: "changed",
      }),
    }),
  );
});

test("facade methods go through raw transformers", async () => {
  const { api } = createApi({ bot_id: "bot-1" });
  const seen: string[] = [];

  const transformer: Transformer = async (prev, method, payload, signal) => {
    seen.push(method);
    return prev(method, payload, signal);
  };

  api.use(transformer);

  await api.getMe();

  expect(seen).toEqual(["getMe"]);
});

test("raw methods cover documented bot api paths", async () => {
  const { api, fetchMock } = createApi([]);

  await api.raw.getCommunity({ community_id: "community-1" });
  await api.raw.getCommunityMembers({
    community_id: "community-1",
    limit: 20,
    exclude_user_id: "user-0",
  });
  await api.raw.deleteMessage({ channel_id: "channel-1", message_id: "message-1" });
  await api.raw.unbanCommunityMember({ community_id: "community-1", user_id: "user-1" });

  expect((fetchMock.mock.calls[0] as unknown as [URL, RequestInit])[0].pathname).toBe(
    "/bot/v1/communities/community-1",
  );
  expect((fetchMock.mock.calls[1] as unknown as [URL, RequestInit])[0].toString()).toBe(
    "https://open.teamgaga.com/bot/v1/communities/community-1/members?limit=20&exclude_user_id=user-0",
  );
  expect((fetchMock.mock.calls[2] as unknown as [URL, RequestInit])[0].pathname).toBe(
    "/bot/v1/channels/channel-1/messages/message-1",
  );
  expect((fetchMock.mock.calls[3] as unknown as [URL, RequestInit])[0].toString()).toBe(
    "https://open.teamgaga.com/bot/v1/communities/community-1/ban?user_id=user-1",
  );
});

test("raw api does not expose uploadImage", () => {
  const { api } = createApi();

  expect("uploadImage" in api).toBe(false);
  expect("uploadImage" in api.raw).toBe(false);
});

test("getUpdates maps polling options to query params", async () => {
  const { api, fetchMock } = createApi({ im: [], event: [] });

  await api.getUpdates({ limit: 5, filter: ["im", "event"] });

  const [url] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];

  expect(url.toString()).toBe(
    "https://open.teamgaga.com/bot/v1/messages?limit=5&filter=im&filter=event",
  );
});

test("community and role methods use documented paths", async () => {
  const { api, fetchMock } = createApi([]);

  await api.getCommunity("community-1");
  await api.getCommunityRoleMembers("community-1", "role-1", { limit: 20, after: "cursor" });

  expect((fetchMock.mock.calls[0] as unknown as [URL, RequestInit])[0].pathname).toBe(
    "/bot/v1/communities/community-1",
  );
  expect((fetchMock.mock.calls[1] as unknown as [URL, RequestInit])[0].toString()).toBe(
    "https://open.teamgaga.com/bot/v1/communities/community-1/roles/role-1/members?limit=20&after=cursor",
  );
});

test("moderation methods pass documented snake_case params through", async () => {
  const { api, fetchMock } = createApi(null);

  await api.muteCommunityMember("community-1", "user-1", {
    mute_time: 60,
    channel_id: "channel-1",
  });
  await api.updateCommunityMemberRoles("community-1", {
    member_id: "user-1",
    add_role_ids: ["role-1"],
    del_role_ids: ["role-2"],
  });

  expect((fetchMock.mock.calls[0] as unknown as [URL, RequestInit])[1].body).toBe(
    JSON.stringify({ mute_time: 60, channel_id: "channel-1" }),
  );
  expect((fetchMock.mock.calls[1] as unknown as [URL, RequestInit])[1].body).toBe(
    JSON.stringify({
      member_id: "user-1",
      add_role_ids: ["role-1"],
      del_role_ids: ["role-2"],
    }),
  );
});

test("raw api method types stay aligned with documented payloads", () => {
  const raw: Pick<RawApi, "sendMessage" | "getCommunityMembers"> = {} as RawApi;
  const sendMessageTransformer: MethodTransformer<"sendMessage"> = async (
    prev,
    method,
    payload,
    signal,
  ) => prev(method, { ...payload, content: "typed" }, signal);
  const messagePayload: RawPayload<"sendMessage"> = {
    channel_id: "channel-1",
    content: "hello",
  };
  const membersPayload: RawPayload<"getCommunityMembers"> = {
    community_id: "community-1",
    limit: 20,
  };

  expect(raw).toBeDefined();
  expect(sendMessageTransformer).toBeDefined();
  expect(messagePayload.channel_id).toBe("channel-1");
  expect(membersPayload.community_id).toBe("community-1");
});

test("raw endpoint matrix covers current bot api surface", async () => {
  const { api, fetchMock } = createApi([]);

  await api.raw.sendBatchMessages({ items: [] });
  await api.raw.sendMarkdownMessage({ channel_id: "channel-1", content: "**hello**" });
  await api.raw.editMessage({
    message_id: "message-1",
    channel_id: "channel-1",
    content: "edited",
  });
  await api.raw.setMessageReaction({
    channel_id: "channel-1",
    message_id: "message-1",
    enable: true,
    name: "like",
  });
  await api.raw.addMessageKeys({
    channel_id: "channel-1",
    keys: ["slot"],
    member_id: "user-1",
    message_id: "message-1",
  });
  await api.raw.deleteMessageKey({
    channel_id: "channel-1",
    key: "slot",
    member_id: "user-1",
    message_id: "message-1",
  });
  await api.raw.getCommunityChannels({ community_id: "community-1" });
  await api.raw.getCommunityMemberCount({ community_id: "community-1" });
  await api.raw.getCommunityOwner({ community_id: "community-1" });
  await api.raw.banCommunityMember({ community_id: "community-1", user_id: "user-1" });
  await api.raw.muteCommunityMember({
    community_id: "community-1",
    user_id: "user-1",
    mute_time: 60,
  });
  await api.raw.unmuteCommunityMember({ community_id: "community-1", user_id: "user-1" });
  await api.raw.getCommunityRoles({ community_id: "community-1" });
  await api.raw.updateCommunityMemberRoles({
    community_id: "community-1",
    member_id: "user-1",
    add_role_ids: ["role-1"],
  });
  await api.raw.getUser({ user_id: "user-1", community_id: "community-1" });
  await api.raw.createDmChannel({ user_id: "user-1" });
  await api.raw.getMe();

  const calls = fetchMock.mock.calls as unknown as Array<[URL, RequestInit]>;

  expect(calls.map(([url, init]) => `${init.method} ${url.pathname}`)).toEqual([
    "POST /bot/v1/messages/batch",
    "POST /bot/v1/md_messages",
    "PATCH /bot/v1/messages/message-1",
    "PATCH /bot/v1/channels/channel-1/messages/message-1/reaction",
    "POST /bot/v1/messages/keys",
    "DELETE /bot/v1/messages/keys",
    "GET /bot/v1/communities/community-1/channels",
    "GET /bot/v1/communities/community-1/members/count",
    "GET /bot/v1/communities/community-1/owner",
    "POST /bot/v1/communities/community-1/ban",
    "POST /bot/v1/communities/community-1/members/user-1/mute",
    "DELETE /bot/v1/communities/community-1/members/user-1/mute",
    "GET /bot/v1/communities/community-1/roles",
    "PATCH /bot/v1/communities/community-1/roles",
    "GET /bot/v1/users/user-1",
    "POST /bot/v1/users/user-1/dm",
    "GET /bot/v1/me",
  ]);
  expect(calls[5]?.[0].toString()).toBe(
    "https://open.teamgaga.com/bot/v1/messages/keys?key=slot&member_id=user-1&message_id=message-1&channel_id=channel-1",
  );
  expect(calls[14]?.[0].toString()).toBe(
    "https://open.teamgaga.com/bot/v1/users/user-1?community_id=community-1",
  );
});
