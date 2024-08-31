import axios from "axios";
import "dotenv/config";
import { ResponseListNotifications } from "./interfaces/notifications";
import { Mentions } from "./interfaces/mentions";

export async function getMentions(token: string): Promise<Mentions> {
  const { data } = await axios.get<ResponseListNotifications>(
    `${process.env.API_URL}/app.bsky.notification.listNotifications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return {
    mentions: data.notifications.filter(({ reason }) => reason === "mention"),
  };
}
