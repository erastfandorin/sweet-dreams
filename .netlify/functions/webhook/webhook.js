// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
import { bot } from '../../../index.js';

export default handler = async event => {
  try {
    const subject = event.queryStringParameters.name || 'World';
    await bot.handleUpdate(JSON.parse(event.body));
    console.log('');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Hello ${subject}` }),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
