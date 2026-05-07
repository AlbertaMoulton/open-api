import type { ComposerFilter, Filter, Middleware } from "./types/bot";
import { Context } from "./context";

type MiddlewareEntry<C extends Context> = {
  filter: Filter<C>;
  middleware: Middleware<C>;
};

export class Composer<C extends Context = Context> {
  private readonly entries: MiddlewareEntry<C>[] = [];

  use(middleware: Middleware<C>): this {
    this.entries.push({ filter: () => true, middleware });
    return this;
  }

  on(filter: ComposerFilter, middleware: Middleware<C>): this {
    this.entries.push({ filter: filterFromName(filter), middleware });
    return this;
  }

  command(name: string, middleware: Middleware<C>): this {
    const prefix = `/${name}`;

    this.entries.push({
      filter: (ctx) => {
        const text = ctx.text;
        return text === prefix || text?.startsWith(`${prefix} `) === true;
      },
      middleware,
    });

    return this;
  }

  filter(predicate: Filter<C>, middleware: Middleware<C>): this {
    this.entries.push({ filter: predicate, middleware });
    return this;
  }

  middleware(): Middleware<C> {
    return async (ctx, next = async () => undefined) => {
      await run(this.entries, ctx, next, 0);
    };
  }
}

async function run<C extends Context>(
  entries: MiddlewareEntry<C>[],
  ctx: C,
  outerNext: () => Promise<void>,
  index: number,
): Promise<void> {
  if (index >= entries.length) {
    await outerNext();
    return;
  }

  const entry = entries[index];

  if (!entry.filter(ctx)) {
    await run(entries, ctx, outerNext, index + 1);
    return;
  }

  let nextCalled = false;
  await entry.middleware(ctx, async () => {
    if (nextCalled) {
      throw new Error("next() called multiple times");
    }

    nextCalled = true;
    await run(entries, ctx, outerNext, index + 1);
  });
}

function filterFromName<C extends Context>(filter: ComposerFilter): Filter<C> {
  if (filter === "message") {
    return (ctx) => ctx.update.type === "message";
  }

  if (filter === "message:text") {
    return (ctx) => ctx.update.type === "message" && typeof ctx.text === "string" && ctx.text.length > 0;
  }

  if (filter === "message:markdown") {
    return (ctx) => ctx.update.type === "message" && ctx.message?.type === 15;
  }

  if (filter === "event") {
    return (ctx) => ctx.update.type === "event";
  }

  if (filter.startsWith("event:")) {
    const action = filter.slice("event:".length);
    return (ctx) => ctx.update.type === "event" && ctx.event?.action === action;
  }

  return () => false;
}
