import { repost } from "./repost";
import { getMentions } from './mentions';
import { getAccessToken } from './token';
import { connectRedis } from "./redis";
import 'dotenv/config';

connectRedis()

export async function main(req, res) {
  try {
    const startTime = new Date().toLocaleTimeString();
    console.log(`Tick executed ${startTime}`);

    const { token, did } = await getAccessToken();

    const { mentions } = await getMentions(token);

    if (!mentions.length) {
      console.log("No mentions found");
      res.status(200).json({ message: 'No mentions found' });
      return;
    }

    for (const mention of mentions) {
      await repost(mention, token, did);
    }
    res.status(200).json({ message: 'Reposts processed successfully' });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
    process.exit(1);
  }
}

