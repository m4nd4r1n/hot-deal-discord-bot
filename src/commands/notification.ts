import type { Message } from "discord.js";
import { channelIdList } from "../channelIdList";
import { updateChannelList } from "../channelList";
import { CATEGORIES, RESPONSE_MESSAGE_MAP } from "../constants";
import prisma from "../prisma";

const setNotify = async (message: Message<boolean>) => {
  if (channelIdList.includes(message.channelId)) {
    message.reply(RESPONSE_MESSAGE_MAP.NOTIFICATION.ALREADY_SET);
    return;
  }

  channelIdList.push(message.channelId);
  const initialCategory = [
    { id: CATEGORIES.indexOf("PC/하드웨어") },
    { id: CATEGORIES.indexOf("노트북/모바일") },
    { id: CATEGORIES.indexOf("가전/TV") },
  ];
  const channelCreate = await prisma.channel.create({
    data: {
      channelId: message.channelId,
      categories: {
        connect: initialCategory,
      },
    },
  });
  if (!channelCreate) {
    message.reply(RESPONSE_MESSAGE_MAP.NOTIFICATION.SET.ERROR);
    return;
  }
  message.reply(RESPONSE_MESSAGE_MAP.NOTIFICATION.SET.SUCCESS);
  await updateChannelList();
};

const deleteNotify = async (message: Message<boolean>) => {
  if (!channelIdList.includes(message.channelId)) {
    message.reply(RESPONSE_MESSAGE_MAP.NOTIFICATION.NOT_SET);
    return;
  }

  const ChannelDelete = await prisma.channel.delete({
    where: { channelId: message.channelId },
  });
  if (!ChannelDelete) {
    message.reply(RESPONSE_MESSAGE_MAP.NOTIFICATION.DELETE.ERROR);
    return;
  }
  channelIdList.splice(channelIdList.indexOf(message.channelId), 1);
  message.reply(RESPONSE_MESSAGE_MAP.NOTIFICATION.DELETE.SUCCESS);
  await updateChannelList();
};

export { setNotify, deleteNotify };
