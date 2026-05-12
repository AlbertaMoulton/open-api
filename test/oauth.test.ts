import { expect, test, vi } from "vite-plus/test";
import * as openApi from "../src";
import { Api, Bot, OAuth, ApiError } from "../src";

test("public exports include new primary classes", () => {
  expect(Bot).toBeDefined();
  expect(Api).toBeDefined();
  expect(OAuth).toBeDefined();
  expect(ApiError).toBeDefined();
  expect("Client" in openApi).toBe(false);
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

  const [, init] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];

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

  const [, init] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];

  expect((init.headers as Headers).get("Authorization")).toBe("Access access-token");
});
