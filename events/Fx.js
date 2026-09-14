const { Events, Message, MessageFlags } = require('discord.js');
const spoilerRegex = /\|\|([^\|]+)\|\|/;

const fxList = require("../assets/fxList.js");


module.exports = {
    name: Events.MessageCreate,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message){
        if(!message.content || message.author.bot) return;
        
        let urlList = "";
        fxList.forEach(fx => {
            message.content.match(fx.regex)?.forEach(v => urlList += v.replace(fx.regex, `$<prefix>${fx.domains[Math.floor(Math.random() * fx.domains.length)]}$<suffix>`) + "\n");
        });
       
        if(!urlList.length) return;
        if(spoilerRegex.test(message.content)) urlList = `||${urlList}||`;

        message.reply({content: urlList.slice(0, 2000), allowedMentions: {users: [], roles: []}, flags: [MessageFlags.SuppressNotifications]})
        .then(() => message?.suppressEmbeds().catch(() => {}))
        .catch(() => {});
    },
};