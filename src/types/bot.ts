import type { Api } from "../api";
import type { Context } from "../context";
import type { Event, Message } from "./models";

export type Update =
  | {
      type: "message";
      message: Message;
    }
  | {
      type: "event";
      event: Event;
    };

export type NextFunction = () => Promise<void>;

export type Middleware<C extends Context = Context> = (
  ctx: C,
  next: NextFunction,
) => unknown | Promise<unknown>;

export type Filter<C extends Context = Context> = (ctx: C) => boolean;

export type ComposerFilter =
  | "message"
  | "message:text"
  | "message:markdown"
  | "event"
  | `event:${string}`;

export type BotOptions = {
  baseUrl?: string;
  fetch?: typeof fetch;
  polling?: PollingOptions;
};

export type PollingOptions = {
  limit?: number;
  interval?: number;
  allowedUpdates?: Array<"message" | "event">;
};

export type StartOptions = PollingOptions & {
  signal?: AbortSignal;
};

export type BotErrorHandler<C extends Context = Context> = (error: unknown, ctx?: C) => unknown;

export type ContextFactoryOptions = {
  update: Update;
  api: Api;
};
