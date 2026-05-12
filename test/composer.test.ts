import { expect, test, vi } from "vite-plus/test";
import { Composer } from "../src/composer";
import { Context } from "../src/context";
import type { SetMessageReactionParams } from "../src/types/api";

function createContext(content = "/ping hello") {
  const api = {
    sendMessage: vi.fn(async () => ({ message_id: "reply-1" })),
    setMessageReaction: vi.fn(async () => undefined),
  };
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

test("Composer dispatches message filters", async () => {
  const composer = new Composer();
  const handler = vi.fn();
  composer.on("message", handler);
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
    channel_id: "channel-1",
    content: "pong",
    quote_id: "message-1",
    type: 0,
  });
});

test("Context react sends supported reaction fields", async () => {
  const { ctx, api } = createContext("thumbs_up");

  await ctx.react({ name: "thumbs_up" });

  expect(api.setMessageReaction).toHaveBeenCalledTimes(1);
  const [, , params] = api.setMessageReaction.mock.calls[0] as unknown as [string, string, unknown];
  expect(params).toStrictEqual({
    enable: true,
    name: "thumbs_up",
  });
});

test("SetMessageReactionParams name is limited to supported reactions", () => {
  const okReaction: SetMessageReactionParams = { enable: true, name: "ok" };
  const optionReaction: SetMessageReactionParams = { enable: true, name: "option_D" };
  // @ts-expect-error Unsupported reaction names should be rejected by TypeScript.
  const unsupportedReaction: SetMessageReactionParams = { enable: true, name: "custom" };

  expect([okReaction.name, optionReaction.name, unsupportedReaction.name]).toEqual([
    "ok",
    "option_D",
    "custom",
  ]);
});
