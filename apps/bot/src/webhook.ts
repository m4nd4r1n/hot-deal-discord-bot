import { prisma } from '@repo/database';

import type { Embed, Post, Webhook, WebhookBody } from '@/types';

export const sendMessage = (newPosts: Post[], webhooks: Webhook[]) =>
  Promise.all(createWebhookExecutes(newPosts, webhooks));

const createWebhookExecutes = (posts: Post[], webhooks: Webhook[]) => {
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

const createEmbedObject = ({ url, category, thumbnail, shipping, title, cost }: Post): Embed => ({
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

export const loadWebhooks = () =>
  prisma.channel.findMany({
    select: { webhook_url: true, subscribed_categories: { select: { category: true } } },
  });

export const distinguishWebhooks = (
  webhooks: Webhook[],
  responses: Response[],
): readonly [Webhook[], string[]] => {
  const notFoundResponses = responses.filter(({ status }) => status === 404);
  if (!notFoundResponses.length) return [webhooks, []];

  const disabledWebhookUrls = notFoundResponses.map(({ url }) => url);
  const disabledWebhookUrlMap = createDisabledWebhookUrlMap(disabledWebhookUrls);
  const enabledWebhooks = webhooks.filter(
    ({ webhook_url }) => !disabledWebhookUrlMap.get(webhook_url),
  );
  return [enabledWebhooks, disabledWebhookUrls];
};

const createDisabledWebhookUrlMap = (disabledWebhookUrls: string[]) =>
  disabledWebhookUrls.reduce((map, url) => {
    map.set(url, true);
    return map;
  }, new Map<string, boolean>());

export const getWebhookResponses = (webhooks: Webhook[]) =>
  Promise.all(webhooks.map(({ webhook_url }) => fetch(webhook_url)));

export const deleteWebhooksByUrls = (urls: string[]) =>
  prisma.channel.deleteMany({ where: { webhook_url: { in: urls } } });

const EMBED_COLOR = 0xff9726;
const BOT_USERNAME = '핫딜 게시판';
const BOT_AVATAR_URL = 'https://kr.object.ncloudstorage.com/static-image/1.jpg';
