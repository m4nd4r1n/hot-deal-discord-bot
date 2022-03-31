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
const targetCategory = ["PC/하드웨어", "노트북/모바일", "가전/TV"];

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity("도움말: !help", { type: "LISTENING" });
  const temp = await prisma.channel.findMany({
    select: {
      channelId: true,
    },
  });
  temp?.forEach((data) => {
    channelIds.push(data.channelId);
  });
  let before = await getData();
  while (true) {
    const after = await getData();
    if (
      Array.isArray(before) &&
      Array.isArray(after) &&
      channelIds.length !== 0
    ) {
      after.reverse();
      after.forEach((value) => {
        if (!before.find((elem) => value.title === elem.title)) {
          channelIds.forEach((id) => {
            client.channels
              .fetch(id)
              .then((channel) =>
                channel
                  .send(
                    `${value.category}  |  **${value.title}**\n${value.cost}\n${value.shipping}\n\n${value.url}`
                  )
                  .catch(console.error)
              );
          });
        }
      });
    }
    before = JSON.parse(JSON.stringify(after));
    await sleep(60000);
  }
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(" ");
  const command = args.shift().toLowerCase();
  if (command === "알림") {
    if (channelIds.includes(message.channelId)) {
      message.reply("이미 알림 설정된 채널입니다.");
      return;
    }
    channelIds.push(message.channelId);
    const isExist = await prisma.channel.findUnique({
      where: {
        channelId: message.channelId,
      },
    });
    if (!isExist) {
      await prisma.channel.create({
        data: {
          channelId: message.channelId,
        },
      });
      message.reply("해당 채널로 알림을 보냅니다.");
    }
  } else if (command === "해제") {
    if (channelIds.includes(message.channelId)) {
      channelIds.splice(channelIds.indexOf(message.channelId), 1);
      await prisma.channel.delete({
        where: {
          channelId: message.channelId,
        },
      });
      message.reply("알림 설정을 해제하였습니다.");
    } else {
      message.reply("알림 설정이 되어있지 않은 채널입니다.");
    }
  } else if (command === "help" || command === "h" || command === "명령어") {
    message.reply(
      "명령어:\n\n`!알림` - 입력한 채널로 알림을 받습니다.\n`!해제` - 입력한 채널로의 알림을 해제합니다."
    );
  }
});

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
            .find("td:nth-child(2) > div > div.market-info-list-cont")
            .each((i, el) => {
              if (
                targetCategory.includes(
                  $(el).find("div > p:nth-child(1) > span.category").text()
                )
              ) {
                list.push({
                  title: $(el)
                    .find("p > a > span.ellipsis-with-reply-cnt")
                    .text(),
                  url:
                    "https://quasarzone.co.kr" +
                    $(el).find("p > a").attr("href"),
                  cost: $(el)
                    .find(
                      "div > p:nth-child(1) > span:nth-child(2) > span.text-orange"
                    )
                    .text(),
                  shipping:
                    $(el)
                      .find("div > p:nth-child(1) > span:nth-child(4)")
                      .text() === "직배 가능"
                      ? $(el)
                          .find("div > p:nth-child(1) > span:nth-child(5)")
                          .text()
                      : $(el)
                          .find("div > p:nth-child(1) > span:nth-child(4)")
                          .text(),
                  category: $(el)
                    .find("div > p:nth-child(1) > span.category")
                    .text(),
                });
              }
            });
        });
      return list;
    })
    .catch((e) => console.log(e));
};
