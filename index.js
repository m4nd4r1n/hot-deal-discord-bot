const axios = require("axios");
const cheerio = require("cheerio");
const Discord = require("discord.js");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});
const prefix = "!";
const channelIds = [];
const categories = [
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
let channelList;

const GetChannelList = async () => {
  const channelList = await prisma.channel.findMany({
    select: {
      channelId: true,
      categories: { select: { category: true } },
      keywords: { select: { keyword: true } },
    },
  });
  return channelList;
};

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity("도움말: !help", { type: "LISTENING" });
  channelList = await GetChannelList();
  channelList?.forEach((data) => {
    channelIds.push(data.channelId);
  });
  let before = await getData();
  while (true) {
    const after = await getData();
    if (
      Array.isArray(before) &&
      Array.isArray(after) &&
      channelList.length !== 0
    ) {
      after.reverse();
      after.forEach((value) => {
        if (!before.find((elem) => value.url === elem.url)) {
          channelList.forEach((ch) => {
            if (ch.categories.includes(value.category)) {
              client.channels.fetch(ch.channelId).then((channel) =>
                channel
                  .send({
                    embeds: [
                      {
                        color: 0xff9726,
                        title: value.title,
                        url: value.url,
                        author: { name: value.category },
                        thumbnail: { url: value.thumbnail },
                        fields: {
                          name: value.cost,
                          value: value.shipping,
                        },
                      },
                    ],
                  })
                  .catch(console.error)
              );
            }
          });
        }
      });
    }
    before = JSON.parse(JSON.stringify(after));
    await sleep(30000);
  }
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).split(" ");
  const command = args.shift().toLowerCase();
  if (command === "알림") {
    if (channelIds.includes(message.channelId)) {
      message.reply("이미 알림 설정된 채널입니다.");
      return;
    }
    const isExist = await prisma.channel.findUnique({
      where: { channelId: message.channelId },
    });
    if (!isExist) {
      channelIds.push(message.channelId);
      const ChannelCreate = await prisma.channel.create({
        data: {
          channelId: message.channelId,
          categories: {
            connect: [
              { id: categories.indexOf("PC/하드웨어") },
              { id: categories.indexOf("노트북/모바일") },
              { id: categories.indexOf("가전/TV") },
            ],
          },
        },
      });
      if (!ChannelCreate) {
        message.reply("오류로 인해 알림 설정에 실패했습니다.");
      } else {
        message.reply(
          "해당 채널로 알림을 보냅니다.\n" +
            "기본 알림 카테고리: `PC/하드웨어`, `노트북/모바일`, `가전/TV`\n" +
            "카테고리 추가/제거 관련 도움말은 `!카테고리 도움말`을 입력하세요"
        );
        channelList = await GetChannelList();
      }
    }
  } else if (command === "해제") {
    if (channelIds.includes(message.channelId)) {
      channelIds.splice(channelIds.indexOf(message.channelId), 1);
      const ChannelDelete = await prisma.channel.delete({
        where: { channelId: message.channelId },
      });
      if (!ChannelDelete) {
        message.reply("오류로 인해 알림 설정 해제에 실패했습니다.");
      } else {
        message.reply("알림 설정을 해제하였습니다.");
        channelList = await GetChannelList();
      }
    } else {
      message.reply("알림 설정이 되어있지 않은 채널입니다.");
    }
  } else if (command === "카테고리") {
    if (channelIds.includes(message.channelId)) {
      if (args.length === 0) {
        const currentCategories = await prisma.channel.findMany({
          select: { categories: { select: { category: true } } },
          where: { channelId: message.channelId },
        });
        message.reply(
          `**현재 알림 설정된 카테고리**\n${currentCategories[0].categories.map(
            (data) => " `" + data.category + "`"
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
        if (args.every((value) => categories.includes(value))) {
          const array = args.map((value) => ({
            id: categories.indexOf(value),
          }));
          await AddCategory(message, array);
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
        if (args.every((value) => categories.includes(value))) {
          const array = args.map((value) => ({
            id: categories.indexOf(value),
          }));
          await DeleteCategory(message, array);
        }
      } else if (arg === "도움말") {
        PrintCategoryHelp(message);
      }
    } else {
      message.reply("알림 설정이 되어있지 않은 채널입니다.");
    }
  } else if (["help", "h", "명령어", "도움말"].includes(command)) {
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

const PrintCategoryHelp = (message) => {
  message.reply(
    `\`!카테고리 추가 [카테고리]\` - 카테고리 추가\n\`!카테고리 제거 [카테고리]\` - 카테고리 제거\n\`!카테고리\` - 현재 카테고리 확인\n\n` +
      `사용 가능한 카테고리: \`전체\`, \`PC/하드웨어\`, \`상품권/쿠폰\`, \`게임/SW\`, \`노트북/모바일\`, \`가전/TV\`, \`생활/식품\`, \`패션/의류\`, \`기타\`\n\n` +
      `ex) \`!카테고리 추가 PC/하드웨어 기타\``
  );
};

const AddCategory = async (message, categories) => {
  const UpdateCategory = await prisma.channel.update({
    where: { channelId: message.channelId },
    data: { categories: { connect: categories } },
  });
  if (!UpdateCategory) {
    message.reply("오류로 인해 카테고리 추가에 실패했습니다.");
  } else {
    message.reply("카테고리를 추가하였습니다.");
    channelList = await GetChannelList();
  }
};

const DeleteCategory = async (message, categories) => {
  const DisconnectCategory = await prisma.channel.update({
    where: { channelId: message.channelId },
    data: { categories: { disconnect: categories } },
  });
  if (!DisconnectCategory) {
    message.reply("오류로 인해 카테고리 제거에 실패했습니다.");
  } else {
    message.reply("카테고리를 제거하였습니다.");
    channelList = await GetChannelList();
  }
};

client.login(process.env.BOT_TOKEN);

const getData = async () => {
  return axios
    .get("https://quasarzone.co.kr/bbs/qb_saleinfo")
    .then((html) => {
      const list = [];
      const $ = cheerio.load(html.data);
      $(
        "#frmSearch > div > div.list-board-wrap > div.market-type-list.market-info-type-list.relative > table"
      )
        .children("tbody")
        .each((i, el) => {
          $(el)
            .find("td:nth-child(2) > div")
            .each((i, el) => {
              list.push({
                title: $(el)
                  .find(
                    "div.market-info-list-cont > p > a > span.ellipsis-with-reply-cnt"
                  )
                  .text(),
                url:
                  "https://quasarzone.co.kr" + $(el).find("p > a").attr("href"),
                cost: $(el)
                  .find(
                    "div.market-info-list-cont > div > p:nth-child(1) > span:nth-child(2) > span.text-orange"
                  )
                  .text(),
                shipping:
                  $(el)
                    .find(
                      "div.market-info-list-cont > div > p:nth-child(1) > span:nth-child(4)"
                    )
                    .text() === "직배 가능"
                    ? $(el)
                        .find(
                          "div.market-info-list-cont > div > p:nth-child(1) > span:nth-child(5)"
                        )
                        .text()
                    : $(el)
                        .find(
                          "div.market-info-list-cont > div > p:nth-child(1) > span:nth-child(4)"
                        )
                        .text(),
                category: $(el)
                  .find(
                    "div.market-info-list-cont > div > p:nth-child(1) > span.category"
                  )
                  .text(),
                thumbnail: $(el).find("div.thumb-wrap > a > img").attr("src"),
              });
            });
        });
      return list;
    })
    .catch((e) => console.log(e));
};
