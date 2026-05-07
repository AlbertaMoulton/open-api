import { ApiClient, type QueryParams } from "./client";
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
  base_url?: string;
  fetch?: typeof fetch;
};

export type RawSendMessageParams = {
  channel_id: string;
  content: string;
  quote_id?: string;
  type?: number;
  attachments?: unknown[];
  ephemeral?: boolean;
  user_ids?: string[];
  disable_reactions?: boolean;
  reactions?: unknown[];
  richtext?: boolean;
};

export type RawGetUpdatesParams = {
  limit?: number;
  filter?: Array<"im" | "event">;
};

export type RawSendBatchMessagesParams = SendBatchMessagesParams;
export type RawSendMarkdownMessageParams = SendMarkdownMessageParams;
export type RawEditMessageParams = EditMessageParams & { message_id: string };
export type RawDeleteMessageParams = { channel_id: string; message_id: string };
export type RawSetMessageReactionParams = SetMessageReactionParams & {
  channel_id: string;
  message_id: string;
};
export type RawGetCommunityParams = { community_id: string };
export type RawGetCommunityMembersParams = MemberListOptions & { community_id: string };
export type RawBanCommunityMemberParams = BanCommunityMemberParams & { community_id: string };
export type RawUnbanCommunityMemberParams = { community_id: string; user_id: string };
export type RawMuteCommunityMemberParams = MuteCommunityMemberParams & {
  community_id: string;
  user_id: string;
};
export type RawCommunityMemberParams = { community_id: string; user_id: string };
export type RawUpdateCommunityMemberRolesParams = UpdateCommunityMemberRolesParams & {
  community_id: string;
};
export type RawGetCommunityRoleMembersParams = MemberListOptions & {
  community_id: string;
  role_id: string;
};
export type RawGetUserParams = GetUserOptions & { user_id: string };
export type RawCreateDmChannelParams = { user_id: string };
export type RawUploadImageParams = UploadImageParams;
export type EmptyPayload = Record<string, never>;

export type RawApi = {
  getUpdates(args?: RawGetUpdatesParams, signal?: AbortSignal): Promise<PullMessageResponse>;
  sendMessage(args: RawSendMessageParams, signal?: AbortSignal): Promise<SendMessageResponse>;
  sendBatchMessages(args: RawSendBatchMessagesParams, signal?: AbortSignal): Promise<string[]>;
  sendMarkdownMessage(
    args: RawSendMarkdownMessageParams,
    signal?: AbortSignal,
  ): Promise<SendMessageResponse>;
  editMessage(args: RawEditMessageParams, signal?: AbortSignal): Promise<void>;
  deleteMessage(args: RawDeleteMessageParams, signal?: AbortSignal): Promise<void>;
  setMessageReaction(args: RawSetMessageReactionParams, signal?: AbortSignal): Promise<void>;
  addMessageKeys(args: AddMessageKeysParams, signal?: AbortSignal): Promise<void>;
  deleteMessageKey(args: DeleteMessageKeyParams, signal?: AbortSignal): Promise<void>;
  getCommunity(args: RawGetCommunityParams, signal?: AbortSignal): Promise<Community>;
  getCommunityChannels(args: RawGetCommunityParams, signal?: AbortSignal): Promise<Channel[]>;
  getCommunityMembers(
    args: RawGetCommunityMembersParams,
    signal?: AbortSignal,
  ): Promise<ApiUserInfo[]>;
  getCommunityMemberCount(args: RawGetCommunityParams, signal?: AbortSignal): Promise<number>;
  getCommunityOwner(args: RawGetCommunityParams, signal?: AbortSignal): Promise<string>;
  banCommunityMember(args: RawBanCommunityMemberParams, signal?: AbortSignal): Promise<void>;
  unbanCommunityMember(args: RawUnbanCommunityMemberParams, signal?: AbortSignal): Promise<void>;
  muteCommunityMember(args: RawMuteCommunityMemberParams, signal?: AbortSignal): Promise<void>;
  unmuteCommunityMember(args: RawCommunityMemberParams, signal?: AbortSignal): Promise<void>;
  getCommunityRoles(args: RawGetCommunityParams, signal?: AbortSignal): Promise<CommunityRole[]>;
  updateCommunityMemberRoles(
    args: RawUpdateCommunityMemberRolesParams,
    signal?: AbortSignal,
  ): Promise<void>;
  getCommunityRoleMembers(
    args: RawGetCommunityRoleMembersParams,
    signal?: AbortSignal,
  ): Promise<ApiUserInfo[]>;
  getUser(args: RawGetUserParams, signal?: AbortSignal): Promise<ApiUserInfo>;
  createDmChannel(args: RawCreateDmChannelParams, signal?: AbortSignal): Promise<DMChannel>;
  getMe(args?: EmptyPayload, signal?: AbortSignal): Promise<BotInfo>;
  uploadImage(args: RawUploadImageParams, signal?: AbortSignal): Promise<ImageUploadResponse>;
};

