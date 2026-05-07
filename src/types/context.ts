import type {
  EditMessageParams,
  SendMarkdownMessageParams,
  SendMessageParams,
  SetMessageReactionParams,
} from "./api";

export type ReplyOptions = Omit<SendMessageParams, "channel_id" | "content"> & {
  quote?: boolean;
};

export type ReplyMarkdownOptions = Omit<SendMarkdownMessageParams, "channel_id" | "content">;

export type EditCurrentMessageOptions = Omit<EditMessageParams, "channel_id" | "content">;

export type ReactOptions = Omit<SetMessageReactionParams, "enable"> & {
  enable?: boolean;
};
