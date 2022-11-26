import Discord from "discord.js";
import dotenv from "dotenv";

import getSaleInfo from "./crawling";
import { getChannelList, sleep } from "./utils";
import prisma from "./prisma";

import type { ChannelList } from "./types";

dotenv.config();

const PREFIX = "!";
const CATEGORIES = [
  "",
  "PC/하드웨어",
  "상품권/쿠폰",
  "게임/SW",
  "노트북/모바일",
  "가전/TV",
  "생활/식품",
  "패션/의류",
  "기타",
];
const HELP_TEXT = ["help", "h", "명령어", "도움말"];
const COLOR = 0xff9726;

const channelIdList: string[] = [];
const channelList: ChannelList[] = [];
const client = new Discord.Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});

const updateChannelList = async () => {
  const newChannelList = await getChannelList();
  if (!newChannelList) return;
  channelList.length = 0;
  channelList.push(...newChannelList);
};

client.on("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  client.user?.setActivity("도움말: !help", {
    type: Discord.ActivityType.Listening,
  });
  await updateChannelList();
  channelIdList.push(...channelList.map(({ channelId }) => channelId));

  let pastInfo = await getSaleInfo();
  while (true) {
    const currentInfo = await getSaleInfo();
    currentInfo.reverse();
    const newInfo = currentInfo.filter(
      ({ url }) => !pastInfo.find(({ url: pastUrl }) => url === pastUrl)
    );

    newInfo.forEach((info) => {
      const targetChannels = channelList.filter(({ categories }) =>
        categories.some(({ category }) => category === info.category)
      );
      targetChannels.forEach(({ channelId }) => {
        client.channels.fetch(channelId).then((channel) => {
          if (!channel) return;
          if (channel.isTextBased())
            channel
              .send({
                embeds: [
                  {
                    color: COLOR,
                    title: info.title,
                    url: info.url,
                    author: { name: info.category },
                    thumbnail: { url: info.thumbnail! },
                    fields: [{ name: info.cost, value: info.shipping }],
                  },
                ],
              })
              .catch((e) => console.error(e));
        });
      });
    });

    pastInfo = JSON.parse(JSON.stringify(currentInfo));
    await sleep(1000 * 30);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).split(" ");
  const command = args.shift()?.toLowerCase();
  if (!command) return;
  if (command === "알림") {
    if (channelIdList.includes(message.channelId)) {
      message.reply("이미 알림 설정된 채널입니다.");
      return;
    }
    const isExist = await prisma.channel.findUnique({
      where: { channelId: message.channelId },
    });
    if (!isExist) {
      channelIdList.push(message.channelId);
      const channelCreate = await prisma.channel.create({
        data: {
          channelId: message.channelId,
          categories: {
            connect: [
              { id: CATEGORIES.indexOf("PC/하드웨어") },
              { id: CATEGORIES.indexOf("노트북/모바일") },
              { id: CATEGORIES.indexOf("가전/TV") },
            ],
          },
        },
      });
      if (!channelCreate) {
        message.reply("오류로 인해 알림 설정에 실패했습니다.");
      } else {
        message.reply(
          "해당 채널로 알림을 보냅니다.\n" +
            "기본 알림 카테고리: `PC/하드웨어`, `노트북/모바일`, `가전/TV`\n" +
            "카테고리 추가/제거 관련 도움말은 `!카테고리 도움말`을 입력하세요"
        );
        await updateChannelList();
      }
    }
  } else if (command === "해제") {
    if (channelIdList.includes(message.channelId)) {
      channelIdList.splice(channelIdList.indexOf(message.channelId), 1);
      const ChannelDelete = await prisma.channel.delete({
        where: { channelId: message.channelId },
      });
      if (!ChannelDelete) {
        message.reply("오류로 인해 알림 설정 해제에 실패했습니다.");
      } else {
        message.reply("알림 설정을 해제하였습니다.");
        await updateChannelList();
      }
    } else {
      message.reply("알림 설정이 되어있지 않은 채널입니다.");
    }
  } else if (command === "카테고리") {
    if (channelIdList.includes(message.channelId)) {
      if (args.length === 0) {
        const currentCategories = await prisma.channel.findMany({
          select: { categories: { select: { category: true } } },
          where: { channelId: message.channelId },
        });
        message.reply(
          `**현재 알림 설정된 카테고리**\n${currentCategories[0].categories.map(
            (data) => " `" + data?.category + "`"
          )}\n\n`
        );
      }
      const arg = args.shift();
      if (arg === "추가") {
        if (args.includes("전체")) {
          if (args.length !== 1) {
            message.reply("`전체`만 입력해주세요.");
            return;
          }
          const array = [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
            { id: 6 },
            { id: 7 },
            { id: 8 },
          ];
          await AddCategory(message, array);
          return;
        }
        if (args.length === 0) {
          PrintCategoryHelp(message);
          return;
        }
        if (args.every((value) => CATEGORIES.includes(value))) {
          const categoryIds = args.map((value) => ({
            id: CATEGORIES.indexOf(value),
          }));
          await AddCategory(message, categoryIds);
        }
      } else if (arg === "제거") {
        if (args.includes("전체")) {
          if (args.length !== 1) {
            message.reply("`전체`만 입력해주세요.");
            return;
          }
          const array = [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
            { id: 6 },
            { id: 7 },
            { id: 8 },
          ];
          await DeleteCategory(message, array);
          return;
        }
        if (args.length === 0) {
          PrintCategoryHelp(message);
          return;
        }
        if (args.every((value) => CATEGORIES.includes(value))) {
          const array = args.map((value) => ({
            id: CATEGORIES.indexOf(value),
          }));
          await DeleteCategory(message, array);
        }
      } else if (arg === "도움말") {
        PrintCategoryHelp(message);
      }
    } else {
      message.reply("알림 설정이 되어있지 않은 채널입니다.");
    }
  } else if (HELP_TEXT.includes(command)) {
    message.reply(
      "**명령어**\n" +
        "`!알림` - 입력한 채널로 알림을 받습니다.\n" +
        "`!해제` - 입력한 채널로의 알림을 해제합니다.\n" +
        "`!카테고리` - 현재 알림 설정된 카테고리를 보여줍니다.\n" +
        "`!카테고리 추가` - 알림 받을 카테고리를 추가합니다.\n" +
        "`!카테고리 제거` - 알림 설정한 카테고리를 제거합니다."
    );
  }
});