export type RawApiMethod = keyof RawApi;

export type RawPayload<M extends RawApiMethod = RawApiMethod> = Parameters<RawApi[M]>[0];

export type RawResult<M extends RawApiMethod = RawApiMethod> = Awaited<ReturnType<RawApi[M]>>;

export type ApiCallFn = <M extends RawApiMethod>(
  method: M,
  payload: RawPayload<M>,
  signal?: AbortSignal,
) => Promise<RawResult<M>>;

export type Transformer = (
  prev: ApiCallFn,
  method: RawApiMethod,
  payload: RawPayload,
  signal?: AbortSignal,
) => Promise<unknown>;

export class Api {
  readonly raw: RawApi;
  readonly installedTransformers: Transformer[] = [];
  private readonly client: ApiClient;
  private call: ApiCallFn;

  constructor(token: string, options: ApiOptions = {}) {
    this.client = new ApiClient({
      token,
      auth: "Bot",
      base_url: options.base_url,
      fetch: options.fetch,
    });
    this.call = this.callApi.bind(this);
    this.raw = {
      getUpdates: (args = {}, signal) => this.rawCall("getUpdates", args, signal),
      sendMessage: (args, signal) => this.rawCall("sendMessage", args, signal),
      sendBatchMessages: (args, signal) => this.rawCall("sendBatchMessages", args, signal),
      sendMarkdownMessage: (args, signal) => this.rawCall("sendMarkdownMessage", args, signal),
      editMessage: (args, signal) => this.rawCall("editMessage", args, signal),
      deleteMessage: (args, signal) => this.rawCall("deleteMessage", args, signal),
      setMessageReaction: (args, signal) => this.rawCall("setMessageReaction", args, signal),
      addMessageKeys: (args, signal) => this.rawCall("addMessageKeys", args, signal),
      deleteMessageKey: (args, signal) => this.rawCall("deleteMessageKey", args, signal),
      getCommunity: (args, signal) => this.rawCall("getCommunity", args, signal),
      getCommunityChannels: (args, signal) => this.rawCall("getCommunityChannels", args, signal),
      getCommunityMembers: (args, signal) => this.rawCall("getCommunityMembers", args, signal),
      getCommunityMemberCount: (args, signal) =>
        this.rawCall("getCommunityMemberCount", args, signal),
      getCommunityOwner: (args, signal) => this.rawCall("getCommunityOwner", args, signal),
      banCommunityMember: (args, signal) => this.rawCall("banCommunityMember", args, signal),
      unbanCommunityMember: (args, signal) => this.rawCall("unbanCommunityMember", args, signal),
      muteCommunityMember: (args, signal) => this.rawCall("muteCommunityMember", args, signal),
      unmuteCommunityMember: (args, signal) => this.rawCall("unmuteCommunityMember", args, signal),
      getCommunityRoles: (args, signal) => this.rawCall("getCommunityRoles", args, signal),
      updateCommunityMemberRoles: (args, signal) =>
        this.rawCall("updateCommunityMemberRoles", args, signal),
      getCommunityRoleMembers: (args, signal) =>
        this.rawCall("getCommunityRoleMembers", args, signal),
      getUser: (args, signal) => this.rawCall("getUser", args, signal),
      createDmChannel: (args, signal) => this.rawCall("createDmChannel", args, signal),
      getMe: (args = {}, signal) => this.rawCall("getMe", args, signal),
      uploadImage: (args, signal) => this.rawCall("uploadImage", args, signal),
    };
  }

  use(...transformers: Transformer[]): this {
    for (const transformer of transformers) {
      const previous = this.call;
      this.call = (method, payload, signal) =>
        transformer(previous, method, payload, signal) as Promise<RawResult<typeof method>>;
    }

    this.installedTransformers.push(...transformers);
    return this;
  }

  getUpdates(options: GetUpdatesOptions = {}): Promise<PullMessageResponse> {
    return this.raw.getUpdates(options);
  }

  sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    return this.raw.sendMessage(messageBody(params));
  }

  sendBatchMessages(params: SendBatchMessagesParams): Promise<string[]> {
    return this.raw.sendBatchMessages(params);
  }

  sendMarkdownMessage(params: SendMarkdownMessageParams): Promise<SendMessageResponse> {
    return this.raw.sendMarkdownMessage(params);
  }

  editMessage(messageId: string, params: EditMessageParams): Promise<void> {
    return this.raw.editMessage({ ...params, message_id: messageId });
  }

  deleteMessage(channelId: string, messageId: string): Promise<void> {
    return this.raw.deleteMessage({ channel_id: channelId, message_id: messageId });
  }

  setMessageReaction(
    channelId: string,
    messageId: string,
    params: SetMessageReactionParams,
  ): Promise<void> {
    return this.raw.setMessageReaction({
      ...params,
      channel_id: channelId,
      message_id: messageId,
    });
  }

  addMessageKeys(params: AddMessageKeysParams): Promise<void> {
    return this.raw.addMessageKeys(params);
  }

  deleteMessageKey(params: DeleteMessageKeyParams): Promise<void> {
    return this.raw.deleteMessageKey(params);
  }

  getCommunity(communityId: string): Promise<Community> {
    return this.raw.getCommunity({ community_id: communityId });
  }

  getCommunityChannels(communityId: string): Promise<Channel[]> {
    return this.raw.getCommunityChannels({ community_id: communityId });
  }

  getCommunityMembers(
    communityId: string,
    options: MemberListOptions = {},
  ): Promise<ApiUserInfo[]> {
    return this.raw.getCommunityMembers({ ...options, community_id: communityId });
  }

  getCommunityMemberCount(communityId: string): Promise<number> {
    return this.raw.getCommunityMemberCount({ community_id: communityId });
  }

  getCommunityOwner(communityId: string): Promise<string> {
    return this.raw.getCommunityOwner({ community_id: communityId });
  }

  banCommunityMember(communityId: string, params: BanCommunityMemberParams): Promise<void> {
    return this.raw.banCommunityMember({ ...params, community_id: communityId });
  }

  unbanCommunityMember(communityId: string, userId: string): Promise<void> {
    return this.raw.unbanCommunityMember({ community_id: communityId, user_id: userId });
  }

  muteCommunityMember(
    communityId: string,
    userId: string,
    params: MuteCommunityMemberParams,
  ): Promise<void> {
    return this.raw.muteCommunityMember({
      ...params,
      community_id: communityId,
      user_id: userId,
    });
  }

  unmuteCommunityMember(communityId: string, userId: string): Promise<void> {
    return this.raw.unmuteCommunityMember({ community_id: communityId, user_id: userId });
  }

  getCommunityRoles(communityId: string): Promise<CommunityRole[]> {
    return this.raw.getCommunityRoles({ community_id: communityId });
  }

  updateCommunityMemberRoles(
    communityId: string,
    params: UpdateCommunityMemberRolesParams,
  ): Promise<void> {
    return this.raw.updateCommunityMemberRoles({ ...params, community_id: communityId });
  }

  getCommunityRoleMembers(
    communityId: string,
    roleId: string,
    options: MemberListOptions = {},
  ): Promise<ApiUserInfo[]> {
    return this.raw.getCommunityRoleMembers({
      ...options,
      community_id: communityId,
      role_id: roleId,
    });
  }

  getUser(userId: string, options: GetUserOptions = {}): Promise<ApiUserInfo> {
    return this.raw.getUser({ ...options, user_id: userId });
  }

  createDmChannel(userId: string): Promise<DMChannel> {
    return this.raw.createDmChannel({ user_id: userId });
  }

  getMe(): Promise<BotInfo> {
    return this.raw.getMe();
  }

  uploadImage(params: UploadImageParams): Promise<ImageUploadResponse> {
    return this.raw.uploadImage(params);
  }

  private rawCall<M extends RawApiMethod>(
    method: M,
    payload: RawPayload<M>,
    signal?: AbortSignal,
  ): Promise<RawResult<M>> {
    return this.call(method, payload, signal);
  }

  private callApi<M extends RawApiMethod>(
    method: M,
    payload: RawPayload<M>,
    signal?: AbortSignal,
  ): Promise<RawResult<M>> {
    const request = requestFor(method, payload);
    return this.client.request<RawResult<M>>(request.path, { ...request, signal });
  }
}

type RawRequest = {
  path: string;
  method: string;
  query?: QueryParams;
  body?: unknown;
  form_data?: FormData;
};

