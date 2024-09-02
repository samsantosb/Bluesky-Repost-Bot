import axios from "axios";
import { Token } from "./interfaces/token";
import { api } from "./config/api";

export async function getAccessToken(): Promise<Token> {
  const { data } = await api.post(
    `/com.atproto.server.createSession`,
    {
      identifier: process.env.IDENTIFIER,
      password: process.env.PASSWORD,
    }
  );

  return { token: data.accessJwt, did: data.did };
}
