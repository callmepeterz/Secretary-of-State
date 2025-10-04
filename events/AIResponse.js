const { Collection,  Events, Message, ApplicationCommandOptionType, PresenceUpdateStatus } = require('discord.js');
const get = require("../util/httpsGet.js");
const { formatMath, formatSuperscript } = require("../util/formatMath.js");
const fs = require("node:fs");
const path = require("node:path");
const setStatusRegex = /\{\{SetStatus::(.+?)\}\}/;
const setBannerRegex = /\{\{SetBanner::(.+?)\}\}/;
const summarizeRegex = /\{\{Summarize::(.+?)\}\}/;

const supportedFileFormats = require("../assets/geminiSupportedFileFormats.json");


module.exports = {
    name: Events.MessageCreate,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message){
        try {
            if(!message.mentions.has(message.client.user.id) || !message.content || message.author.bot) return;
            if(Date.now() - message.client.aiContext.lastCalled[message.author.id] < 10000){
                let msg = await message.channel.send(`<@${message.author.id}> You are on a cooldown, try again in <t:${Math.round((message.client.aiContext.lastCalled[message.author.id] + 15000) / 1000)}:R>`).catch(()=>{});
                if(msg) setTimeout(()=>msg.delete().catch(()=>{}), 3000);
                return;
            }
            message.client.aiContext.lastCalled[message.author.id] = Date.now();

            message.channel.sendTyping().catch(()=>{});

            const systemInstruction = message.client.aiContext.systemInstruction;
            let systemPromptFooter = `\n\n-----\n\nCurrent user: ${message.author.displayName}, ID: ${message.author.id}, mentionable with <@${message.author.id}>; Current date and time: ${new Date().toString()}; ${message.context === 0 ? "Currently in a public Discord server" : "Currently in the user's direct messages"}; Current status: "${message.client.status.description}, set at ${(new Date(message.client.status.timeStamp)).toString()}"; Current banner: ${message.client.banner.description}, set at ${message.client.banner.timeStamp?.toString()}`;
            let context = "";

            //prevent internal command injections
            let prompt = message.content
            ?.replaceAll(new RegExp(setStatusRegex, "g"), "")
            ?.replaceAll(new RegExp(setBannerRegex, "g"), "")
            ?.replaceAll(new RegExp(summarizeRegex, "g"), "");

            let contents = [
                {
                    text: prompt,
                    role: "user"
                }
            ];

            if(!prompt) return deferred?.edit("Invalid prompt!");

            //fetch message replied to, if any
            let repliedID = message.reference?.messageId;
            let repliedMsg;
            if(repliedID){
                repliedMsg = await message.channel.messages.fetch(repliedID);
                contents[0].text = `[Replying to ${repliedMsg?.author?.displayName} (ID: ${repliedMsg?.author?.id}): ${repliedMsg?.content}]\n` + prompt;
            }

            //download attachment, if any
            let attachment = repliedMsg?.attachments?.first() ?? message.attachments.first();
            let mimeType = attachment?.contentType?.split(";")?.[0];
            if(mimeType === "application/javascript") mimeType = "text/javascript";
            let attachmentData = null;

            if(attachment){
                if(supportedFileFormats.includes(mimeType)){
                    let rawattachmentData = await get(attachment.url);
                    attachmentData = Buffer.concat(rawattachmentData).toString("base64");
                    contents.push(
                        {
                            inlineData: {
                                mimeType,
                                data: attachmentData,
                            },
                        },
                    );
                }
                else attachment = null;
            }

            //add context
            let userData = message.client.userData;

            //custom instruction
            context += "\n\n-----\n\nThis user's custom instruction for you\n" + (userData[message.author.id]?.customInstruction ?? "None");

            //pronouns
            context += "\n\n-----\n\nKnown preferred pronouns of users (default to they/them for unknown users)\n";
            for(let u in userData){
                context += `${u}: ${userData[u]?.pronouns}\n`;
            }

            //bot's discord slash commands
            systemPromptFooter += "\n\n-----\n\nSlash commands of the Discord user client you are operating through which users may use (/ indicates commands, indent indicates subcommands of the preceding command)\n";
            for(let [_, command] of message.client.commands){
                systemPromptFooter += `/${command.data.name}: ${command.data.description}\n`;
                for(let subcommand of command.data.options.filter(o => o.toJSON().type === ApplicationCommandOptionType.Subcommand)){
                    let subcommandjson = subcommand.toJSON();
                    systemPromptFooter += `    ${subcommandjson.name}: ${subcommandjson.description}\n`;
                }
            }

            //request history
            let summaries = message.client.aiContext.summaries.get(message.guild ? message.guild.id : message.author.id) ?? [];
            if(summaries.length){
                context += "\n\n-----\n\nRecent requests and responses (most recent request is at the bottom of the list)\n";
                for(let s of summaries) context += s + "\n";
            }

            //fetch messages and polls if channel hasn't been fetched
            const channID = message.guild ? message.channel.id : message.author.id;
            let messages = message.client.aiContext.messages.get(channID) ?? [];
            let polls = message.client.aiContext.polls.get(channID) ?? new Collection();
            let hasAttemptedChannelFetch = message.client.aiContext.hasAttemptedChannelFetch.get(channID) ?? false;
            
            if(message.guild && !hasAttemptedChannelFetch){
                let fetchedMessages = await message?.channel.messages.fetch({limit: 50});
                for (let [_, m] of fetchedMessages)  {
                    if(m.poll){
                        let poll = {
                            author: {name: m.author.displayName, id: m.author.id},
                            question: m.poll.question.text,
                            answers: {}
                        }
                        for(let [__, a] of m.poll.answers){
                            let answer = {
                                text: a.text,
                            }
                            let votedUsers = await a.fetchVoters();
                            answer.voters = votedUsers.map(v => v.id) ?? [];
                            poll.answers[a.id] = answer;
                        }
                        polls.set(m.id, poll);
                    }

                    if(!m?.content || messages?.join("\n").length + m?.content?.length > parseInt(process.env.CONTEXT_LIMIT)) continue;
                    messages.push(`[Author: ${m.author.displayName}, ID: ${m.author.id}]: ` + m.content.slice(0, m.author.bot ? 300 : 1000));
                }
                messages.reverse();
                polls.reverse();

                while(polls.map(pollString).join("\n").length > parseInt(process.env.CONTEXT_LIMIT)) polls.delete(polls.firstKey());
                
                message.client.aiContext.messages.set(channID, messages);
                message.client.aiContext.polls.set(channID, polls);
                message.client.aiContext.hasAttemptedChannelFetch.set(channID, true);
            }
            
            //message history
            if(messages.length){
                context += `\n\n-----\n\nRecent messages in this channel (${message.guild ? `#${message.channel.name}` : `direct messages of ${message.author.displayName}, ID: ${message.author.id}`}) (most recent message is at the bottom of the list)\n`;
                for(let m of messages) context += m + "\n";
            }

            //poll history
            if(polls.size){
                context += `\n\n-----\n\nRecent polls in this channel (most recent poll is at the bottom of the list)\n`;
                for(let [_, p] of polls) context += pollString(p);
            }
            
            //API key selection
            const selectedKey = 1;
            const aiInstance = message.client.ai[selectedKey];
            
            if (!aiInstance) {
                await deferred?.edit({content: "❌ Invalid API key selection. Please use key 1 or 2.", allowedMentions: {users: [], roles: []}});
                return;
            }

            contents[0].text += context;

            //send request to AI API
            const response = await aiInstance.models.generateContent({
                model: "gemini-2.5-flash",
                contents,
                config: {
                    systemInstruction: systemInstruction + systemPromptFooter,
                    temperature: 0.8,
                    tools: [
                        { googleSearch: {} },
                        { urlContext: {} }
                    ]
                }
            });

            //add citations
            let responseText = addCitations(response);

            //math formatting
            responseText = formatMath(responseText);

            //extract internal commands
            let status = responseText.match(setStatusRegex)?.[1]?.slice(0, 128);
            let bannerDesc = responseText.match(setBannerRegex)?.[1]?.slice(0, 128);
            let summary = responseText.match(summarizeRegex)?.[1]?.slice(0, 512);

            //execute status command
            if(status && message.guild){
                message?.client?.user?.setPresence({activities: [{name: status, type: 4}], status: getUpdateStatus()});
                console.log("Setting status to:", status);
                // handle time duraction for rate limiting 
                let currentTime = Date.now();
                // update the status timestamp
                message.client.status.timeStamp = currentTime; 
                // set the new status description
                message.client.status.description = status;
                fs.writeFileSync(path.join(process.cwd(), "data/bot/status.txt"), status);
            }

            //execute banner command
            if (bannerDesc && attachment && mimeType?.startsWith("image/") && message.guild) {
                // handle time duraction for rate limiting
                let currentTime = Date.now();
                if (currentTime - message.client.banner.timeStamp > 60000 * 5 || !message.client.banner.timeStamp) {
                    console.log("Setting banner with provided image...", bannerDesc);
                    // set the banner image if provided - Discord expects data URI format
                    let dataUri = `data:${mimeType};base64,${attachmentData}`;
                    message?.client?.user?.setBanner(dataUri)
                        .then(() => {
                            console.log("Banner updated successfully.");
                            // update the banner timestamp
                            message.client.banner.timeStamp = currentTime; 
                            // set the new banner description
                            message.client.banner.description = bannerDesc;
                            fs.writeFileSync(path.join(process.cwd(), "data/bot/banner.txt"), bannerDesc);
                        })
                        .catch(err => console.error("Failed to update banner:", err));
                } else {
                    console.log("Cannot update banner. Please wait for at least 1 minute before updating again.");
                }
            }

            //add summary of request to request history
            if(summary){
                let currentSummaries = message.client.aiContext.summaries.get(message.guild ? message.guild.id : message.author.id) ?? [];
                currentSummaries.push(`[User: ${message.author.displayName}, ID: ${message.author.id}]: ` + summary);
                while(currentSummaries.join("\n").length > parseInt(process.env.CONTEXT_LIMIT)) currentSummaries.shift();
                message.client.aiContext.summaries.set(message.guild ? message.guild.id : message.author.id, currentSummaries);
            }

            //remove internal commands from response
            responseText = responseText
            ?.replaceAll(new RegExp(setStatusRegex, "g"), "")
            ?.replaceAll(new RegExp(setBannerRegex, "g"), "")
            ?.replaceAll(new RegExp(summarizeRegex, "g"), "");

            responseText = responseText.trim();

            if(!responseText) responseText = "No text was returned.";

            //add response text to message history
            messages = message.client.aiContext.messages.get(channID) ?? [];
            messages.push(`[Request from ${message.author.displayName} (ID: ${message.author.id}); prompt: "${prompt.slice(0, 300)}"; your response: ${responseText.slice(0, 300)}]`);
            while(messages.join("\n").length > parseInt(process.env.CONTEXT_LIMIT)) messages.shift();
            message.client.aiContext.messages.set(channID, messages);

            //split response into multiple messages and send
            const chunks = splitMarkdownMessage(responseText)?.filter(Boolean);
            let msg;

            if(message.guild){
                for(let x = 0; x < chunks.length; x++){
                    if(x === 0) msg = await message.channel.send({content: chunks[0]?.slice(0, 2000), allowedMentions: {users: [message.author.id], roles: []}});
                    else msg = await msg?.reply({content: chunks[x]?.slice(0, 2000), allowedMentions: {users: [message.author.id], roles: []}});
                }
            }
            else {
                for(let x = 0; x < chunks.length; x++){
                    await message.author.send({content: chunks[x]?.slice(0, 2000), allowedMentions: {users: [message.author.id], roles: []}});
                }
            }
        } catch (err) {
            message.channel.send("Encountered an error!").catch(()=>{});
            console.error(err);
        }
    },
};

