const { Events, Message } = require('discord.js');
const spoilerRegex = /\|\|([^|]+)\|\|/;

const fxList = [
    {
        regex: /(?<prefix>https?:\/\/(?:www\.)?)(?<domain>twitter\.com|x\.com)(?<suffix>(?:\/\S*)*)/gmi,
        domains: ["fxtwitter.com", "girlcockx.com", "hotyurisex.com", "yaoisex.com", "boypussyx.com"]
    },
    {
        regex: /(?<prefix>https?:\/\/(?:www\.)?)(?<domain>instagram.com)(?<suffix>(?:\/\S*)*)/gmi,
        domains: ["oginstagram.com"]
    },
    {
        regex: /(?<prefix>https?:\/\/(?:www\.)?)(?<domain>facebook.com)(?<suffix>(?:\/\S*)*)/gmi,
        domains: ["facebed.com"]
    }
]


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

        message.reply({content: urlList.slice(0, 2000), allowedMentions: {users: [], roles: []}})
        .then(() => message?.suppressEmbeds().catch(() => {}))
        .catch(() => {});
    },
};