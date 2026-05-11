import type { Attachment, ReactionItem } from "./models";

export type AllowedUpdate = "message" | "event";

export type GetUpdatesOptions = {
  limit?: number;
  filter?: Array<"im" | "event">;
};

export type SendMessageParams = {
  channel_id: string;
  content: string;
  quote_id?: string;
  type?: number;
  attachments?: Attachment[];
  ephemeral?: boolean;
  user_ids?: string[];
  disable_reactions?: boolean;
  reactions?: ReactionItem[];
  richtext?: boolean;
};

export type SendMessageResponse = {
  message_id: string;
};

export type BatchMessageItem = Omit<SendMessageParams, "quote_id"> & {
  channel_ids: string[];
};

export type SendBatchMessagesParams = {
  items: BatchMessageItem[];
};

export type SendMarkdownMessageParams = {
  channel_id: string;
  content: string;
  title?: string;
};

export type EditMessageParams = {
  channel_id: string;
  content: string;
  attachments?: Attachment[];
};

export type SetMessageReactionParams = {
  enable: boolean;
  name?: string;
};

export type AddMessageKeysParams = {
  channel_id: string;
  keys: string[];
  member_id: string;
  message_id: string;
};

export type DeleteMessageKeyParams = {
  key: string;
  member_id: string;
  message_id: string;
  channel_id: string;
};

export type MemberListOptions = {
  limit?: number;
  after?: string;
  exclude_user_id?: string;
  keyword?: string;
};

export type BanCommunityMemberParams = {
  user_id: string;
};

export type MuteCommunityMemberParams = {
  mute_time: number;
  channel_id?: string;
};

export type UpdateCommunityMemberRolesParams = {
  member_id: string;
  add_role_ids?: string[];
  del_role_ids?: string[];
};

export type GetUserOptions = {
  community_id?: string;
};
