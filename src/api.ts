import { DreamBotContext } from './types/types.js';
import { Update } from 'telegraf/types';
import { initializeApp } from 'firebase/app';
import { ref, set, getDatabase, child, get } from 'firebase/database';

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

async function getUser(userId?: number) {
  if (userId) {
    const user_bot_data = await get(child(ref(db), 'users/' + userId));
    return user_bot_data.val();
  } else {
    const user_bot_data = await get(child(ref(db), `users/`));
    const allUsers = Object.values(user_bot_data.val());

    const userIDs = Object.keys(allUsers);
    const randomUserCount = Math.floor(Math.random() * userIDs.length);

    return allUsers[randomUserCount];
  }
}

async function getDream(userId?: number, dreamId?: number) {
  if (dreamId) {
    const user_bot_data = await get(child(ref(db), 'users/' + userId + '/userDreams/' + dreamId));
    return user_bot_data.val();
  } else {
    const allUserDreams = await getUserDreams(userId);

    const userDreamIDs = Object.keys(allUserDreams);
    const randomDreamCount = Math.floor(Math.random() * userDreamIDs.length);
    return allUserDreams[randomDreamCount];
  }
}

async function getUserDreams(userId?: number) {
  const data = await get(child(ref(db), 'users/' + userId + '/userDreams/'));
  return Object.values(data.val());
}

async function setDream(ctx: DreamBotContext<Update.CallbackQueryUpdate>) {
  const dreamId = String(ctx.callbackQuery?.message?.message_id);
  const dream = ctx.session?.userDream;
  const userId = ctx.callbackQuery.from.id;

  const user = await getUser(userId);
  if (!user) {
    await set(child(ref(db), 'users/' + userId), {
      userId: userId,
      userDreams: { [dreamId]: { dreamId: dreamId, text: dream } },
    });
  } else {
    await set(child(ref(db), 'users/' + userId + '/userDreams/' + dreamId), {
      dreamId: dreamId,
      text: dream,
    });
  }
}

export { getUser, getDream, getUserDreams, setDream };
