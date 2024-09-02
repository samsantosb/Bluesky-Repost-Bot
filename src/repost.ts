import axios from "axios";
import { Notification } from "./interfaces/notifications";
import "dotenv/config";
import { mentionExists, saveMention } from "./redis";
import { createRepostData } from "./createRepostData";
import { api } from "./config/api";

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

  // Simplificação da verificação para ver se inclui "cc"
  const isCcMention = mention.record.text.toLowerCase().includes('cc');
  const parentExists = mention.record.reply?.parent;

  const target = isCcMention && parentExists ? mention.record.reply.parent : mention;
  const repostData = createRepostData(target, did);

  const { data } = await api.post(
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
