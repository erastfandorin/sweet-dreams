"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDreamText = exports.sendDream = exports.changeDreamPage = exports.getCurrentDream = exports.getAllDreams = exports.start = void 0;
const api_js_1 = require("../api.js");
const createDreamsList_js_1 = __importDefault(require("./createDreamsList.js"));
const checkDreamText_js_1 = __importDefault(require("./checkDreamText.js"));
exports.checkDreamText = checkDreamText_js_1.default;
function start(ctx) {
    ctx.session.isUserStartedBot = true;
    ctx.reply(`Привіт, ${ctx.update.message.from.first_name}! Мене звати Сновидець ✨\n\n` +
        'Я допоможу тобі поділитися своїм сном. Натомість, ти побачиш сон іншого учасника!\n\n' +
        'Наше з тобою спілкування повністю анонімне, ми не розголошуємо авторів сновидінь!\n\n' +
        'Напиши свій сон у полі для введеня тексту ⬇️');
}
exports.start = start;
async function getAllDreams(ctx) {
    const userId = ctx.update.message.from.id;
    const allDreams = await (0, api_js_1.getUserDreams)(userId);
    if (!Array.isArray(allDreams)) {
        return;
    }
    ctx.session.allUserDreams = allDreams;
    ctx.reply('Щоденник твоїх снів:', (0, createDreamsList_js_1.default)(ctx.session));
}
exports.getAllDreams = getAllDreams;
async function getCurrentDream(ctx) {
    const dreamId = Number(ctx.match[0].match(/[0-9]+/));
    if (!ctx.session.allUserDreams) {
        const userId = ctx.callbackQuery.from.id;
        const allDreams = await (0, api_js_1.getUserDreams)(userId);
        if (!Array.isArray(allDreams)) {
            return;
        }
        ctx.session.allUserDreams = allDreams;
    }
    const currentDream = ctx.session.allUserDreams.find(dream => dream.dreamId === dreamId);
    if (currentDream)
        ctx.reply(currentDream);
}
exports.getCurrentDream = getCurrentDream;
function changeDreamPage(ctx) {
    const action = ctx.match[0];
    const dreamPage = ctx.session.currentDreamPage;
    switch (action) {
        case 'dreamListMinus':
            if (dreamPage > 1) {
                ctx.session.currentDreamPage = ctx.session.currentDreamPage - 1;
                ctx.editMessageText('Щоденник твоїх снів:', (0, createDreamsList_js_1.default)(ctx.session));
            }
            break;
        case 'dreamListPlus':
            const { allUserDreams: dreams, step } = ctx.session;
            let allPageCount;
            if (dreams && step)
                allPageCount = Math.ceil(dreams.length / step);
            if (allPageCount && dreamPage < allPageCount) {
                ctx.session.currentDreamPage = ctx.session.currentDreamPage + 1;
                ctx.editMessageText('Щоденник твоїх снів:', (0, createDreamsList_js_1.default)(ctx.session));
            }
            break;
        default:
            console.error('Error');
            break;
    }
}
exports.changeDreamPage = changeDreamPage;
async function sendDream(ctx) {
    const currentUserId = ctx.callbackQuery.from.id;
    let user;
    do {
        user = await (0, api_js_1.getUser)();
    } while (currentUserId === user.userId);
    const randomDream = await (0, api_js_1.getDream)(user.userId);
    await (0, api_js_1.setDream)(ctx);
    ctx.editMessageText('Дякую, ти супер! 😇\n\n' +
        'Тримай сон від нашого анонімного користувача:\n\n' +
        `<i>“${randomDream.text}”</i>\n\n` +
        'Якщо хочеш поділитист ще одним сном, відправ мені його нижче ⬇️', { parse_mode: 'HTML' });
}
exports.sendDream = sendDream;
