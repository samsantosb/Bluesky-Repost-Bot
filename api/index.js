async function repost(mention, token, did) {
  const isMention = await mentionExists(mention.cid);

  if (isMention) {
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
      'Authorization': `Bearer ${token}`
    }
  });

  await saveMention(mention.cid);

  return { message: 'Reposted successfully', data };
}
