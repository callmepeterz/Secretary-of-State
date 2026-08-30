const { Events, Message } = require('discord.js');
const spoilerRegex = /\|\|([^|]+)\|\|/;
const twitterRegex = /(?<prefix>https?:\/\/(?:www\.)?)(?<domain>twitter\.com|x\.com)(?<suffix>(?:\/\S*)*)/gmi;
const instagramRegex = /(?<prefix>https?:\/\/(?:www\.)?)(?<domain>instagram.com)(?<suffix>(?:\/\S*)*)/gmi;
const facebookRegex = /(?<prefix>https?:\/\/(?:www\.)?)(?<domain>facebook.com)(?<suffix>(?:\/\S*)*)/gmi;

const fxDomains = [
    "fxtwitter.com",
    "girlcockx.com",
    "hotyurisex.com",
    "yaoisex.com",
    "boypussyx.com"
];

module.exports = {
    name: Events.MessageCreate,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message){
        if(!message.content || message.author.bot) return;
        
        let urlList = "";
        message.content.match(twitterRegex)?.forEach(v => urlList += v.replace(twitterRegex, `$<prefix>${fxDomains[Math.floor(Math.random() * fxDomains.length)]}$<suffix>`) + "\n");
        message.content.match(instagramRegex)?.forEach(v => urlList += v.replace(instagramRegex, `$<prefix>oginstagram.com$<suffix>`) + "\n");
        message.content.match(facebookRegex)?.forEach(v => urlList += v.replace(facebookRegex, `$<prefix>facebed.com$<suffix>`) + "\n");
        if(!urlList.length) return;
        if(spoilerRegex.test(message.content)) urlList = `||${urlList}||`;

        message.reply({content: urlList.slice(0, 2000), allowedMentions: {users: [], roles: []}})
        .then(() => message?.suppressEmbeds().catch(() => {}))
        .catch(() => {});
    },
};