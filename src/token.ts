import axios from "axios";
import { Token } from "./interfaces/token";

export async function getAccessToken(): Promise<Token> {
  const { data } = await axios.post(
    `${process.env.API_URL}/com.atproto.server.createSession`,
    {
      identifier: process.env.IDENTIFIER,
      password: process.env.PASSWORD,
    }
  );

  return { token: data.accessJwt, did: data.did };
}
