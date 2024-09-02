import { Parent } from "./interfaces/notifications";

export const createRepostData = (target: Parent, did: string) => ({
    $type: 'app.bsky.feed.repost',
    repo: did,
    collection: 'app.bsky.feed.repost',
    record: {
      subject: { uri: target.uri, cid: target.cid },
      createdAt: new Date().toISOString(),
    },
  });