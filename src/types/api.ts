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

export type ReactionName =
  | "ok"
  | "thumbs_up"
  | "hand_ok"
  | "applause"
  | "fist_bump"
  | "plus_one"
  | "get"
  | "blush"
  | "laugh"
  | "smile"
  | "support"
  | "whimper"
  | "obsessed"
  | "show_off"
  | "adoration"
  | "tongue"
  | "terror"
  | "sob"
  | "toasted"
  | "angry"
  | "apathy"
  | "lol"
  | "disbelief"
  | "kiss"
  | "scrunch"
  | "dizzy"
  | "sleep"
  | "strive"
  | "shocked"
  | "phone_frustrated"
  | "facepalm"
  | "hug"
  | "see_no_evil"
  | "speak_no_evil"
  | "hear_no_evil"
  | "disapproval"
  | "thumbs_down"
  | "watermelon"
  | "rose"
  | "heart"
  | "confetti"
  | "clown"
  | "monster"
  | "flame"
  | "rainbow"
  | "poop"
  | "check_mark"
  | "cross_mark"
  | "100"
  | "eyes"
  | "yes"
  | "no"
  | "number_1"
  | "number_2"
  | "number_3"
  | "number_4"
  | "option_A"
  | "option_B"
  | "option_C"
  | "option_D";

export type SetMessageReactionParams = {
  enable: boolean;
  name?: ReactionName;
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
