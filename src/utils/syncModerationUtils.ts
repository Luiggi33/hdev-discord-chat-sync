import {
  ActionRowBuilder,
  BaseGuildTextChannel,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  EmbedBuilder,
  hyperlink,
  Message,
  MessageActionRowComponentBuilder,
} from "discord.js";
import { ObjectID } from "ts-mongodb-orm";
import { Inject, Service } from "typedi";
import bot from "../main";
import GuildConfigService from "../services/GuildConfigService";

@Service()
export default class syncUtils {
  @Inject()
  private GuildConfig: GuildConfigService;
  async sendToAllChannels(category: string, message: Message) {
    if (!message.content || message.content.trim().length === 0) return;
    var foundCategory = await this.GuildConfig.findCategory(
      new ObjectID(category)
    );
    var allGuilds = await this.GuildConfig.getAllChannels();
    var allChannels = allGuilds
      .filter((x) => !x.banned)
      .flatMap((x) =>
        Object.entries(x.channels)
          .filter((x) => x[1].category === category)
          .map((x) => x[1])
      );
    const guildBtn = new ButtonBuilder()
      .setLabel("Details")
      .setEmoji("👋")
      .setStyle(ButtonStyle.Secondary)
      .setCustomId("details-" + message.channelId + "-" + message.id);
    const categoryBtn = new ButtonBuilder()
      .setLabel(foundCategory?.name || "No Category")
      .setStyle(ButtonStyle.Secondary)
      .setCustomId("details-category")
      .setDisabled(true);
    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        guildBtn,
        categoryBtn
      );
    var author = await message.author.fetch(true);

    var embed = new EmbedBuilder();

    embed.setAuthor({
      name: message.member?.nickname || message.author.username,
      iconURL: message.author.avatarURL() || undefined,
    });
    embed.setFooter({
      text: "From the Guild: " + message.guild?.name,
      iconURL: message.guild?.iconURL() || undefined,
    });
    embed.setColor((author.hexAccentColor as ColorResolvable) || "Blurple");
    embed.setTimestamp(Date.now());
    var isInBotCache = false;
    var text = message.content;
    var animatedemojis = message.content.matchAll(
      /<a:[A-Z0-9\_\+\/\{\}\\]+:(\d+)>/gim
    );
    var emojis = message.content.matchAll(/<:[A-Z0-9\_\+\/\{\}\\]+:(\d+)>/gim);
    var urls = Array.from(
      message.content.matchAll(/(http[s]?:\/\/([^ \n])*)/gim)
    );
    for (let n of emojis) {
      let url = hyperlink(
        n[0],
        "https://cdn.discordapp.com/emojis/" + n[1] + ".png?v=1",
        "The custom Emote"
      );
      if (bot.emojis.cache.get(n[1])) {
        isInBotCache = true;
      } else {
        text = text.replaceAll(n[0], url);
      }
    }
    for (let n of animatedemojis) {
      let url = hyperlink(
        n[0],
        "https://cdn.discordapp.com/emojis/" + n[1] + ".gif?v=1",
        "The custom Emote"
      );
      if (bot.emojis.cache.get(n[1])) {
        isInBotCache = true;
      } else {
        text = text.replaceAll(n[0], url);
      }
    }

    if (isInBotCache) {
      const customemojis = new ButtonBuilder()
        .setLabel("Some Emojis are custom!")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("details-customemojis")
        .setDisabled(true);
      row.addComponents(customemojis);
    }
    allChannels.forEach(async (x, i) => {
      if (!x.channel || x.channel === message.channelId) return;
      var guildConfig = await this.GuildConfig.getOrCreate(x.guild);
      var channel: BaseGuildTextChannel;
      try {
        channel = (await bot.channels.fetch(x.channel, {
          cache: true,
        })) as BaseGuildTextChannel;
      } catch (exc: any) {
        console.log(exc);
        var foundGuild = allGuilds.find(
          (guildcfg) => guildcfg.guild === x.guild
        );
        if (!foundGuild) return;
        delete foundGuild?.channels[x.channel];
        await this.GuildConfig.save(foundGuild!);
        console.log("Removed " + x.channel);
        return;
      }
      if (!channel) return;
      var rowForGuild = new ActionRowBuilder<MessageActionRowComponentBuilder>(
        row
      );
      if (embed.data.author && Boolean(guildConfig.configs["noButtons"])) {
        embed.data.author.name += `( ${message.author.id} )`;
      }
      if (
        urls.length > 0 &&
        Boolean(guildConfig.configs["noEmbeddedLinks"]) === true &&
        guildConfig.configs["type"] !=
          "Webhook ( Small, it does need the Webhook permission! )"
      ) {
        const links = new ButtonBuilder()
          .setLabel("Preview embedded version of links!")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("details-links");

        rowForGuild.addComponents(links);
      }
      if (
        guildConfig.configs["type"] !=
        "Webhook ( Small, it does need the Webhook permission! )"
      ) {
        embed.setDescription(text);
        try {
          await channel.send({
            embeds: [embed],
            components: (Boolean(guildConfig.configs["noButtons"]) && []) || [
              rowForGuild,
            ],
            allowedMentions: {
              repliedUser: false,
              parse: [],
              roles: [],
              users: [],
            },
          });
        } catch (exc: any) {
          console.log(exc);
          channel.send({
            embeds: [embed],
            components: (Boolean(guildConfig.configs["noButtons"]) && []) || [
              row,
            ],
            allowedMentions: {
              repliedUser: false,
              parse: [],
              roles: [],
              users: [],
            },
          });
        }
      } else {
        try {
          var webhook =
            (await channel.fetchWebhooks()).find(
              (x) => x.owner?.id === bot.user?.id
            ) ||
            (await channel.createWebhook({
              name: "Hedges Chatter Webhook",
              reason: "No valid webhook found before!",
            }));
          webhook.send({
            content: text,
            components: (Boolean(guildConfig.configs["noButtons"]) && []) || [
              rowForGuild,
            ],
            username: message.member?.nickname || message.author.username,
            avatarURL: message.author.avatarURL() || undefined,
            allowedMentions: {
              repliedUser: false,
              parse: [],
              roles: [],
              users: [],
            },
          });
        } catch (exc) {
          channel.send({
            content:
              (message.member?.nickname || message.author.username) +
              ": " +
              message.content,
            components:
              (Boolean(guildConfig.configs["noButtons"]) && []) ||
              [rowForGuild],
            allowedMentions: {
              repliedUser: false,
              parse: [],
              roles: [],
              users: [],
            },
          });
        }
      }
    });
  }
}
