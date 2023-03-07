import { DreamBotContext } from '../types/types.js';
import { Update } from 'telegraf/types';
import { getUser, getDream, setDream, getUserDreams } from '../api.js';
import createDreamsList from './createDreamsList.js';
import checkDreamText from './checkDreamText.js';

export function start(ctx: DreamBotContext<Update.MessageUpdate>) {
  ctx.session.isUserStartedBot = true;

  ctx.reply(
    `Привіт, ${ctx.update.message.from.first_name}! Мене звати Сновидець ✨\n\n` +
      'Я допоможу тобі поділитися своїм сном. Натомість, ти побачиш сон іншого учасника!\n\n' +
      'Наше з тобою спілкування повністю анонімне, ми не розголошуємо авторів сновидінь!\n\n' +
      'Напиши свій сон у полі для введеня тексту ⬇️',
  );
}

export async function getAllDreams(ctx: DreamBotContext<Update.MessageUpdate>) {
  const userId = ctx.update.message.from.id;
  const allDreams = await getUserDreams(userId);

  if (!Array.isArray(allDreams)) {
    return;
  }
  ctx.session.allUserDreams = allDreams;

  ctx.reply('Щоденник твоїх снів:', createDreamsList(ctx.session));
}

export async function getCurrentDream(ctx: DreamBotContext<Update.CallbackQueryUpdate>) {
  const dreamId = Number(ctx.match[0].match(/[0-9]+/));

  if (!ctx.session.allUserDreams) {
    const userId = ctx.callbackQuery.from.id;
    const allDreams = await getUserDreams(userId);

    if (!Array.isArray(allDreams)) {
      return;
    }
    ctx.session.allUserDreams = allDreams;
  }

  const currentDream = ctx.session.allUserDreams.find(dream => dream.dreamId === dreamId);
  if (currentDream) ctx.reply(currentDream);
}

export function changeDreamPage(ctx: DreamBotContext<Update.CallbackQueryUpdate>) {
  const action = ctx.match[0];

  const dreamPage = ctx.session.currentDreamPage;

  switch (action) {
    case 'dreamListMinus':
      if (dreamPage > 1) {
        ctx.session.currentDreamPage = ctx.session.currentDreamPage - 1;
        ctx.editMessageText('Щоденник твоїх снів:', createDreamsList(ctx.session));
      }
      break;
    case 'dreamListPlus':
      const { allUserDreams: dreams, step } = ctx.session;

      let allPageCount;
      if (dreams && step) allPageCount = Math.ceil(dreams.length / step);

      if (allPageCount && dreamPage < allPageCount) {
        ctx.session.currentDreamPage = ctx.session.currentDreamPage + 1;
        ctx.editMessageText('Щоденник твоїх снів:', createDreamsList(ctx.session));
      }
      break;
    default:
      console.error('Error');
      break;
  }
}

export async function sendDream(ctx: DreamBotContext<Update.CallbackQueryUpdate>) {
  const currentUserId = ctx.callbackQuery.from.id;
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

export {
  checkDreamText,
}

