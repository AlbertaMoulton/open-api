import { expect, test } from "vite-plus/test";
import { ChannelType, type Message } from "../src";

test("Message channel_type uses named channel type values", () => {
  const message = {
    channel_id: "channel-1",
    user_id: "user-1",
    message_id: "message-1",
    channel_type: ChannelType.text,
    content: "hello",
    created_at: "2026-05-07T00:00:00Z",
  } satisfies Message;

  expect(message.channel_type).toBe(0);
  expect(ChannelType.unknown).toBe(255);
});
