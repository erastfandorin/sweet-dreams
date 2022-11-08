import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
import { ref, set, onValue, getDatabase, child, get } from 'firebase/database';
import express from 'express';
import { Telegraf, Markup, session } from 'telegraf';

config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
const db = getDatabase(initializeApp(firebaseConfig));
// const analytics = getAnalytics(app);

// Markup.keyboard([["Розповісти сон анонімно", "Розповісти сон відкрито"]]).resize();

function sendEditKeyboard(dreamText) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Так, публікуйте! 🥳', 'sendDream'),
      Markup.button.switchToCurrentChat('Редагувати ✍️', `${dreamText}`),
    ],
  ]);
}

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN);
const PORT = 3000;

bot.use(session());

bot.start(ctx => {
  ctx.session = {};

  ctx.session.isStartActive = true;
  ctx.replyWithHTML(
    `Привіт, ${ctx.update.message.from.first_name}! Мене звати Вечірній Повістяр ✨\n\n` +
      'Я допоможу тобі поділитися своїм сном. Натомість, ти побачиш сон іншого учасника!\n\n' +
      'Напиши свій сон у полі для введеня тексту ⬇️',
  );
});

bot.on('text', ctx => {
  if (ctx.session?.isStartActive) {
    const messageText = ctx.message.text.replace(/@sweet_dreams_tgbot /g, ''); ///// @sweet_dreams_tgbot - telegram bot name
    ctx.session.messageText = messageText;

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
  const user = await getUser();
  const randomDream = await getDream(user.userId);

  // console.log('2', ctx.update.callback_query.from.id); //username
  // console.log('3', ctx.update);
  // console.log('4', ctx);

  await setDream(user, ctx.session?.messageText)

  ctx.editMessageText(
    'Дякую, ти супер! 😇\n\n' +
      'Тримай сон від нашого анонімного користувача:\n\n' +
      `<i>“${randomDream.text}”</i>`,
    { parse_mode: 'HTML' },
  );
});

// bot.hears(/^удалить\s(\d+)$/, (ctx) => {

// bot.hears("Смотивируй меня", (ctx) => {
//   ctx.replyWithPhoto(
//     "https://img2.goodfon.ru/wallpaper/nbig/7/ec/justdoit-dzhastduit-motivaciya.jpg",
//     {
//       caption: "Не вздумай сдаваться!",
//     }
//   );
// });

// handle all telegram updates with HTTPs trigger
// exports.echoBot = functions.https.onRequest(async (request, response) => {
// 	functions.logger.log('Incoming message', request.body)
// 	return await bot.handleUpdate(request.body, response).then((rv) => {
// 		// if it's not a request from the telegram, rv will be undefined, but we should respond with 200
// 		return !rv && response.sendStatus(200)
// 	})
// })

bot.launch();
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));

async function getUser(userId) {
  if (userId) {
    return await get(child(ref(db), 'users/' + userId));
  } else {
    const user_bot_data = await get(child(ref(db), `users/`));
    const allUsers = Object.values(user_bot_data.val());

    const userIDs = Object.keys(allUsers);
    const randomUserCount = Math.floor(Math.random() * userIDs.length);

    return allUsers[randomUserCount];
  }
}

async function getDream(userId, dreamId) {
  if (dreamId) {
    return await get(
      child(ref(db), 'users/' + userId + '/userDreams/' + dreamId),
    );
  } else {
    const user_bot_data = getUserDreams(userId);
    const allUserDreams = Object.values(user_bot_data.val());

    const userDreamIDs = Object.keys(allUserDreams);
    const randomDreamCount = Math.floor(Math.random() * userDreamIDs.length);
    return allUserDreams[randomDreamCount];
  }
}

async function getUserDreams(userId) {
  return await get(child(ref(db), 'users/' + userId + '/userDreams/'));
}

async function setDream(user, dream) {
  console.log(user);
  // console.log('2', ctx.update.callback_query.from.id); //username
  await set(child(ref(db), 'users/' + user.userId), {
    userId: user.userId,
    username: user.username || "anon", /// [inline mention of a user](tg://user?id=<user_id>)
    userDreams: dream,
  });
}

//   /// api request
//   const setNewDream = (userId, dream) => {
//     set(ref(db, "users/" + userId), {
//       userId: userId,
//       text: dream,
//     });
//   };
