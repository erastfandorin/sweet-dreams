import { Markup } from 'telegraf';
import { ISessionData } from '../types/types.js';
import { InlineKeyboardButton } from 'telegraf/types';

export default (session: ISessionData) => {
  const { allUserDreams: dreams, step, currentDreamPage: dreamPage } = session;

  const currentDream: InlineKeyboardButton.CallbackButton[][] = [];

  const currentDreamMax = dreamPage * step;
  const currentDreamMin = currentDreamMax - step;

  dreams!.forEach((dream, index) => {
    if (currentDream.length < step && index >= currentDreamMin && index <= currentDreamMax) {
      currentDream.push([Markup.button.callback(`${dream.text}`, `dreamId${dream.dreamId}`)]);
    }
  });

  const allPageCount = Math.ceil(dreams!.length / step);
  const navigationKeyboard = [
    Markup.button.callback(`⬅️`, `dreamListMinus`),
    Markup.button.callback(`${dreamPage}/${allPageCount}`, `plug`),
    Markup.button.callback(`➡️`, `dreamListPlus`),
  ];

  const keyboard = [...currentDream, navigationKeyboard];

  return Markup.inlineKeyboard(keyboard);
};
