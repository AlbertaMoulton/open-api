export type Attachment = {
  filename: string;
  url: string;
  size: number;
  blur_hash?: string;
  content_type?: string;
  duration_secs?: number;
  height?: number;
  id?: number;
  thumbnail?: string;
  width?: number;
};

export type ReactionItem = {
  name?: string;
  avatar?: string;
};

export type Message = {
  community_id?: string;
  channel_id: string;
  user_id: string;
  message_id: string;
  channel_type: number;
  attachments?: Attachment[] | string | null;
  author?: unknown;
  content: string;
  created_at: string;
  type?: number;
};

export type EventType = "Reaction" | "Join" | "Callback" | "DeleteMessage" | "Unknown";

export type Event = {
  action: EventType | string;
  data: unknown;
  channel_id?: string | null;
  community_bots?: number[] | null;
  community_id?: string | null;
  created_at?: string | null;
  message_id?: string | null;
  user_id?: string | null;
};

export type PullMessageResponse = {
  im: Message[];
  event: Event[];
};

export type ApiUserInfo = {
  user_id: string;
  username?: string;
  nickname?: string;
  avatar?: string;
  bot?: number;
  community_nickname?: string;
  joined_at?: number;
  role_ids?: string[];
};

export type Community = {
  community_id: string;
  owner_id: string;
  name: string;
  icon: string;
  description?: string;
  private?: boolean;
  banner_image?: string;
  nickname?: string;
};

export type Channel = {
  channel_id: string;
  community_id: string;
  parent_id?: string;
  name: string;
  position?: number;
  type?: number;
  description?: string;
  private?: boolean;
  relation_id?: string;
};

export type CommunityRole = {
  community_id: string;
  role_id: string;
  color: number;
  visible: boolean;
  type: number;
  mentionable: boolean;
  name: string;
  permissions: string;
  position: number;
  tags?: string;
};

export type DMChannel = {
  channel_id: string;
  user: ApiUserInfo;
};

export type BotInfo = {
  bot_id: string;
  name: string;
  permissions: string;
  type: string;
  privacy_mode: number;
  created_at: number;
  avatar?: string;
  privacy_policy?: string;
  terms_of_service?: string;
  token?: string;
};

export type ImageUploadResponse = {
  url: string;
  path: string;
  md5: string;
  cloudfront_url?: string;
};
