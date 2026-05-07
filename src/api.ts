import { Client } from "./client";
import type {
  AddMessageKeysParams,
  BanCommunityMemberParams,
  DeleteMessageKeyParams,
  EditMessageParams,
  GetUpdatesOptions,
  GetUserOptions,
  MemberListOptions,
  MuteCommunityMemberParams,
  SendBatchMessagesParams,
  SendMarkdownMessageParams,
  SendMessageParams,
  SendMessageResponse,
  SetMessageReactionParams,
  UpdateCommunityMemberRolesParams,
  UploadImageParams,
} from "./types/api";
import type {
  ApiUserInfo,
  BotInfo,
  Channel,
  Community,
  CommunityRole,
  DMChannel,
  ImageUploadResponse,
  PullMessageResponse,
} from "./types/models";

export type ApiOptions = {
  baseUrl?: string;
  fetch?: typeof fetch;
};

export class Api {
  private readonly client: Client;

  constructor(token: string, options: ApiOptions = {}) {
    this.client = new Client({
      token,
      auth: "Bot",
      baseUrl: options.baseUrl,
      fetch: options.fetch,
    });
  }

  getUpdates(options: GetUpdatesOptions = {}): Promise<PullMessageResponse> {
    return this.client.request("/bot/v1/messages", {
      method: "GET",
      query: {
        limit: options.limit,
        filter: options.allowedUpdates?.map((update) => (update === "message" ? "im" : "event")),
      },
    });
  }

  sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    return this.client.request("/bot/v2/messages", {
      method: "POST",
      body: messageBody(params),
    });
  }

  sendBatchMessages(params: SendBatchMessagesParams): Promise<string[]> {
    return this.client.request("/bot/v1/messages/batch", {
      method: "POST",
      body: {
        items: params.items.map((item) => ({
          ...messageBody(item),
          channel_ids: item.channelIds,
        })),
      },
    });
  }

  sendMarkdownMessage(params: SendMarkdownMessageParams): Promise<SendMessageResponse> {
    return this.client.request("/bot/v1/md_messages", {
      method: "POST",
      body: {
        channel_id: params.channelId,
        content: params.content,
        title: params.title,
      },
    });
  }

  editMessage(messageId: string, params: EditMessageParams): Promise<void> {
    return this.client.request(`/bot/v1/messages/${encodeURIComponent(messageId)}`, {
      method: "PATCH",
      body: {
        channel_id: params.channelId,
        content: params.content,
        attachments: params.attachments,
      },
    });
  }

  deleteMessage(channelId: string, messageId: string): Promise<void> {
    return this.client.request(
      `/bot/v1/channels/${encodeURIComponent(channelId)}/messages/${encodeURIComponent(messageId)}`,
      { method: "DELETE" },
    );
  }

  setMessageReaction(
    channelId: string,
    messageId: string,
    params: SetMessageReactionParams,
  ): Promise<void> {
    return this.client.request(
      `/bot/v1/channels/${encodeURIComponent(channelId)}/messages/${encodeURIComponent(messageId)}/reaction`,
      {
        method: "PATCH",
        body: {
          enable: params.enable,
          name: params.name,
          avatar: params.avatar,
        },
      },
    );
  }

  addMessageKeys(params: AddMessageKeysParams): Promise<void> {
    return this.client.request("/bot/v1/messages/keys", {
      method: "POST",
      body: {
        channel_id: params.channelId,
        keys: params.keys,
        member_id: params.memberId,
        message_id: params.messageId,
      },
    });
  }

  deleteMessageKey(params: DeleteMessageKeyParams): Promise<void> {
    return this.client.request("/bot/v1/messages/keys", {
      method: "DELETE",
      query: {
        key: params.key,
        member_id: params.memberId,
        message_id: params.messageId,
        channel_id: params.channelId,
      },
    });
  }

  getCommunity(communityId: string): Promise<Community> {
    return this.client.request(`/bot/v1/communities/${encodeURIComponent(communityId)}`, {
      method: "GET",
    });
  }

  getCommunityChannels(communityId: string): Promise<Channel[]> {
    return this.client.request(`/bot/v1/communities/${encodeURIComponent(communityId)}/channels`, {
      method: "GET",
    });
  }

  getCommunityMembers(
    communityId: string,
    options: MemberListOptions = {},
  ): Promise<ApiUserInfo[]> {
    return this.client.request(`/bot/v1/communities/${encodeURIComponent(communityId)}/members`, {
      method: "GET",
      query: memberListQuery(options),
    });
  }

  getCommunityMemberCount(communityId: string): Promise<number> {
    return this.client.request(
      `/bot/v1/communities/${encodeURIComponent(communityId)}/members/count`,
      {
        method: "GET",
      },
    );
  }

  getCommunityOwner(communityId: string): Promise<string> {
    return this.client.request(`/bot/v1/communities/${encodeURIComponent(communityId)}/owner`, {
      method: "GET",
    });
  }

  banCommunityMember(communityId: string, params: BanCommunityMemberParams): Promise<void> {
    return this.client.request(`/bot/v1/communities/${encodeURIComponent(communityId)}/ban`, {
      method: "POST",
      body: { user_id: params.userId },
    });
  }

  unbanCommunityMember(communityId: string, userId: string): Promise<void> {
    return this.client.request(`/bot/v1/communities/${encodeURIComponent(communityId)}/ban`, {
      method: "DELETE",
      query: { user_id: userId },
    });
  }

  muteCommunityMember(
    communityId: string,
    userId: string,
    params: MuteCommunityMemberParams,
  ): Promise<void> {
    return this.client.request(
      `/bot/v1/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(userId)}/mute`,
      {
        method: "POST",
        body: {
          mute_time: params.muteTime,
          channel_id: params.channelId,
        },
      },
    );
  }

  unmuteCommunityMember(communityId: string, userId: string): Promise<void> {
    return this.client.request(
      `/bot/v1/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(userId)}/mute`,
      { method: "DELETE" },
    );
  }

  getCommunityRoles(communityId: string): Promise<CommunityRole[]> {
    return this.client.request(`/bot/v1/communities/${encodeURIComponent(communityId)}/roles`, {
      method: "GET",
    });
  }

  updateCommunityMemberRoles(
    communityId: string,
    params: UpdateCommunityMemberRolesParams,
  ): Promise<void> {
    return this.client.request(`/bot/v1/communities/${encodeURIComponent(communityId)}/roles`, {
      method: "PATCH",
      body: {
        member_id: params.memberId,
        add_role_ids: params.addRoleIds,
        del_role_ids: params.delRoleIds,
      },
    });
  }

  getCommunityRoleMembers(
    communityId: string,
    roleId: string,
    options: MemberListOptions = {},
  ): Promise<ApiUserInfo[]> {
    return this.client.request(
      `/bot/v1/communities/${encodeURIComponent(communityId)}/roles/${encodeURIComponent(roleId)}/members`,
      {
        method: "GET",
        query: memberListQuery(options),
      },
    );
  }

  getUser(userId: string, options: GetUserOptions = {}): Promise<ApiUserInfo> {
    return this.client.request(`/bot/v1/users/${encodeURIComponent(userId)}`, {
      method: "GET",
      query: { community_id: options.communityId },
    });
  }

  createDmChannel(userId: string): Promise<DMChannel> {
    return this.client.request(`/bot/v1/users/${encodeURIComponent(userId)}/dm`, {
      method: "POST",
    });
  }

  getMe(): Promise<BotInfo> {
    return this.client.request("/bot/v1/me", { method: "GET" });
  }

  uploadImage(params: UploadImageParams): Promise<ImageUploadResponse> {
    return this.client.request("/bot/v1/upload/image", {
      method: "POST",
      body: {
        filename: params.filename,
        operations: params.operations,
      },
    });
  }
}

function messageBody(params: SendMessageParams) {
  return {
    channel_id: params.channelId,
    content: params.content,
    quote_id: params.quoteId,
    type: params.type,
    attachments: params.attachments,
    ephemeral: params.ephemeral,
    user_ids: params.userIds,
    disable_reactions: params.disableReactions,
    reactions: params.reactions,
    richtext: params.richtext,
  };
}

function memberListQuery(options: MemberListOptions) {
  return {
    limit: options.limit,
    after: options.after,
    exclude_user_id: options.excludeUserId,
    keyword: options.keyword,
  };
}