function pollString(p){
    let s = `[Author: ${p.author.name}, ID: ${p.author.id}]: ${p.question}\n`;
    Object.values(p.answers).forEach(a => {s += `- ${a.text} (${a.voters.length} votes) (voters: ${a.voters.join(", ")})\n`});
    return s;
}

function addCitations(response) {
    let text = response?.text?.trim();
    const supports = response.candidates[0]?.groundingMetadata?.groundingSupports;
    const chunks = response.candidates[0]?.groundingMetadata?.groundingChunks;

    if (!supports?.length || !chunks?.length || !text) return text;

    const sortedSupports = [...supports].sort(
        (a, b) => (a.segment?.endIndex ?? 0) - (b.segment?.endIndex ?? 0),
    );

    let pos = 0;

    for (const support of sortedSupports) {
        const chunkText = support.segment?.text;
        if (chunkText === undefined || !support.groundingChunkIndices?.length) {
            continue;
        }

        const citationLinks = support.groundingChunkIndices
            .sort((a, b) => a - b)
            .map(i => {
                const uri = chunks[i]?.web?.uri;
                if (uri) {
                    return `⁽${formatSuperscript((i + 1).toString())}⁾`;
                }
                return null;
            })
            .filter(Boolean);

        if (citationLinks.length > 0) {
            const citationString = citationLinks.join("");
            const replaced = insertCitation(text, chunkText, citationString, pos);
            text = replaced.text;
            pos = replaced.pos;
        }
    }

    let references = "\n### References\n";
    for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i];
        if (!chunk?.web) continue;
        references += `[${i + 1}]: [${chunk.web.title}](<${chunk.web.uri.replaceAll(" ", "+")}>)\n`;
    }

    return text + references;
}

