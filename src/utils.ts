import prisma from "./prisma";
import { ChannelList } from "./types";

export const getChannelList = async (): Promise<ChannelList[] | undefined> => {
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

export const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};
