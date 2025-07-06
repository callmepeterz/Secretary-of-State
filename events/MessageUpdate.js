const { Events, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: Events.MessageUpdate,
    once: false,

    /**
     * @param {Message} oldMessage
     * @param {Message} newMessage
     */
    async execute(oldMessage, newMessage) {
        if(oldMessage.author.bot || !Number.parseInt(process.env.LOG_ENABLED) || oldMessage?.guildId !== process.env.GUILD_ID || oldMessage?.content === newMessage?.content) return;
        let logChannel = oldMessage?.guild?.channels?.cache?.get(process.env.LOG_CHANNEL_ID);
       
        let embed = new EmbedBuilder()
            .setTitle("Edited Message")
            .setDescription(`A [message](${oldMessage.url} 'Edited message') was edited by ${oldMessage.member} in ${oldMessage.channel}.`)
            .setColor(oldMessage.member.displayHexColor)
            .setTimestamp(oldMessage.createdTimestamp)
            .addFields(
                {name: "Old Message Content", value: oldMessage?.content?.slice(0, 1024)},
                {name: "New Message Content", value: newMessage?.content?.slice(0, 1024)}
            )
        logChannel.send({embeds : [embed]});
    },
};