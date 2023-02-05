import { Markup } from 'telegraf';
import { getUserDreams } from '../api.js';

export default async function getAllDreams(ctx) {
  ctx.session = {};
  ctx.session.currentDreamPage = 1;
  ctx.session.step = 6;

  const userId = ctx.update.message.from.id;
  const allDreams = await getUserDreams(userId);
  ctx.session.allUserDreams = allDreams;

  ctx.reply('Щоденник твоїх снів:', createDreamsList(ctx));
}

function createDreamsList(ctx) {
  const dreams = ctx.session.allUserDreams;
  const step = ctx.session.step;
  const dreamPage = ctx.session.currentDreamPage;

  const currentDream = [];

  const currentDreamMax = dreamPage * step;
  const currentDreamMin = currentDreamMax - step;

  dreams.forEach((dream, index) => {
    if (currentDream.length < step && index >= currentDreamMin && index <= currentDreamMax) {
      currentDream.push([Markup.button.callback(`${dream.text}`, `dreamId${dream.dreamId}`)]);
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
