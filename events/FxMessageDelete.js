const { Events, Message, MessageFlags } = require("discord.js");
const fxList = require("../assets/fxList.js");

module.exports = {
    name: Events.MessageDelete,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message) {
        if(!message.content || message.author.bot) return;
        if(!fxList.some(fx => fx.regex.test(message.content))) return;

        let fetchedMessages = await message.channel.messages.fetch({limit: 10, cache: false, after: message.id});
        let fxMessage = fetchedMessages.find(m => m.author.id === message.client.user.id && m.reference.messageId === message.id && m.flags.has(MessageFlags.SuppressNotifications));
        if(!fxMessage || !fxMessage.deletable) return;

        fxMessage.delete()
        .catch(() => {});
    }
}