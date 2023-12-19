import { prisma } from '@repo/database';

import type { Embed, HotDeal, WebhookBody } from '@/types';

export const sendMessage = async (newPosts: HotDeal[]) => {
  const webhooks = await loadWebhooks();
  const executes = createWebhookExecutes(newPosts, webhooks);
  await Promise.all(executes);
};

const loadWebhooks = () =>
  prisma.channel.findMany({
    select: { webhook_url: true, subscribed_categories: { select: { category: true } } },
  });

const createWebhookExecutes = (
  posts: HotDeal[],
  webhooks: Awaited<ReturnType<typeof loadWebhooks>>,
) => {
  const executes: Promise<Response>[] = [];

  posts.forEach((saleInfo) => {
    const subscribed = webhooks.filter(({ subscribed_categories }) =>
      subscribed_categories.some(({ category }) => category === saleInfo.category),
    );
    const body = createWebhookBody(createEmbedObject(saleInfo));

    subscribed.forEach(({ webhook_url }) => {
      executes.push(executeWebhook(webhook_url, body));
    });
  });

  return executes;
};

const createWebhookBody = (embed: Embed): WebhookBody => ({
  username: BOT_USERNAME,
  avatar_url: BOT_AVATAR_URL,
  embeds: [embed],
});

const createEmbedObject = ({
  url,
  category,
  thumbnail,
  shipping,
  title,
  cost,
}: HotDeal): Embed => ({
  title,
  url,
  color: EMBED_COLOR,
  author: { name: category },
  thumbnail: { url: thumbnail },
  fields: [{ name: cost, value: shipping }],
});

const executeWebhook = (url: string, body: WebhookBody) =>
  fetch(url, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

const EMBED_COLOR = 0xff9726;
const BOT_USERNAME = '핫딜 게시판';
const BOT_AVATAR_URL = 'https://kr.object.ncloudstorage.com/static-image/1.jpg';
