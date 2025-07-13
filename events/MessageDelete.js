const { Events, Message, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const get = require("../util/httpsGet.js");

module.exports = {
    name: Events.MessageDelete,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message) {
        if (message.author.id === process.env.CLIENT_ID && message.channel.id === process.env.LOG_CHANNEL_ID && message.embeds.length > 0) {
            let msgAttachments = [];
            message?.attachments?.forEach(a => msgAttachments.push(a));
            return message.channel.send({
                content: "A log message was deleted by someone in here. To whoever deleted that message, stop deleting messages in here or you will face consequences. The content of that message is:",
                embeds: message.embeds,
                files: msgAttachments
            });
        }
        if(message.author.bot || !Number.parseInt(process.env.LOG_ENABLED) || message?.guildId !== process.env.GUILD_ID) return;
        let logChannel = message?.guild?.channels?.cache?.get(process.env.LOG_CHANNEL_ID);
        if(!logChannel) return;
        let attachments = [];
        let hasImage = false;
        let attachmentList = "";
        let embed = new EmbedBuilder()
            .setTitle("Deleted Message")
            .setDescription(`A message by ${message.member} was deleted in ${message.channel}.`)
            .setColor(message.member.displayHexColor)
            .setTimestamp(message.createdTimestamp)
        for(let element of message.attachments) {
            let a = element[1];
            let data = await get(a.url);
            attachments.push(
                new AttachmentBuilder()
                    .setName(a.name)
                    .setFile(Buffer.concat(data))
                    .setSpoiler(a.spoiler)
                    .setDescription(a.description)
            );
            if (!hasImage && a.contentType.startsWith("image/")) {
                embed.setImage(`attachment://${a.name}`);
                hasImage = true;
            }
            attachmentList += `[${a.name}](${a.url} '${a.name}')\n`;
        }
        if (message.content) {
            if(message.content.length > 1024) embed.addFields({name: "Message Content", value: message.content.slice(0, 1024)}, {name: "\u200b", value: message.content.slice(1024, 2048)});
            else embed.addFields({name: "Message Content", value: message.content.slice(0, 1024)});
        }
        if (attachments.length > 0) embed.addFields({name: "Attachments", value: attachmentList.slice(0, 1024)});
        logChannel.send({
            embeds : [embed],
            files: attachments
        });
    },
};
