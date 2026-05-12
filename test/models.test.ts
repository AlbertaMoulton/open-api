import { expect, test } from "vite-plus/test";
import { ChannelType, type Event, type EventType, type Message, type ReactionItem } from "../src";

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type EventData<Action extends EventType> = Extract<Event, { action: Action }>["data"];

function expectType<_T extends true>() {
  expect(true).toBe(true);
}

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

test("Event data types are narrowed by action", () => {
  expectType<Assert<Equal<EventData<"DeleteMessage">, null>>>();
  expectType<Assert<Equal<EventData<"Reaction">, ReactionItem>>>();
  expectType<Assert<Equal<EventData<"Join">, { code: string; inviter: string }>>>();
  expectType<Assert<Equal<EventData<"Callback">, unknown>>>();
  expectType<Assert<Equal<EventData<"Unknown">, unknown>>>();
});

test("ReactionItem includes enable state", () => {
  expectType<Assert<Equal<ReactionItem["enable"], boolean>>>();
});
