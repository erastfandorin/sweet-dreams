import { config } from 'dotenv';
import express from 'express';
import { Telegraf, session } from 'telegraf';
import commands from './commands/commands.js';

config();

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN);
const PORT = 3000;

bot.use(session());

bot.start(ctx => commands.start(ctx));
bot.command('alldream', async ctx => commands.getAllDreams(ctx));

bot.action(/dreamId.*/, ctx => commands.getCurrentDream(ctx));
bot.action(['dreamListMinus', 'dreamListPlus'], ctx => commands.changeDreamPage(ctx));
bot.action('sendDream', async ctx => commands.sendDream(ctx));

bot.on('text', ctx => commands.checkDreamText(ctx));


// bot
//   .launch({
//     webhook: { domain: 'https://92d0-178-133-77-25.eu.ngrok.io', port: 443 },
//   })
//   .then(() => console.log('Webhook bot listening on port', 3000));
bot.launch();
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));
