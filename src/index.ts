import Discord from "discord.js";
import dotenv from "dotenv";
import cron from "node-cron";

import { channelList, updateChannelList } from "./channelList";
import {
  HELP_TEXT,
  PREFIX,
  COLOR,
  COMMANDS,
  RESPONSE_MESSAGE_MAP,
} from "./constants";
import getSaleInfo from "./crawling";
import { channelIdList } from "./channelIdList";
import { contains } from "./utils";
import commandMap from "./commands";

dotenv.config();

const client = new Discord.Client({
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  client.user?.setActivity("도움말: !help", {
    type: Discord.ActivityType.Listening,
  });
  await updateChannelList();
  channelIdList.push(...channelList.map(({ channelId }) => channelId));

  let pastInfo = await getSaleInfo();
  const sendNewInfo = async () => {
    const currentInfo = await getSaleInfo();
    currentInfo.reverse();
    const newInfo = currentInfo.filter(
      ({ url }) => !pastInfo.find(({ url: pastUrl }) => url === pastUrl)
    );

    newInfo.forEach((info) => {
      const targetChannels = channelList.filter(({ categories }) =>
        categories.some(({ category }) => category === info.category)
      );
      const embed = {
        color: COLOR,
        title: info.title,
        url: info.url,
        author: { name: info.category },
        thumbnail: { url: info.thumbnail! },
        fields: [{ name: info.cost, value: info.shipping }],
      };
      targetChannels.forEach(({ channelId }) => {
        client.channels.fetch(channelId).then((channel) => {
          if (!channel) return;
          if (channel.isTextBased())
            channel.send({ embeds: [embed] }).catch((e) => console.error(e));
        });
      });
    });

    pastInfo = JSON.parse(JSON.stringify(currentInfo));
  };
  cron.schedule("*/30 * * * * *", sendNewInfo);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).split(" ");
  const command = args.shift()?.toLowerCase();
  if (!command) return;
  if (contains(HELP_TEXT, command) || !contains(COMMANDS, command)) {
    message.reply(RESPONSE_MESSAGE_MAP.HELP);
    return;
  }

  await commandMap[command](message, args);
});

client.login(process.env.BOT_TOKEN);
