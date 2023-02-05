import { getUser, getDream, setDream } from '../api.js';

import getAllDreams from './getAllDreams.js';
import checkDreamText from './checkDreamText.js';

export default {
  start: ctx => start(ctx),
  getAllDreams: async ctx => getAllDreams(ctx),

  getCurrentDream: ctx => getCurrentDream(ctx),
  changeDreamPage: ctx => changeDreamPage(ctx),
  checkDreamText: ctx => checkDreamText(ctx),

  sendDream: async ctx => sendDream(ctx),
};

function start(ctx) {
  ctx.session = {};

  ctx.session.isStartActive = true;
  ctx.reply(
    `Привіт, ${ctx.update.message.from.first_name}! Мене звати Сновидець ✨\n\n` +
      'Я допоможу тобі поділитися своїм сном. Натомість, ти побачиш сон іншого учасника!\n\n' +
      'Наше з тобою спілкування повністю анонімне, ми не розголошуємо авторів сновидінь!\n\n' +
      'Напиши свій сон у полі для введеня тексту ⬇️',
  );
}

function getCurrentDream(ctx) {
  const dreamId = ctx.update.callback_query.data.match(/[0-9]+/)[0];
  const currentDream = ctx.session.allUserDreams.find(dream => dream.dreamId === Number(dreamId));
  ctx.reply(currentDream);
}

function changeDreamPage(ctx) {
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
}

async function sendDream(ctx) {
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
      `<i>“${randomDream.text}”</i>\n\n` +
      'Якщо хочеш поділитист ще одним сном, відправ мені його нижче ⬇️',

    { parse_mode: 'HTML' },
  );
}