const PrintCategoryHelp = (message: Discord.Message<boolean>) => {
  message.reply(
    `\`!카테고리 추가 [카테고리]\` - 카테고리 추가\n\`!카테고리 제거 [카테고리]\` - 카테고리 제거\n\`!카테고리\` - 현재 카테고리 확인\n\n` +
      `사용 가능한 카테고리: \`전체\`, \`PC/하드웨어\`, \`상품권/쿠폰\`, \`게임/SW\`, \`노트북/모바일\`, \`가전/TV\`, \`생활/식품\`, \`패션/의류\`, \`기타\`\n\n` +
      `ex) \`!카테고리 추가 PC/하드웨어 기타\``
  );
};

const AddCategory = async (
  message: Discord.Message<boolean>,
  categories: {
    id: number;
  }[]
) => {
  const UpdateCategory = await prisma.channel.update({
    where: { channelId: message.channelId },
    data: { categories: { connect: categories } },
  });
  if (!UpdateCategory) {
    message.reply("오류로 인해 카테고리 추가에 실패했습니다.");
  } else {
    message.reply("카테고리를 추가하였습니다.");
    await updateChannelList();
  }
};

const DeleteCategory = async (
  message: Discord.Message<boolean>,
  categories: {
    id: number;
  }[]
) => {
  const DisconnectCategory = await prisma.channel.update({
    where: { channelId: message.channelId },
    data: { categories: { disconnect: categories } },
  });
  if (!DisconnectCategory) {
    message.reply("오류로 인해 카테고리 제거에 실패했습니다.");
  } else {
    message.reply("카테고리를 제거하였습니다.");
    await updateChannelList();
  }
};

client.login(process.env.BOT_TOKEN);
