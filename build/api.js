"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDream = exports.getUserDreams = exports.getDream = exports.getUser = void 0;
const app_1 = require("firebase/app");
const database_1 = require("firebase/database");
// import { getAnalytics } from "firebase/analytics";
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
const db = (0, database_1.getDatabase)((0, app_1.initializeApp)(firebaseConfig));
// const analytics = getAnalytics(app);
async function getUser(userId) {
    if (userId) {
        const user_bot_data = await (0, database_1.get)((0, database_1.child)((0, database_1.ref)(db), 'users/' + userId));
        return user_bot_data.val();
    }
    else {
        const user_bot_data = await (0, database_1.get)((0, database_1.child)((0, database_1.ref)(db), `users/`));
        const allUsers = Object.values(user_bot_data.val());
        const userIDs = Object.keys(allUsers);
        const randomUserCount = Math.floor(Math.random() * userIDs.length);
        return allUsers[randomUserCount];
    }
}
exports.getUser = getUser;
async function getDream(userId, dreamId) {
    if (dreamId) {
        const user_bot_data = await (0, database_1.get)((0, database_1.child)((0, database_1.ref)(db), 'users/' + userId + '/userDreams/' + dreamId));
        return user_bot_data.val();
    }
    else {
        const allUserDreams = await getUserDreams(userId);
        const userDreamIDs = Object.keys(allUserDreams);
        const randomDreamCount = Math.floor(Math.random() * userDreamIDs.length);
        return allUserDreams[randomDreamCount];
    }
}
exports.getDream = getDream;
async function getUserDreams(userId) {
    const data = await (0, database_1.get)((0, database_1.child)((0, database_1.ref)(db), 'users/' + userId + '/userDreams/'));
    return Object.values(data.val());
}
exports.getUserDreams = getUserDreams;
async function setDream(ctx) {
    const dreamId = String(ctx.callbackQuery?.message?.message_id);
    const dream = ctx.session?.userDream;
    const userId = ctx.callbackQuery.from.id;
    const user = await getUser(userId);
    if (!user) {
        await (0, database_1.set)((0, database_1.child)((0, database_1.ref)(db), 'users/' + userId), {
            userId: userId,
            userDreams: { [dreamId]: { dreamId: dreamId, text: dream } },
        });
    }
    else {
        await (0, database_1.set)((0, database_1.child)((0, database_1.ref)(db), 'users/' + userId + '/userDreams/' + dreamId), {
            dreamId: dreamId,
            text: dream,
        });
    }
}
exports.setDream = setDream;
