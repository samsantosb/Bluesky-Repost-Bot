import axios from "axios";
import { Notification } from "./interfaces/notifications";
import "dotenv/config";
import { mentionExists, saveMention } from "./redis";

export async function repost(
  mention: Notification,
  token: string,
  did: string
) {
  const isMention = await mentionExists(mention.cid);

  if (isMention) {
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

  await saveMention(mention.cid);

  return { message: "Reposted successfully", data };
}
