const axios = require('axios');
const dotenv = require('dotenv');
const { createClient } = require('redis');

dotenv.config();

const API_URL = 'https://bsky.social/xrpc';

const HALF_HOUR = 30 * 60;
const SIX_HOURS = 6 * 60 * 60;

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

const getAccessToken = async () => {
  const [cachedToken, cachedDid] =
    await Promise.all(
      [redisClient.get('accessToken'), redisClient.get('did')])

  const isTokenValid = cachedToken && cachedDid;

  if (isTokenValid) {
    return { token: cachedToken, did: cachedDid };
  }

  const { data } = await axios.post(`${API_URL}/com.atproto.server.createSession`, {
    identifier: process.env.IDENTIFIER,
    password: process.env.PASSWORD,
  });


  await Promise.all(
    [redisClient.set('accessToken', data.accessJwt, 'EX', HALF_HOUR),
    redisClient.set('did', data.did, 'EX', HALF_HOUR)]);

  return { token: data.accessJwt, did: data.did };
};

const getMentions = async (token) => {
  const { data } = await axios.get(`${API_URL}/app.bsky.notification.listNotifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return { mentions: data.notifications.filter(({ reason }) => reason === 'mention') };
};

const mentionIsAlreadyRegistered = async (cid) => {
  return (await redisClient.exists(cid)) === 1;
};

const saveMention = async (cid) => {
  await redisClient.set(cid, 'reposted', 'EX', SIX_HOURS);
};

const createRepostData = (target, did) => ({
  $type: 'app.bsky.feed.repost',
  repo: did,
  collection: 'app.bsky.feed.repost',
  record: {
    subject: { uri: target.uri, cid: target.cid },
    createdAt: new Date().toISOString(),
  },
});

const repost = async (mention, token, did) => {
  const isAlreadyReposted = await mentionIsAlreadyRegistered(mention.cid);

  if (isAlreadyReposted) {
    console.log(`Already reposted: ${mention.cid}`);
    return { message: 'Already reposted', data: null };
  }

  console.log(`Reposting: ${mention.cid}`);

  const isCcMention = mention.record.text.toLowerCase().includes('cc');
  const parentExists = mention.record.reply?.parent;

  const target = isCcMention && parentExists ? mention.record.reply.parent : mention;
  const repostData = createRepostData(target, did);

  const { data } = await axios.post(`${API_URL}/com.atproto.repo.createRecord`, repostData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await saveMention(mention.cid);

  return { message: 'Reposted successfully', data };
};

module.exports = async (req, res) => {
  try {
    console.log(`Tick executed ${new Date().toLocaleTimeString()}`);

    const { token, did } = await getAccessToken();
    const mentions = await getMentions(token);

    if (!mentions.length) {
      console.log('No mentions found');
      return res.status(200).json({ message: 'No mentions found' });
    }

    for (const mention of mentions) {
      await repost(mention, token, did);
    }

    return res.status(200).json({ message: 'Reposts processed successfully' });
  } catch (error) {
    console.error('Error:', error);

    if (error.response && error.response.status === 401) {
      await Promise.all([redisClient.del('accessToken'), redisClient.del('did')]);
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
