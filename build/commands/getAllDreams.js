"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const api_js_1 = require("../api.js");
async function getAllDreams(ctx) {
    ctx.session = {};
    ctx.session.currentDreamPage = 1;
    ctx.session.step = 6;
    const userId = ctx.update.message.from.id;
    const allDreams = await (0, api_js_1.getUserDreams)(userId);
    ctx.session.allUserDreams = allDreams;
    ctx.reply('Щоденник твоїх снів:', createDreamsList(ctx));
}
exports.default = getAllDreams;
function createDreamsList(ctx) {
    const dreams = ctx.session.allUserDreams;
    const step = ctx.session.step;
    const dreamPage = ctx.session.currentDreamPage;
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
}
