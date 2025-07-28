const { Events, Message, ChannelType } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message){
        if(message.author.bot || !message.content) return;
        let messages = message.client.aiContext.messages.get(message.channel.type === ChannelType.GuildText ? message.channel.id : message.author.id) ?? [];
        messages.push(`[Author: ${message.author.displayName}, ID: ${message.author.id}]: ` + message.content.slice(0, 220));
        while(messages.join("\n").length > 2000) messages.shift();
        message.client.aiContext.messages.set(message.channel.type === ChannelType.GuildText ? message.channel.id : message.author.id, messages);
    },
};