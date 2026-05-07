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

test("Composer middleware stops propagation when next is not called", async () => {
  const composer = new Composer();
  const second = vi.fn();
  composer.use(() => undefined);
  composer.use(second);
  const { ctx } = createContext("plain text");

  await composer.middleware()(ctx);

  expect(second).not.toHaveBeenCalled();
});

test("Context reply quotes current message", async () => {
  const { ctx, api } = createContext("hello");

  await ctx.reply("pong");

  expect(api.sendMessage).toHaveBeenCalledWith({
    channelId: "channel-1",
    content: "pong",
    quoteId: "message-1",
  });
});
