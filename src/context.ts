import type { Api } from "./api";
import type { ContextFactoryOptions, Update } from "./types/bot";
import type {
  EditCurrentMessageOptions,
  ReactOptions,
  ReplyMarkdownOptions,
  ReplyOptions,
} from "./types/context";
import type { Event, Message } from "./types/models";

export class Context {
  readonly update: Update;
  readonly api: Api;

  constructor(options: ContextFactoryOptions) {
    this.update = options.update;
    this.api = options.api;
  }

  get message(): Message | undefined {
    return this.update.type === "message" ? this.update.message : undefined;
  }

  get event(): Event | undefined {
    return this.update.type === "event" ? this.update.event : undefined;
  }

  get chatId(): string | undefined {
    return this.channelId;
  }

  get channelId(): string | undefined {
    return this.message?.channel_id ?? this.event?.channel_id ?? undefined;
  }

  get communityId(): string | undefined {
    return this.message?.community_id ?? this.event?.community_id ?? undefined;
  }

  get userId(): string | undefined {
    return this.message?.user_id ?? this.event?.user_id ?? undefined;
  }

  get messageId(): string | undefined {
    return this.message?.message_id ?? this.event?.message_id ?? undefined;
  }

  get text(): string | undefined {
    return this.message?.content;
  }

  reply(content: string, options: ReplyOptions = {}) {
    const channelId = this.requireChannelId("reply");
    const { quote = true, quote_id, ...rest } = options;

    return this.api.sendMessage({
      ...rest,
      channel_id: channelId,
      content,
      quote_id: quote ? (quote_id ?? this.messageId) : quote_id,
      type: rest.type ?? 0,
    });
  }

  replyMarkdown(content: string, options: ReplyMarkdownOptions = {}) {
    return this.api.sendMarkdownMessage({
      ...options,
      channel_id: this.requireChannelId("reply with markdown"),
      content,
    });
  }

  editMessage(content: string, options: EditCurrentMessageOptions = {}) {
    const messageId = this.requireMessageId("edit message");

    return this.api.editMessage(messageId, {
      ...options,
      channel_id: this.requireChannelId("edit message"),
      content,
    });
  }

  deleteMessage() {
    return this.api.deleteMessage(
      this.requireChannelId("delete message"),
      this.requireMessageId("delete message"),
    );
  }

  react(reaction: ReactOptions) {
    return this.api.setMessageReaction(
      this.requireChannelId("react to message"),
      this.requireMessageId("react to message"),
      {
        enable: reaction.enable ?? true,
        name: reaction.name,
      },
    );
  }

  private requireChannelId(action: string): string {
    if (!this.channelId) {
      throw new Error(`Cannot ${action}: current update has no channel ID`);
    }

    return this.channelId;
  }

  private requireMessageId(action: string): string {
    if (!this.messageId) {
      throw new Error(`Cannot ${action}: current update has no message ID`);
    }

    return this.messageId;
  }
}
