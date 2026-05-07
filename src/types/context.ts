import type {
  EditMessageParams,
  SendMarkdownMessageParams,
  SendMessageParams,
  SetMessageReactionParams,
} from "./api";

export type ReplyOptions = Omit<SendMessageParams, "channelId" | "content"> & {
  quote?: boolean;
};

export type ReplyMarkdownOptions = Omit<SendMarkdownMessageParams, "channelId" | "content">;

export type EditCurrentMessageOptions = Omit<EditMessageParams, "channelId" | "content">;

export type ReactOptions = Omit<SetMessageReactionParams, "enable"> & {
  enable?: boolean;
};
