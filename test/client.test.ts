import { expect, test, vi } from "vite-plus/test";
import { ApiClient } from "../src/client";
import { TeamGagaApiError } from "../src/errors";

test("ApiClient unwraps successful TeamGaga envelopes", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: { ok: true },
      request_id: "request-id",
    }),
  );
  const client = new ApiClient({
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

test("ApiClient serializes query params and bot auth header", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json({
      status: true,
      code: 1000,
      message: "Ok",
      data: [],
      request_id: "request-id",
    }),
  );
  const client = new ApiClient({
    token: "token",
    auth: "Bot",
    fetch: fetchMock as unknown as typeof fetch,
  });

  await client.request("/bot/v1/messages", {
    method: "GET",
    query: { limit: 10, filter: ["im", "event"] },
  });

  const [url, init] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];

  expect(url.toString()).toBe(
    "https://open.teamgaga.com/bot/v1/messages?limit=10&filter=im&filter=event",
  );
  expect((init.headers as Headers).get("Authorization")).toBe("Bot token");
});

test("ApiClient throws TeamGagaApiError for failed envelopes", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json({
      status: false,
      code: 4001,
      message: "Nope",
      data: null,
      request_id: "request-id",
    }),
  );
  const client = new ApiClient({
    token: "token",
    auth: "Bot",
    fetch: fetchMock as unknown as typeof fetch,
  });

  await expect(client.request("/bot/v1/me", { method: "GET" })).rejects.toMatchObject({
    name: "TeamGagaApiError",
    code: 4001,
    request_id: "request-id",
    status: 200,
    message: "Nope",
  });
});

test("ApiClient throws TeamGagaApiError for non-2xx HTTP responses", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json(
      {
        status: false,
        code: 5000,
        message: "Broken",
        data: null,
        request_id: "request-id",
      },
      { status: 500 },
    ),
  );
  const client = new ApiClient({
    token: "token",
    auth: "Bot",
    fetch: fetchMock as unknown as typeof fetch,
  });

  await expect(client.request("/bot/v1/me", { method: "GET" })).rejects.toBeInstanceOf(
    TeamGagaApiError,
  );
});
