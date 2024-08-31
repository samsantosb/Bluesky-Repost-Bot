import axios from 'axios';
import 'dotenv/config';
import { Notification } from './interfaces/notifications';
export async function repost(mention: Notification, token: string, did: string, processedMentions) {
  if (processedMentions.has(mention.cid)) {
    console.log(`Already reposted: ${mention.cid}`);
    return { message: "Already reposted", data: null };
  }

  console.log(`Reposting: ${mention.cid}`);

  const repostData = {
    $type: "app.bsky.feed.repost",
    repo: did,
    collection: "app.bsky.feed.repost",
    record: {
      subject: {
        uri: mention.uri,
        cid: mention.cid,
      },
      createdAt: new Date().toISOString(),
    },
  };

  const { data } = await axios.post(
    `${process.env.API_URL}/com.atproto.repo.createRecord`,
    repostData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  processedMentions.add(mention.cid);

  return { message: "Reposted successfully", data };
}
