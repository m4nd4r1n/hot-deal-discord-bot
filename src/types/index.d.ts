export type TSaleInfo = {
  title: string;
  url: string;
  cost: string;
  shipping: string;
  category: string;
  thumbnail?: string;
};

export type TChannelList = {
  channelId: string;
  keywords: { keyword: string }[];
  categories: { category: string }[];
};
