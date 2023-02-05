import Discord from "discord.js";
import dotenv from "dotenv";
import cron from "node-cron";

import { channelList, updateChannelList } from "./channelList.js";
import { HELP_TEXT, PREFIX, COMMANDS } from "./constants/commands.js";
import { RESPONSE_MESSAGE_MAP } from "./constants/message.js";
import getSaleInfo from "./crawling.js";
import { channelIdList } from "./channelIdList.js";
import { contains } from "./utils.js";
import commandMap from "./commands/index.js";
import { redis } from "./redis/client.js";
import { TSaleInfo } from "./types/index.js";

dotenv.config();

const { NODE_ENV, TEST_BOT_TOKEN, BOT_TOKEN } = process.env;

const EMBED_MESSAGE_COLOR = 0xff9726;
const REDIS_KEY = "LIST";
const DISCORD_TOKEN = NODE_ENV === "development" ? TEST_BOT_TOKEN : BOT_TOKEN;

const discord = new Discord.Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});

discord.on("ready", async () => {
  console.log(`Logged in as ${discord.user?.tag}`);

  discord.user?.setActivity(`도움말: ${PREFIX}help`, {
    type: Discord.ActivityType.Listening,
  });
  await updateChannelList();
  channelIdList.push(...channelList.map(({ channelId }) => channelId));

  const sendNewInfo = async () => {
    const pastInfo =
      ((await redis.json.get(REDIS_KEY)) as TSaleInfo[]) ??
      (await getSaleInfo());
    const currentInfo = await getSaleInfo();
    const newInfo = currentInfo
      .filter(
        ({ url }) => !pastInfo.find(({ url: pastUrl }) => url === pastUrl)
      )
      .reverse();

    if (!newInfo.length) return;

    newInfo.forEach((info) => {
      const targetChannels = channelList.filter(({ categories }) =>
        categories.some(({ category }) => category === info.category)
      );
      const embed = {
        color: EMBED_MESSAGE_COLOR,
        title: info.title,
        url: info.url,
        author: { name: info.category },
        thumbnail: { url: info.thumbnail! },
        fields: [{ name: info.cost, value: info.shipping }],
      };
      targetChannels.forEach(({ channelId }) => {
        discord.channels.fetch(channelId).then((channel) => {
          if (!channel) return;
          if (channel.isTextBased())
            channel.send({ embeds: [embed] }).catch((e) => console.error(e));
        });
      });
    });
    redis.json.set(REDIS_KEY, ".", currentInfo);
  };
  cron.schedule("*/15 * * * * *", sendNewInfo);
});

discord.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.slice(0, PREFIX.length) !== PREFIX) return;
  const args = message.content.slice(PREFIX.length).split(" ");
  const command = args.shift()?.toLowerCase();
  if (!command) return;
  if (contains(HELP_TEXT, command) || !contains(COMMANDS, command)) {
    message.reply(RESPONSE_MESSAGE_MAP.HELP);
    return;
  }

  await commandMap[command](message, args);
});

discord.login(DISCORD_TOKEN);
