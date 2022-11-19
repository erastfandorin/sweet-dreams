import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { ref, set, onValue, getDatabase, child, get } from 'firebase/database';
// import { getAnalytics } from "firebase/analytics";

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

async function getUser(userId) {
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

async function getDream(userId, dreamId) {
  if (dreamId) {
    const user_bot_data = await get(
      child(ref(db), 'users/' + userId + '/userDreams/' + dreamId),
    );
    return user_bot_data.val();
  } else {
    const allUserDreams = await getUserDreams(userId);

    const userDreamIDs = Object.keys(allUserDreams);
    const randomDreamCount = Math.floor(Math.random() * userDreamIDs.length);
    return allUserDreams[randomDreamCount];
  }
}

async function getUserDreams(userId) {
  try {
    const data = await get(child(ref(db), 'users/' + userId + '/userDreams/'));
    return Object.values(data.val());
  } catch (err) {
    console.error(err);
  }
}

async function setDream(ctx) {
  const dreamId = ctx.update.callback_query.message.message_id;
  const dream = ctx.session?.messageText;
  const userId = ctx.update.callback_query.from.id;
  const userName = ctx.update.callback_query.from.username;

  const user = await getUser(userId);
  if (!user) {
    await set(child(ref(db), 'users/' + userId), {
      userId: userId,
      username: userName || 'anon', /// [inline mention of a user](tg://user?id=<user_id>)
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