function requestFor(method: RawApiMethod, payload: RawPayload): RawRequest {
  switch (method) {
    case "getUpdates":
      return {
        path: "/bot/v1/messages",
        method: "GET",
        query: payload as RawGetUpdatesParams,
      };
    case "sendMessage":
      return { path: "/bot/v2/messages", method: "POST", body: payload };
    case "sendBatchMessages":
      return { path: "/bot/v1/messages/batch", method: "POST", body: payload };
    case "sendMarkdownMessage":
      return { path: "/bot/v1/md_messages", method: "POST", body: payload };
    case "editMessage": {
      const args = payload as RawEditMessageParams;
      return {
        path: `/bot/v1/messages/${encodeURIComponent(args.message_id)}`,
        method: "PATCH",
        body: withoutKeys(args, ["message_id"]),
      };
    }
    case "deleteMessage": {
      const args = payload as RawDeleteMessageParams;
      return {
        path: `/bot/v1/channels/${encodeURIComponent(args.channel_id)}/messages/${encodeURIComponent(args.message_id)}`,
        method: "DELETE",
      };
    }
    case "setMessageReaction": {
      const args = payload as RawSetMessageReactionParams;
      return {
        path: `/bot/v1/channels/${encodeURIComponent(args.channel_id)}/messages/${encodeURIComponent(args.message_id)}/reaction`,
        method: "PATCH",
        body: withoutKeys(args, ["channel_id", "message_id"]),
      };
    }
    case "addMessageKeys":
      return { path: "/bot/v1/messages/keys", method: "POST", body: payload };
    case "deleteMessageKey":
      return {
        path: "/bot/v1/messages/keys",
        method: "DELETE",
        query: payload as DeleteMessageKeyParams,
      };
    case "getCommunity": {
      const args = payload as RawGetCommunityParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}`,
        method: "GET",
      };
    }
    case "getCommunityChannels": {
      const args = payload as RawGetCommunityParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/channels`,
        method: "GET",
      };
    }
    case "getCommunityMembers": {
      const args = payload as RawGetCommunityMembersParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/members`,
        method: "GET",
        query: withoutKeys(args, ["community_id"]),
      };
    }
    case "getCommunityMemberCount": {
      const args = payload as RawGetCommunityParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/members/count`,
        method: "GET",
      };
    }
    case "getCommunityOwner": {
      const args = payload as RawGetCommunityParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/owner`,
        method: "GET",
      };
    }
    case "banCommunityMember": {
      const args = payload as RawBanCommunityMemberParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/ban`,
        method: "POST",
        body: withoutKeys(args, ["community_id"]),
      };
    }
    case "unbanCommunityMember": {
      const args = payload as RawUnbanCommunityMemberParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/ban`,
        method: "DELETE",
        query: { user_id: args.user_id },
      };
    }
    case "muteCommunityMember": {
      const args = payload as RawMuteCommunityMemberParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/members/${encodeURIComponent(args.user_id)}/mute`,
        method: "POST",
        body: withoutKeys(args, ["community_id", "user_id"]),
      };
    }
    case "unmuteCommunityMember": {
      const args = payload as RawCommunityMemberParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/members/${encodeURIComponent(args.user_id)}/mute`,
        method: "DELETE",
      };
    }
    case "getCommunityRoles": {
      const args = payload as RawGetCommunityParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/roles`,
        method: "GET",
      };
    }
    case "updateCommunityMemberRoles": {
      const args = payload as RawUpdateCommunityMemberRolesParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/roles`,
        method: "PATCH",
        body: withoutKeys(args, ["community_id"]),
      };
    }
    case "getCommunityRoleMembers": {
      const args = payload as RawGetCommunityRoleMembersParams;
      return {
        path: `/bot/v1/communities/${encodeURIComponent(args.community_id)}/roles/${encodeURIComponent(args.role_id)}/members`,
        method: "GET",
        query: withoutKeys(args, ["community_id", "role_id"]),
      };
    }
    case "getUser": {
      const args = payload as RawGetUserParams;
      return {
        path: `/bot/v1/users/${encodeURIComponent(args.user_id)}`,
        method: "GET",
        query: withoutKeys(args, ["user_id"]),
      };
    }
    case "createDmChannel": {
      const args = payload as RawCreateDmChannelParams;
      return { path: `/bot/v1/users/${encodeURIComponent(args.user_id)}/dm`, method: "POST" };
    }
    case "getMe":
      return { path: "/bot/v1/me", method: "GET" };
    case "uploadImage":
      return { path: "/bot/v1/upload/image", method: "POST", form_data: imageFormData(payload) };
  }
}

function messageBody(params: SendMessageParams): RawSendMessageParams {
  return {
    channel_id: params.channel_id,
    content: params.content,
    quote_id: params.quote_id,
    type: params.type,
    attachments: params.attachments,
    ephemeral: params.ephemeral,
    user_ids: params.user_ids,
    disable_reactions: params.disable_reactions,
    reactions: params.reactions,
    richtext: params.richtext,
  };
}

function imageFormData(payload: RawPayload): FormData {
  const params = payload as RawUploadImageParams;
  const form = new FormData();

  if (params.file) form.append("file", params.file);
  if (params.filename) form.append("filename", params.filename);
  if (params.operations) form.append("operations", JSON.stringify(params.operations));

  return form;
}

function withoutKeys<T extends Record<string, unknown>, K extends keyof T>(
  value: T,
  keys: K[],
): Omit<T, K> {
  const copy = { ...value };

  for (const key of keys) {
    delete copy[key];
  }

  return copy;
}
