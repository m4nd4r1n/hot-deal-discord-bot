import type { TChannelList } from "./types/index.js";
import prisma from "./prisma/client.js";

export const channelList: ChannelList[] = [];

export const updateChannelList = async () => {
  const newChannelList = await getChannelList();
  if (!newChannelList) return;
  channelList.length = 0;
  channelList.push(...newChannelList);
};

const getChannelList = async (): Promise<ChannelList[] | undefined> => {
  try {
    const channelList = await prisma.channel.findMany({
      select: {
        channelId: true,
        categories: { select: { category: true } },
        keywords: { select: { keyword: true } },
      },
    });
    return channelList;
  } catch (e) {
    console.error(e);
  }
};
