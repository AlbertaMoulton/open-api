import { Bot } from "../src/bot";

declare const process: {
  env: Record<string, string | undefined>;
};

const token = process.env.TEAMGAGA_BOT_TOKEN;

if (!token) {
  throw new Error("TEAMGAGA_BOT_TOKEN is required");
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  await ctx.reply("欢迎使用");
});

bot.on("message", async (ctx) => {
  console.log("-----------Received message--------------");
  console.log(JSON.stringify(ctx, null, 2));
  if (ctx.text?.includes("roll")) {
    const point = Math.floor(Math.random() * 6) + 1;
    await ctx.reply(`你的点数是 ${point}.`);
  }
  if (ctx.text?.includes("赞")) {
    await ctx.react({ name: "thumbs_up" });
  }
  if (ctx.text?.includes("表态事件测试")) {
    await ctx.api.sendMessage({
      channel_id: ctx.channelId!,
      content: "快来表明你的态度吧，看看大家的反应！",
      reactions: [
        { enable: true, name: "thumbs_up" },
        { enable: true, name: "thumbs_down" },
      ],
    });
  }
});

bot.on("event:Reaction", async (ctx) => {
  console.log("-----------Reaction event--------------");
  console.log(JSON.stringify(ctx.event, null, 2));
  //   await ctx.api.sendMessage({
  //     channel_id: ctx.channelId!,
  //     content: `@{!${ctx.event?.user_id}}对消息的态度是：${ctx.event?.data?.name}。`,
  //   });
});

void bot.start();
console.log("Bot started");
