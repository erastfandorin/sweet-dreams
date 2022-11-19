import { config } from 'dotenv';
import express from 'express';
import { Telegraf, Markup, session } from 'telegraf';

import { getUser, getDream, getUserDreams, setDream } from "./api.js";

config();

function sendEditKeyboard(dreamText) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Так, публікуйте! 🥳', 'sendDream'),
      Markup.button.switchToCurrentChat('Редагувати ✍️', `${dreamText}`),
    ],
  ]);
}

function createDreamList(ctx) {
  const dreams = ctx.session?.allUserDreams;
  const step = 3;
  const currentDream = [];

  dreams.forEach(dream => {
    if (currentDream.length < step) {
      currentDream.push([
        Markup.button.callback(`${dream.text}`, `dreamId${dream.dreamId}`),
      ]);
    }
  });

  const allPageCount = dreams.length / step;
  const navigationKeyboard = [
    Markup.button.callback(`⬅️`, `dreamListMinus`),
    Markup.button.callback(
      `${ctx.session?.currentDreamPage}/${allPageCount}`,
      `plug`,
    ),
    Markup.button.callback(`➡️`, `dreamListPlus`),
  ];

  const keyboard = [...currentDream, navigationKeyboard];

  return Markup.inlineKeyboard(keyboard);
}

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN);
const PORT = 3000;

bot.use(session());

// get list with all dreams
bot.command('alldream', async ctx => {
  ctx.session = {};
  ctx.session.currentDreamPage = 1;

  const userId = ctx.update.message.from.id;
  const allDreams = await getUserDreams(userId);
  ctx.session.allUserDreams = allDreams;

  ctx.reply('Вибери сон:', createDreamList(ctx));
});

// get current dream
bot.action(/dreamId.*/, ctx => {
  const dreamId = ctx.update.callback_query.data.match(/[0-9]+/)[0];
  const currentDream = ctx.session.allUserDreams.find(
    dream => dream.dreamId === Number(dreamId),
  );
  ctx.reply(currentDream);
});

// change dream page
bot.action(['dreamListMinus', 'dreamListPlus'], ctx => {
  const action = ctx.update.callback_query.data;

  switch (action) {
    case 'dreamListMinus':
      break;
    case 'dreamListPlus':
      break;
    default:
      console.error('Error');
      break;
  }
  console.log( ctx.session.allUserDreams);

});

bot.start(ctx => {
  ctx.session = {};

  ctx.session.isStartActive = true;
  ctx.reply(
    `Привіт, ${ctx.update.message.from.first_name}! Мене звати Вечірній Повістяр ✨\n\n` +
      'Я допоможу тобі поділитися своїм сном. Натомість, ти побачиш сон іншого учасника!\n\n' +
      'Напиши свій сон у полі для введеня тексту ⬇️',
  );
});

bot.on('text', ctx => {
  if (ctx.session?.isStartActive) {
    const messageText = ctx.message.text.replace(/@sweet_dreams_tgbot /g, ''); ///// @sweet_dreams_tgbot - telegram bot name
    ctx.session.messageText = messageText;

    if (messageText.length <= 100) {
      ctx.replyWithHTML(
        'Твій сон повинен бути більше 100 символів(\n\n Спробуй ще раз',
      );
    } else {
      ctx.replyWithHTML(
        'Ти хочеш анонімно поділитися наступним сном:\n\n' +
          `<i>“${messageText}”</i>\n\n` +
          'Чи все вірно?',
        sendEditKeyboard(messageText),
      );
    }
  } else {
    ctx.reply('Нажміть /start щоб почати');
  }
});

bot.action('sendDream', async ctx => {
  const user = await getUser();
  const randomDream = await getDream(user.userId);

  // console.log('2', ctx.update.callback_query.from.id); //username
  await setDream(ctx);

  ctx.editMessageText(
    'Дякую, ти супер! 😇\n\n' +
      'Тримай сон від нашого анонімного користувача:\n\n' +
      `<i>“${randomDream.text}”</i>`,
    { parse_mode: 'HTML' },
  );
});

bot.launch();
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));
