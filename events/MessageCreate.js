const { Events, Message, MessageFlags, Collection, ChannelType } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message){
        if(message.author.bot || message.channel.type === ChannelType.DM) return;
        if(message.author.id === process.env.CHINH_ID && Number.parseInt(process.env.TROLL_CHINH)){
            await message?.react("🇬")?.catch(() => {});
            await message?.react("🇦")?.catch(() => {});
            await message?.react("🇾")?.catch(() => {});
        }
    },
};