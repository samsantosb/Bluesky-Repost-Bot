import { repost } from "./repost";
import { getMentions } from './mentions';
import { getAccessToken } from './token';
import 'dotenv/config';

const processedMentions = new Set<string>();

const ONE_MINUTE = 60000;
const ONE_HOUR = 3600000;

async function main() {
  try {
    const startTime = new Date().toLocaleTimeString();
    console.log(`Tick executed ${startTime}`);

    const { token, did } = await getAccessToken();

    const { mentions } = await getMentions(token);

    if (!mentions.length) {
      console.log("No mentions found");
      return;
    }

    for (const mention of mentions) {
      await repost(mention, token, did, processedMentions);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();

setInterval(() => {
  main();
}, ONE_MINUTE);

setInterval(() => {
  processedMentions.clear();
  console.log("Cleared processed mentions set");
}, ONE_HOUR);

