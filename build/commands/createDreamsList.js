"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
exports.default = (session) => {
    const { allUserDreams: dreams, step, currentDreamPage: dreamPage } = session;
    const currentDream = [];
    const currentDreamMax = dreamPage * step;
    const currentDreamMin = currentDreamMax - step;
    dreams.forEach((dream, index) => {
        if (currentDream.length < step && index >= currentDreamMin && index <= currentDreamMax) {
            currentDream.push([telegraf_1.Markup.button.callback(`${dream.text}`, `dreamId${dream.dreamId}`)]);
        }
    });
    const allPageCount = Math.ceil(dreams.length / step);
    const navigationKeyboard = [
        telegraf_1.Markup.button.callback(`⬅️`, `dreamListMinus`),
        telegraf_1.Markup.button.callback(`${dreamPage}/${allPageCount}`, `plug`),
        telegraf_1.Markup.button.callback(`➡️`, `dreamListPlus`),
    ];
    const keyboard = [...currentDream, navigationKeyboard];
    return telegraf_1.Markup.inlineKeyboard(keyboard);
};
