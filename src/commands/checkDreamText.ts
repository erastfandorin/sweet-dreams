import { Markup } from 'telegraf';
import { DreamBotContext } from '../types/types';
import { message } from 'telegraf/filters';

export default function checkDreamText(ctx: DreamBotContext) {
  if (ctx.session?.isUserStartedBot) {

    let messageText = '';
    if(ctx.has(message("text"))) {
      messageText = ctx.message.text!.replace(new RegExp(`@${ctx.botInfo.username}`, 'g'), '');
    }
    ctx.session.userDream = messageText;

    // check on urls
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(messageText)) {
      ctx.reply('Посилання в повідомленні заборонені\n\n Спробуй ще раз');
      return;
    }

    // check symbol count
    if (messageText.length <= 100) {
      ctx.reply('Твій сон повинен бути більше 100 символів(\n\n Спробуй ще раз');
      return;
    }

    // check bed worlds
    const badWorlds = ['хохлы', 'пидор', 'пидорас', 'пидрила', 'підор', 'нігер', 'ніга', 'www', 'com'];
    const hasHaveBadWorld = badWorlds.find(world => messageText.includes(world));
    if (hasHaveBadWorld) {
      ctx.replyWithHTML(`В тексті сну не повинно бути поганих слів, як <i>“${hasHaveBadWorld}”</i>\n\n Спробуй ще раз`);
      return;
    }

    // check zalgo text
    const hasZalgo = /%CC%/g.test(encodeURIComponent(messageText));
    if (hasZalgo) {
      ctx.replyWithHTML(`В тексті сну не повинно бути Zalgo тексту\n\n Спробуй ще раз`);
      return;
    }

    // check repeated worlds
    if (checkRepeatedInMessage('world', 4, messageText)) {
      ctx.replyWithHTML(`Слова часто повторюються підряд, схоже на спам\n\n Спробуй ще раз`);
      return;
    }

    // check repeated symbol
    if (checkRepeatedInMessage('symbol', 8, messageText)) {
      ctx.replyWithHTML(`Букви часто повторюються підряд, схоже на спам\n\n Спробуй ще раз`);
      return;
    }

    ctx.replyWithHTML(
      'Ти хочеш анонімно поділитися наступним сном:\n\n' + `<i>“${messageText}”</i>\n\n` + 'Чи все вірно?',
      sendEditKeyboard(messageText),
    );
  } else {
    ctx.reply('Нажміть /start щоб почати');
  }
}

function checkRepeatedInMessage(type: string, brakeCount: number, message: string) {
  let stringElement;
  if (type === 'world') {
    stringElement = message.split(' ');
  } else if (type === 'symbol') {
    stringElement = message.split('');
  }

  let counter = 1;
  let previousWorld;
  let currentWorld;

  if (stringElement) {
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
  return false;
}

function sendEditKeyboard(dreamText: any) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Так, публікуйте! 🥳', 'sendDream'),
      Markup.button.switchToCurrentChat('Редагувати ✍️', `${dreamText}`),
    ],
  ]);
}
