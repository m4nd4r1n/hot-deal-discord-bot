import type { ChannelList } from "./types";
import prisma from "./prisma";

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
