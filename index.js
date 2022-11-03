import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// import { getAnalytics } from "firebase/analytics";
import { ref, set, onValue } from 'firebase/database';

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

// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// export const db = getDatabase(app);

config();

import express from 'express';
import { Telegraf, Markup, session } from 'telegraf';

// Markup.keyboard([["Розповісти сон анонімно", "Розповісти сон відкрито"]]).resize();

function yesNoKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Так, публікуйте! 🥳', 'yes'),
      Markup.button.callback('Редагувати ✍️', 'no'),
    ],
  ]);
}

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN);
const PORT = 3000;

bot.use(session());

bot.start(ctx => {
  ctx.session = { isStartActive: true };
  ctx.replyWithHTML(
    `Привіт, ${ctx.update.message.from.first_name}! Мене звати Вечірній Повістяр ✨\n\n` +
      'Я допоможу тобі поділитися своїм сном. Натомість, ти побачиш сон іншого учасника!\n\n' +
      'Напиши свій сон у полі для введеня тексту ⬇️',
  );
});

bot.on('text', ctx => {
  if (ctx.session?.isStartActive) {
    ctx.replyWithHTML(
      'Ти хочеш анонімно поділитися наступним сном:\n\n' +
        `<i>“${ctx.message.text}”</i>\n\n` +
        'Чи все вірно?',
      yesNoKeyboard(),
    );
  } else {
    ctx.reply('Нажміть /start щоб почати');
  }
});

bot.action(['yes', 'no'], ctx => {
  if (ctx.callbackQuery.data === 'yes') {
    ctx.editMessageText(
      'Дякую, ти супер! 😇' +
        'Тримай сон від нашого анонімного користувача\ користувача під ніком “клікабельний_нік” :' +
        '“Я продавав Юпітер своєму таргану, а він подарував мені бузок, який став матеріалом для лодки. Так й створився весь світ, ну а я просто кунжут!”',
    );
  } else {
    // ctx.deleteMessage();
  }
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

bot.launch();
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));

//   const getDreams = async (setAllDreams) => {
//     const starCountRef = ref(db, "dreams/");
//     onValue(starCountRef, (snapshot) => {
//       const data = snapshot.val();
//       setAllDreams(data);
//     });
//   };

//   const getUniqueId = (allDreams) => {
//     let dreamsIDs = [];
//     for (let dream in allDreams) {
//       dreamsIDs.push(dream);
//     }
//     return createUniqueID(dreamsIDs);
//   };

//   const submitForm = (dream) => {
//     const newID = getUniqueId(allDreams);
//     setNewDream(newID, dream);
//   };

//   /// api request
//   const setNewDream = (userId, dream) => {
//     set(ref(db, "dreams/" + userId), {
//       userId: userId,
//       text: dream,
//     });
//   };
