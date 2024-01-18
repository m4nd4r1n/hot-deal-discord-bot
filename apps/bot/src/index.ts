import cron from 'node-cron';

import { createPostUrlArray, getNewPosts, loadPosts, savePosts } from '@/post';
import { scrapeHotDeals } from '@/scrape';
import {
  deleteWebhooksByUrls,
  distinguishWebhooks,
  getWebhookResponses,
  loadWebhooks,
  sendMessage,
} from '@/webhook';

const run = async () => {
  try {
    const [prevPosts, posts] = await Promise.all([loadPosts(), scrapeHotDeals()]);
    const newPosts = getNewPosts(prevPosts, posts);
    if (!newPosts.length) return;

    const webhooks = await loadWebhooks();
    const webhookResponses = await getWebhookResponses(webhooks);
    const [enabledWebhooks, disabledWebhookUrls] = distinguishWebhooks(webhooks, webhookResponses);
    await Promise.all([
      sendMessage(newPosts, enabledWebhooks),
      savePosts(createPostUrlArray(posts)),
      deleteWebhooksByUrls(disabledWebhookUrls),
    ]);
  } catch (e) {
    console.error(e);
  }
};

cron.schedule('* * * * *', run);
