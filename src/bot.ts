import { Api, type ApiOptions } from "./api";
import { Composer } from "./composer";
import { Context } from "./context";
import type { BotErrorHandler, BotOptions, StartOptions, Update } from "./types/bot";

const DEFAULT_POLLING_INTERVAL = 3000;

export class Bot extends Composer<Context> {
  readonly api: Api;
  private readonly options: BotOptions;
  private running = false;
  private errorHandler?: BotErrorHandler;

  constructor(token: string, options: BotOptions = {}) {
    super();
    this.options = options;
    this.api = new Api(token, pickApiOptions(options));
  }

  catch(handler: BotErrorHandler): this {
    this.errorHandler = handler;
    return this;
  }

  stop(): void {
    this.running = false;
  }

  async start(options: StartOptions = {}): Promise<void> {
    const polling = {
      ...this.options.polling,
      ...options,
    };
    const interval = polling.interval ?? DEFAULT_POLLING_INTERVAL;

    this.running = true;

    while (this.running && !options.signal?.aborted) {
      try {
        const updates = await this.api.getUpdates({
          limit: polling.limit,
          filter: polling.allowed_updates?.map((update) => (update === "message" ? "im" : "event")),
        });

        for (const update of toUpdates(updates)) {
          await this.handleUpdate(update);
        }
      } catch (error) {
        await this.handleError(error);
      }

      if (this.running && !options.signal?.aborted) {
        await sleep(interval, options.signal);
      }
    }

    this.running = false;
  }

  private async handleUpdate(update: Update): Promise<void> {
    const ctx = new Context({ update, api: this.api });

    try {
      await this.middleware()(ctx);
    } catch (error) {
      await this.handleError(error, ctx);
    }
  }

  private async handleError(error: unknown, ctx?: Context): Promise<void> {
    if (this.errorHandler) {
      await this.errorHandler(error, ctx);
      return;
    }

    throw error;
  }
}

function pickApiOptions(options: BotOptions): ApiOptions {
  return {
    base_url: options.base_url,
    fetch: options.fetch,
  };
}

function toUpdates(result: Awaited<ReturnType<Api["getUpdates"]>>): Update[] {
  return [
    ...result.im.map((message): Update => ({ type: "message", message })),
    ...result.event.map((event): Update => ({ type: "event", event })),
  ];
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}
