import * as config from './config.js';
import express from 'express';
import { Telegraf, session } from 'telegraf';
import { DreamBotContext } from './types/types.js';
import { message } from 'telegraf/filters';
import { Update } from 'telegraf/types';
import * as commands from './commands/commands.js';
import { setupLoggerMiddleware } from './middlewares/setup-logger.middleware.js';
import { debugLoggerMiddleware } from './middlewares/debug-logger.middleware.js';

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const app = express();
export const bot = new Telegraf<DreamBotContext>(String(process.env.TELEGRAM_API_TOKEN), {
  telegram: { webhookReply: false },
});

bot.use(session({ defaultSession: () => ({ ...config.defaultSession }) }));
bot.use(setupLoggerMiddleware());
bot.use(debugLoggerMiddleware());

bot.start((ctx: DreamBotContext<Update.MessageUpdate>) => commands.start(ctx));
bot.command('allDreams', async (ctx: DreamBotContext<Update.MessageUpdate>) => commands.getAllDreams(ctx));

bot.action(/dreamId.*/, (ctx: DreamBotContext<Update.CallbackQueryUpdate>) => commands.getCurrentDream(ctx));
bot.action(['dreamListMinus', 'dreamListPlus'], (ctx: DreamBotContext<Update.CallbackQueryUpdate>) => commands.changeDreamPage(ctx));
bot.action('sendDream', async ctx => commands.sendDream(ctx));

bot.on(message('text'), (ctx: DreamBotContext) => commands.checkDreamText(ctx));

if (config.isDevelopment) {
  bot.launch();
  app.listen(process.env.BOT_PORT, () => console.log(`My server is running on ${process.env.BOT_PORT}`));
} else if (config.isProduction) {
  bot
    .launch({
      webhook: {
        domain: String(process.env.DOMAIN),
        port: Number(process.env.BOT_PORT || 8000),
      },
    })
    .then(() => console.log('Webhook bot listening on port', process.env.BOT_PORT));
}
