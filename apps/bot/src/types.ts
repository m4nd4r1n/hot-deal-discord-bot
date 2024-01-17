export type Post = {
  title: string;
  url: string;
  cost: string;
  shipping: string;
  category: string;
  thumbnail: string;
};

export type Embed = {
  title: string;
  url: string;
  color: number;
  author: { name: string };
  thumbnail: { url: string };
  fields: { name: string; value: string }[];
};

export type WebhookBody = {
  username: string;
  avatar_url: string;
  embeds: Embed[];
};

export type Webhook = { webhook_url: string; subscribed_categories: { category: string }[] };

export type PostUrl = Pick<Post, 'url'>;
