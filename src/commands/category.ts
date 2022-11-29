import type { Message } from "discord.js";
import { channelIdList } from "../channelIdList";
import { updateChannelList } from "../channelList";
import {
  CATEGORIES,
  CATEGORY_COMMANDS,
  RESPONSE_MESSAGE_MAP,
} from "../constants";
import prisma from "../prisma";
import { contains, every } from "../utils";

const category = async (message: Message<boolean>, args: string[] = []) => {
  if (!channelIdList.includes(message.channelId)) {
    message.reply(RESPONSE_MESSAGE_MAP.NOTIFICATION.NOT_SET);
    return;
  }

  if (args.length === 0) {
    const currentCategories = await prisma.channel.findUnique({
      select: { categories: { select: { category: true } } },
      where: { channelId: message.channelId },
    });
    const currentCategoriesString = currentCategories?.categories.reduce(
      (prev, curr) => `${prev}\n\`${curr.category}\``,
      ""
    );
    message.reply(
      RESPONSE_MESSAGE_MAP.CATEGORY.CURRENT(currentCategoriesString)
    );
    return;
  }

  const categoryCommand = args.shift();
  const [secondArgument] = args;
  if (!categoryCommand || !contains(CATEGORY_COMMANDS, categoryCommand)) {
    message.reply(RESPONSE_MESSAGE_MAP.CATEGORY.HELP);
    return;
  }

  const allCategories = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
  ];

  const categoryAction = (action: CategoryAction) => async () => {
    if (secondArgument === "전체") {
      if (args.length !== 1) {
        message.reply(RESPONSE_MESSAGE_MAP.CATEGORY.ALL.ERROR);
        return;
      }

      await action(message, allCategories);
      return;
    }
    if (!secondArgument && args.length === 0) {
      message.reply(RESPONSE_MESSAGE_MAP.CATEGORY.HELP);
      return;
    }
    if (!every(args, CATEGORIES)) {
      message.reply(RESPONSE_MESSAGE_MAP.CATEGORY.ERROR);
      return;
    }
    const categories = args.map((value) => ({
      id: CATEGORIES.indexOf(value),
    }));
    await action(message, categories);
  };

  const argumentMap = {
    추가: categoryAction(addCategory),
    제거: categoryAction(deleteCategory),
    도움말: () => message.reply(RESPONSE_MESSAGE_MAP.CATEGORY.HELP),
  } as const;

  return argumentMap[categoryCommand]();
};

type CategoryAction = (
  message: Message<boolean>,
  categories: {
    id: number;
  }[]
) => Promise<void>;

const addCategory: CategoryAction = async (message, categories) => {
  const updateCategory = await prisma.channel.update({
    where: { channelId: message.channelId },
    data: { categories: { connect: categories } },
  });
  if (!updateCategory) {
    message.reply(RESPONSE_MESSAGE_MAP.CATEGORY.ADD.ERROR);
    return;
  }
  message.reply(RESPONSE_MESSAGE_MAP.CATEGORY.ADD.SUCCESS);
  await updateChannelList();
};

const deleteCategory: CategoryAction = async (message, categories) => {
  const disconnectCategory = await prisma.channel.update({
    where: { channelId: message.channelId },
    data: { categories: { disconnect: categories } },
  });
  if (!disconnectCategory) {
    message.reply(RESPONSE_MESSAGE_MAP.CATEGORY.DELETE.ERROR);
    return;
  }
  message.reply(RESPONSE_MESSAGE_MAP.CATEGORY.DELETE.SUCCESS);
  await updateChannelList();
};

export { category };
