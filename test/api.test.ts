import { expect, test, vi } from "vite-plus/test";
import { Api, type RawSendMessageParams } from "../src/api";

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

  api.use(async (prev, method, payload, signal) => {
    seen.push(method);
    if (method === "sendMessage") {
      return prev(method, { ...(payload as RawSendMessageParams), content: "changed" }, signal);
    }

    return prev(method, payload, signal);
  });

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

  api.use(async (prev, method, payload, signal) => {
    seen.push(method);
    return prev(method, payload, signal);
  });

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

test("uploadImage sends multipart form data", async () => {
  const { api, fetchMock } = createApi({ url: "https://cdn.example/image.png" });
  const file = new Blob(["image"], { type: "image/png" });

  await api.uploadImage({
    file,
    filename: "image.png",
    operations: [{ operation: "resize", params: [100, 100] }],
  });

  const [, init] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];
  const body = init.body as FormData;

  expect(body).toBeInstanceOf(FormData);
  expect(body.get("file")).toBeInstanceOf(File);
  expect(body.get("filename")).toBe("image.png");
  expect(body.get("operations")).toBe(
    JSON.stringify([{ operation: "resize", params: [100, 100] }]),
  );
  expect((init.headers as Headers).has("Content-Type")).toBe(false);
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

test("moderation methods map camelCase params to documented fields", async () => {
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
