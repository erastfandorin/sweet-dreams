import * as config from './config.js';
import express from 'express';
import path from 'path';
import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import commands from './commands/commands.js';
import { setupLoggerMiddleware } from './middlewares/setup-logger.middleware.js';
import { debugLoggerMiddleware } from './middlewares/debug-logger.middleware.js';

const app = express();
export const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN);

bot.use(new LocalSession({ database: path.join(process.cwd(), '/tmp/db.json') }).middleware());
bot.use(setupLoggerMiddleware());
bot.use(debugLoggerMiddleware());

bot.start(ctx => commands.start(ctx));
bot.command('alldream', async ctx => commands.getAllDreams(ctx));

bot.action(/dreamId.*/, ctx => commands.getCurrentDream(ctx));
bot.action(['dreamListMinus', 'dreamListPlus'], ctx => commands.changeDreamPage(ctx));
bot.action('sendDream', async ctx => commands.sendDream(ctx));

bot.on('text', ctx => commands.checkDreamText(ctx));

if (config.isDevelopment) {
  bot.launch();
  app.listen(process.env.BOT_PORT, () => console.log(`My server is running on ${process.env.BOT_PORT}`));
} else if (config.isProduction) {
  bot
    .launch({
      webhook: {
        domain: process.env.DOMAIN,
        port: process.env.BOT_PORT || 8000,
      },
    })
    .then(() => console.log('Webhook bot listening on port', process.env.BOT_PORT));
}
