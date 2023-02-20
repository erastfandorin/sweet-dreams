import { bot } from '../../../index.js';

export async function handler(event) {
  try {
    console.log(event.body);
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: '' };
  } catch (e) {
    console.error('error in handler:', e);
    return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
  }
}
