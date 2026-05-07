import type { Attachment, ReactionItem } from "./models";

export type AllowedUpdate = "message" | "event";

export type GetUpdatesOptions = {
  limit?: number;
  allowedUpdates?: AllowedUpdate[];
};

export type SendMessageParams = {
  channelId: string;
  content: string;
  quoteId?: string;
  type?: number;
  attachments?: Attachment[];
  ephemeral?: boolean;
  userIds?: string[];
  disableReactions?: boolean;
  reactions?: ReactionItem[];
  richtext?: boolean;
};

export type SendMessageResponse = {
  message_id: string;
};

export type BatchMessageItem = Omit<SendMessageParams, "quoteId"> & {
  channelIds: string[];
};

export type SendBatchMessagesParams = {
  items: BatchMessageItem[];
};

export type SendMarkdownMessageParams = {
  channelId: string;
  content: string;
  title?: string;
};

export type EditMessageParams = {
  channelId: string;
  content: string;
  attachments?: Attachment[];
};

export type SetMessageReactionParams = {
  enable: boolean;
  name?: string;
  avatar?: string;
};

export type AddMessageKeysParams = {
  channelId: string;
  keys: string[];
  memberId: string;
  messageId: string;
};

export type DeleteMessageKeyParams = {
  key: string;
  memberId: string;
  messageId: string;
  channelId: string;
};

export type MemberListOptions = {
  limit?: number;
  after?: string;
  excludeUserId?: string;
  keyword?: string;
};

export type BanCommunityMemberParams = {
  userId: string;
};

export type MuteCommunityMemberParams = {
  muteTime: number;
  channelId?: string;
};

export type UpdateCommunityMemberRolesParams = {
  memberId: string;
  addRoleIds?: string[];
  delRoleIds?: string[];
};

export type GetUserOptions = {
  communityId?: string;
};

export type ImageOperation = {
  operation: string;
  params: unknown[];
};

export type UploadImageParams = {
  file?: Blob;
  filename?: string;
  operations?: ImageOperation[];
};
