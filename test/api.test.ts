import { expect, test, vi } from "vite-plus/test";
import { Api } from "../src/api";

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

  await api.sendMessage({ channelId: "channel-1", content: "hello", quoteId: "message-0" });

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

test("getUpdates maps polling options to query params", async () => {
  const { api, fetchMock } = createApi({ im: [], event: [] });

  await api.getUpdates({ limit: 5, allowedUpdates: ["message", "event"] });

  const [url] = fetchMock.mock.calls[0] as [URL, RequestInit];

  expect(url.toString()).toBe(
    "https://open.teamgaga.com/bot/v1/messages?limit=5&filter=im&filter=event",
  );
});

test("community and role methods use documented paths", async () => {
  const { api, fetchMock } = createApi([]);

  await api.getCommunity("community-1");
  await api.getCommunityRoleMembers("community-1", "role-1", { limit: 20, after: "cursor" });

  expect((fetchMock.mock.calls[0] as [URL, RequestInit])[0].pathname).toBe(
    "/bot/v1/communities/community-1",
  );
  expect((fetchMock.mock.calls[1] as [URL, RequestInit])[0].toString()).toBe(
    "https://open.teamgaga.com/bot/v1/communities/community-1/roles/role-1/members?limit=20&after=cursor",
  );
});

test("moderation methods map camelCase params to documented fields", async () => {
  const { api, fetchMock } = createApi(null);

  await api.muteCommunityMember("community-1", "user-1", {
    muteTime: 60,
    channelId: "channel-1",
  });
  await api.updateCommunityMemberRoles("community-1", {
    memberId: "user-1",
    addRoleIds: ["role-1"],
    delRoleIds: ["role-2"],
  });

  expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
    JSON.stringify({ mute_time: 60, channel_id: "channel-1" }),
  );
  expect(fetchMock.mock.calls[1]?.[1]?.body).toBe(
    JSON.stringify({
      member_id: "user-1",
      add_role_ids: ["role-1"],
      del_role_ids: ["role-2"],
    }),
  );
});
