import { Bot } from "../src/bot";
const bot = new Bot("replace_with_your_bot_token");

bot.on("message", async (ctx) => {
  console.log(JSON.stringify(ctx.message, null, 2));
  if (ctx.text?.includes("roll")) {
    const point = Math.floor(Math.random() * 6) + 1;
    await ctx.reply(`你的点数是 ${point}.`);
  }
});

bot.start();