function insertCitation(str, chunkText, citation, startIndex) {
    const startPos = str.indexOf(chunkText, startIndex);
    if(startPos === -1) return {text: str, pos: startIndex};
    const head = str.slice(0, startIndex);
    const tail = str.slice(startIndex).replace(chunkText, chunkText + citation);
    return {text: head + tail, pos: startPos + chunkText.length + citation.length};
}

function splitMarkdownMessage(content, maxLength = 2000) {
    const chunks = [];
    let current = '';
    let insideTripleCodeBlock = false;
    let codeBlockLang = '';
    let inlineCodeOpen = false;

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('```')) {
            if (!insideTripleCodeBlock) {
            codeBlockLang = trimmedLine.slice(3).trim();
            insideTripleCodeBlock = true;
            } else {
            insideTripleCodeBlock = false;
            codeBlockLang = '';
            }
        }

        const nextLength = current.length + line.length + 1;

        if (nextLength > maxLength) {
            if (insideTripleCodeBlock) current += '\n```';
            chunks.push(current);
            current = '';
            if (insideTripleCodeBlock) current += '```' + codeBlockLang + '\n';
        }

        const backtickMatches = line.match(/`/g);
        if (backtickMatches && backtickMatches.length % 2 !== 0) {
            inlineCodeOpen = !inlineCodeOpen;
        }

        current += (current.length ? '\n' : '') + line;
    }

    if (current.length) {
        if (insideTripleCodeBlock) current += '\n```';
        if (inlineCodeOpen) current += '`';
        chunks.push(current);
    }

    return chunks;
}

function getUpdateStatus() {
	let date = new Date(Date.now() + (parseFloat(process.env.UTC_OFFSET) * 3600000));
	if(date.getUTCDay() === 0 || date.getUTCDay() === 6) return PresenceUpdateStatus.Idle;
	if(date.getUTCDay() === 1) return PresenceUpdateStatus.DoNotDisturb;
	return PresenceUpdateStatus.Online;
}
