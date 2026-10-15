const { Events, Message, MessageFlags } = require('discord.js');
const { parse } = require("tldts");
const spoilerRegex = /\|\|([^\|]+)\|\|/;

const { fxList, fxGlobalRemovedParams } = require("../assets/fxList.js");


module.exports = {
    name: Events.MessageCreate,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message){
        if(!message.content || message.author.bot) return;
        
        let urlList = "";

        extractURLs(message.content)?.forEach(extracted => {
            let parsedHostname = parse(extracted.url.hostname);
            let fxMatch = matchFx(extracted.url);
            if(!fxMatch) return;

            let newSubdomain = fxMatch.preservesWWW ? parsedHostname.subdomain : removeWWWSubdomain(parsedHostname.subdomain);
            let newHostname = attachSubdomain(fxMatch.preservesSubdomains ? newSubdomain : "") + randomSelect(fxMatch.replacementDomains);
            extracted.url.hostname = newHostname;

            extracted.url.searchParams.forEach((_, param) => {
                if(fxMatch.removedSearchParams.includes(param) ||
                fxGlobalRemovedParams.params.includes(param) ||
                fxGlobalRemovedParams.prefixes.some(prefix => param.startsWith(prefix)))
                extracted.url.searchParams.delete(param);
            });

            if(extracted.url.href === extracted.text) return;
            urlList += (extracted.suppressEmbeds ? `<${extracted.url.href}>` : extracted.url.href) + "\n";
        });
       
        if(!urlList.length) return;
        if(spoilerRegex.test(message.content)) urlList = `||${urlList}||`;

        message.reply({content: urlList.slice(0, 2000), allowedMentions: {users: [], roles: []}, flags: [MessageFlags.SuppressNotifications]})
        .then(() => message?.suppressEmbeds().catch(() => {}))
        .catch(() => {});
    },
};

/**
 * @param {String} content 
 */
function extractURLs(content){
    var reg_ex = /<?(https?:\/\/[^\s<]+[^<.,:;"')\]\s])>?/gi;
    return content.match(reg_ex)
    ?.filter(raw => URL.canParse(removeAngleBrackets(raw)))
    ?.map(raw => {
        let url = new URL(removeAngleBrackets(raw));
        return { url, text: url.href, suppressEmbeds: detectAngleBrackets(raw) };
    });
}

function matchFx(url){
    let parsedHostname = parse(url.hostname);
    return fxList.find(fx =>
        fx.matchDomains.includes(parsedHostname.domain)
        && (!fx.matchPaths.length || fx.matchPaths.some(path => url.pathname.startsWith(path)))
    );
}

function removeAngleBrackets(url){
    return url.replaceAll(/(<|>)/g, "");
}

function detectAngleBrackets(raw){
    return /<.+>/.test(raw);
}

function removeWWWSubdomain(subdomain){
    if(subdomain === "www") return "";
    return subdomain.replace(/^www\./i, "");
}

function attachSubdomain(subdomain){
    return subdomain ? subdomain + "." : "";
}

function randomSelect(array){
    return array.length ? array[Math.floor(Math.random() * array.length)] : null;
}
