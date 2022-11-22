import { config } from 'dotenv';
import express from 'express';
import { Telegraf, Markup, session } from 'telegraf';

import { getUser, getDream, getUserDreams, setDream } from './api.js';

config();

function sendEditKeyboard(dreamText) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Так, публікуйте! 🥳', 'sendDream'),
      Markup.button.switchToCurrentChat('Редагувати ✍️', `${dreamText}`),
    ],
  ]);
}

function createDreamsList(ctx) {
  const dreams = ctx.session.allUserDreams;
  const step = ctx.session.step;
  const dreamPage = ctx.session.currentDreamPage;

  const currentDream = [];

  const currentDreamMax = dreamPage * step;
  const currentDreamMin = currentDreamMax - step;

  dreams.forEach((dream, index) => {
    if (
      currentDream.length < step &&
      index >= currentDreamMin &&
      index <= currentDreamMax
    ) {
      currentDream.push([
        Markup.button.callback(`${dream.text}`, `dreamId${dream.dreamId}`),
      ]);
    }
  });

  const allPageCount = Math.ceil(dreams.length / step);
  const navigationKeyboard = [
    Markup.button.callback(`⬅️`, `dreamListMinus`),
    Markup.button.callback(`${dreamPage}/${allPageCount}`, `plug`),
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
  ctx.session.step = 6;

  const userId = ctx.update.message.from.id;
  const allDreams = await getUserDreams(userId);
  ctx.session.allUserDreams = allDreams;

  ctx.reply('Щоденник твоїх снів:', createDreamsList(ctx));
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

  const dreamPage = ctx.session.currentDreamPage;
  switch (action) {
    case 'dreamListMinus':
      if (dreamPage > 1) {
        ctx.session.currentDreamPage = ctx.session.currentDreamPage - 1;
        ctx.editMessageText('Щоденник твоїх снів:', createDreamsList(ctx));
      }
      break;

    case 'dreamListPlus':
      const dreams = ctx.session.allUserDreams;
      const step = ctx.session.step;
      const allPageCount = Math.ceil(dreams.length / step);

      if (dreamPage < allPageCount) {
        ctx.session.currentDreamPage = ctx.session.currentDreamPage + 1;
        ctx.editMessageText('Щоденник твоїх снів:', createDreamsList(ctx));
      }
      break;

    default:
      console.error('Error');
      break;
  }
});

bot.start(ctx => {
  ctx.session = {};

  ctx.session.isStartActive = true;
  ctx.reply(
    `Привіт, ${ctx.update.message.from.first_name}! Мене звати Сновидець ✨\n\n` +
      'Я допоможу тобі поділитися своїм сном. Натомість, ти побачиш сон іншого учасника!\n\n' +
      'Наше з тобою спілкування повністю анонімне, ми не розголошуємо авторів сновидінь!\n\n' +
      'Напиши свій сон у полі для введеня тексту ⬇️',
  );
});

bot.on('text', ctx => {
  if (ctx.session?.isStartActive) {
    const messageText = ctx.message.text.replace(/@sweet_dreams_tgbot /g, ''); ///// @sweet_dreams_tgbot - telegram bot name
    ctx.session.messageText = messageText;

    // check on urls
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(messageText)) {
      ctx.reply('Посилання в повідомленні заборонені\n\n Спробуй ще раз');
      return;
    }

    // check symbol count
    if (messageText.length <= 100) {
      ctx.reply(
        'Твій сон повинен бути більше 100 символів(\n\n Спробуй ще раз',
      );
      return;
    }

    // check bed worlds
    const badWorlds = [
      'хохлы',
      'пидор',
      'пидорас',
      'пидрила',
      'підор',
      'нігер',
      'ніга',
      'www',
      'com',
    ];
    const hasHaveBadWorld = badWorlds.find(world =>
      messageText.includes(world),
    );
    if (hasHaveBadWorld) {
      ctx.replyWithHTML(
        `В тексті сну не повинно бути поганих слів, як <i>“${hasHaveBadWorld}”</i>\n\n Спробуй ще раз`,
      );
      return;
    }

    // check zalgo text
    const hasZalgo = /%CC%/g.test(encodeURIComponent(messageText));
    if (hasZalgo) {
      ctx.replyWithHTML(
        `В тексті сну не повинно бути Zalgo тексту\n\n Спробуй ще раз`,
      );
      return;
    }

    // check repeated worlds
    if (checkRepeatedInMessage('world', 4, messageText)) {
      ctx.replyWithHTML(
        `Слова часто повторюються підряд, схоже на спам\n\n Спробуй ще раз`,
      );
      return;
    }

    // check repeated symbol
    if (checkRepeatedInMessage('symbol', 8, messageText)) {
      ctx.replyWithHTML(
        `Букви часто повторюються підряд, схоже на спам\n\n Спробуй ще раз`,
      );
      return;
    }

    function checkRepeatedInMessage(type, brakeCount, message) {
      let stringElement;
      if (type === 'world') {
        stringElement = message.split(' ');
      } else if (type === 'symbol') {
        stringElement = message.split('');
      }

      let counter = 1;
      let previousWorld;
      let currentWorld;

      for (let i = 0; i < stringElement.length; i++) {
        currentWorld = stringElement[i];

        if (previousWorld === currentWorld) {
          counter = counter + 1;
        } else {
          counter = 1;
        }

        if (counter === brakeCount) {
          return true;
        }
        previousWorld = currentWorld;
      }
      return false;
    }

    ctx.replyWithHTML(
      'Ти хочеш анонімно поділитися наступним сном:\n\n' +
        `<i>“${messageText}”</i>\n\n` +
        'Чи все вірно?',
      sendEditKeyboard(messageText),
    );
  } else {
    ctx.reply('Нажміть /start щоб почати');
  }
});

bot.action('sendDream', async ctx => {
  const currentUserId = ctx.update.callback_query.from.id;
  let user;
  do {
    user = await getUser();
  } while (currentUserId === user.userId);

  const randomDream = await getDream(user.userId);

  await setDream(ctx);

  ctx.editMessageText(
    'Дякую, ти супер! 😇\n\n' +
      'Тримай сон від нашого анонімного користувача:\n\n' +
      `<i>“${randomDream.text}”</i>\n\n`+
      'Якщо хочеш поділитист ще одним сном, відправ мені його нижче ⬇️',

    { parse_mode: 'HTML' },
  );
});

bot.launch();
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));
