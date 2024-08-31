const axios = require('axios');
const dotenv = require('dotenv');
const { createClient } = require('redis');

dotenv.config();

const API_URL = 'https://bsky.social/xrpc';

// Configurando o cliente Redis
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

async function getAccessToken() {
  const { data } = await axios.post(`${API_URL}/com.atproto.server.createSession`, {
    identifier: process.env.IDENTIFIER,
    password: process.env.PASSWORD
  });

  return { token: data.accessJwt, did: data.did };
}

async function getMentions(token) {
  const { data } = await axios.get(`${API_URL}/app.bsky.notification.listNotifications`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return { mentions: data.notifications.filter(({ reason }) => reason === 'mention') };
}

async function mentionExists(cid) {
  const result = await redisClient.exists(cid);
  return result === 1;
}

async function saveMention(cid) {
  await redisClient.set(cid, 'reposted');
}

async function repost(mention, token, did) {
  const isMention = await mentionExists(mention.cid)

  if (isMention) {
    console.log(`Already reposted: ${mention.cid}`);
    return { message: 'Already reposted', data: null };
  }

  console.log(`Reposting: ${mention.cid}`);

  const repostData = {
    $type: 'app.bsky.feed.repost',
    repo: did,
    collection: 'app.bsky.feed.repost',
    record: {
      subject: {
        uri: mention.uri,
        cid: mention.cid
      },
      createdAt: new Date().toISOString()
    }
  };

  const { data } = await axios.post(`${API_URL}/com.atproto.repo.createRecord`, repostData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  await saveMention(mention.cid);

  return { message: 'Reposted successfully', data };
}

module.exports = async (req, res) => {
  try {
    const startTime = new Date().toLocaleTimeString();
    console.log(`Tick executed ${startTime}`);

    const { token, did } = await getAccessToken();

    const { mentions } = await getMentions(token);

    if (!mentions.length) {
      console.log('No mentions found');
      res.status(200).json({ message: 'No mentions found' });
      return;
    }

    for (const mention of mentions) {
      await repost(mention, token, did);
    }

    res.status(200).json({ message: 'Reposts processed successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
