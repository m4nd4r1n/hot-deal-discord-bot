import cron from 'node-cron';

import { getNewPosts, savePosts } from '@/post';
import { sendMessage } from '@/send';

const run = async () => {
  try {
    const [newPosts, posts] = await getNewPosts();
    if (!newPosts.length) return;

    const postUrls = posts.map(({ url }) => ({ url }));

    await Promise.all([sendMessage(newPosts), savePosts(postUrls)]);
  } catch (e) {
    console.error(e);
  }
};

cron.schedule('* * * * *', run);
