import cron from 'node-cron';

import { createPostUrlArray, getNewPosts, loadPosts, savePosts } from '@/post';
import { scrapeHotDeals } from '@/scrape';
import { loadWebhooks, sendMessage } from '@/webhook';

const run = async () => {
  try {
    const [prevPosts, posts] = await Promise.all([loadPosts(), scrapeHotDeals()]);
    const newPosts = getNewPosts(prevPosts, posts);
    if (!newPosts.length) return;

    const webhooks = await loadWebhooks();
    await Promise.all([sendMessage(newPosts, webhooks), savePosts(createPostUrlArray(posts))]);
  } catch (e) {
    console.error(e);
  }
};

cron.schedule('* * * * *', run);
