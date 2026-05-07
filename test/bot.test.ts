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
  expect((fetchMock.mock.calls[1] as unknown as [URL, RequestInit])[1].body).toBe(
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
