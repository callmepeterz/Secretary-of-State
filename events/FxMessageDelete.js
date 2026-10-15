const { Events, Message, MessageFlags } = require("discord.js");
const { fxList } = require("../assets/fxList.js");
const { parse } = require("tldts");

module.exports = {
    name: Events.MessageDelete,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message) {
        if(!message.content || message.author.bot) return;
        if(!extractURLs(message.content)?.some(extracted => matchFx(extracted.url))) return;

        let fetchedMessages = await message.channel.messages.fetch({limit: 10, cache: false, after: message.id});
        let fxMessage = fetchedMessages.find(m => m.author.id === message.client.user.id && m.reference.messageId === message.id && m.flags.has(MessageFlags.SuppressNotifications));
        if(!fxMessage || !fxMessage.deletable) return;

        fxMessage.delete()
        .catch(() => {});
    }
}

/**
 * @param {String} content 
 */
function extractURLs(content){
    var reg_ex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
    return content.match(reg_ex)
    ?.filter(raw => URL.canParse(raw))
    ?.map(raw => {
        let url = new URL(raw);
        return { url, text: url.href };
    });
}

function matchFx(url){
    let parsedHostname = parse(url.hostname);
    return fxList.find(fx =>
        fx.matchDomains.includes(parsedHostname.domain)
        && (!fx.matchPaths.length || fx.matchPaths.some(path => url.pathname.startsWith(path)))
    );
}
