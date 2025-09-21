const { Collection,  SlashCommandBuilder, SlashCommandStringOption, SlashCommandNumberOption, SlashCommandAttachmentOption, ApplicationCommandOptionType, ChatInputCommandInteraction, InteractionResponse, SlashCommandIntegerOption } = require('discord.js');
const get = require("../util/httpsGet.js");
const { formatMath, formatSuperscript } = require("../util/formatMath.js");
const fs = require("node:fs");
const setStatusRegex = /\{\{SetStatus::(.+?)\}\}/;
const setBannerRegex = /\{\{SetBanner::(.+?)\}\}/;
const summarizeRegex = /\{\{Summarize::(.+?)\}\}/;

const supportedFileFormats = require("../assets/geminiSupportedFileFormats.json");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask the Secretary of State (powered by Gemini AI)")
    .setNSFW(false)
    .addStringOption(
        new SlashCommandStringOption()
        .setName("question")
        .setDescription("Ask the Secretary of State")
        .setRequired(true)
        .setMaxLength(2000)
    )
    .addAttachmentOption(
        new SlashCommandAttachmentOption()
        .setName("file")
        .setDescription("Send your file")
        .setRequired(false)
    )
    .addStringOption(
        new SlashCommandStringOption()
        .setName("model")
        .setDescription("Specify which model to use, default is Gemini 2.5 Flash")
        .setRequired(false)
        .addChoices(
            {name: "Gemini 2.5 Flash", value: "gemini-2.5-flash"},
            {name: "Gemini 2.5 Pro", value: "gemini-2.5-pro"}
        )
    )
    .addNumberOption(
        new SlashCommandNumberOption()
        .setName("temperature")
        .setDescription("Specify temperature for the AI, default is 0.8")
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(2)
    )
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("key")
        .setDescription("Specify which Gemini API key to use, default is 1")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(2)
        .setChoices(
            {name: "Key 1", value: 1},
            {name: "Key 2", value: 2}
        )
    ),
    index: "Tool",
    isDeferred: true,
    cooldown: 5000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        const systemInstruction = interaction.client.aiContext.systemInstruction;
        let attachment = interaction.options.getAttachment("file");
        let systemPromptFooter = `\n\n-----\n\nCurrent user: ${interaction.user.displayName}, ID: ${interaction.user.id}, mentionable with <@${interaction.user.id}>; Current date and time: ${new Date().toString()}; ${interaction.context === 0 ? "Currently in a public Discord server" : "Currently in the user's direct messages"}; Current status: "${interaction.client.user?.presence?.activities?.[0]?.name || interaction.client.status.description}, set at ${interaction.client.status.timeStamp?.toString()}"; Current banner: ${interaction.client.banner.description}, set at ${interaction.client.banner.timeStamp?.toString()}`;
        let context = "";
        let prompt = interaction.options.getString("question")
        ?.replaceAll(new RegExp(setStatusRegex, "g"), "")
        ?.replaceAll(new RegExp(setBannerRegex, "g"), "")
        ?.replaceAll(new RegExp(summarizeRegex, "g"), "");

        let contents = [
            {
                text: prompt,
                role: "user"
            }
        ];
        let mimeType = (attachment?.contentType === "application/javascript" || attachment?.contentType === "application/javascript; charset=utf-8") ? "text/javascript" : attachment?.contentType;
        let attachmentData = null;

        if(!prompt) return deferred?.edit("Invalid prompt!");

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

        let userData = interaction.client.userData
        context += "\n\n-----\n\nKnown preferred pronouns of users (default to they/them for unknown users)\n";
        for(let u in userData){
            context += `${u}: ${userData[u]?.pronouns}\n`;
        }

        context += "\n\n-----\n\nSlash commands of the Discord user client you are operating through which users may use (/ indicates commands, indent indicates subcommands of the preceding command)\n";
        for(let [_, command] of interaction.client.commands){
            context += `/${command.data.name}: ${command.data.description}\n`;
            for(let subcommand of command.data.options.filter(o => o.toJSON().type === ApplicationCommandOptionType.Subcommand)){
                let subcommandjson = subcommand.toJSON();
                context += `    ${subcommandjson.name}: ${subcommandjson.description}\n`;
            }
        }

        let summaries = interaction.client.aiContext.summaries.get(interaction.context === 0 ? interaction.guild.id : interaction.user.id) ?? [];
        if(summaries.length){
            context += "\n\n-----\n\nRecent requests and responses (most recent request is at the bottom of the list)\n";
            for(let s of summaries) context += s + "\n";
        }

        const channID = interaction.context === 0 ? interaction.channel.id : interaction.user.id;
        let messages = interaction.client.aiContext.messages.get(channID) ?? [];
        let polls = interaction.client.aiContext.polls.get(channID) ?? new Collection();
        let hasAttemptedChannelFetch = interaction.client.aiContext.hasAttemptedChannelFetch.get(channID) ?? false;
        
        if(interaction.context === 0 && !hasAttemptedChannelFetch){
            let fetchedMessages = await interaction?.channel.messages.fetch({limit: 50});
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
            
            interaction.client.aiContext.messages.set(channID, messages);
            interaction.client.aiContext.polls.set(channID, polls);
            interaction.client.aiContext.hasAttemptedChannelFetch.set(channID, true);
        }
        
        if(messages.length){
            context += `\n\n-----\n\nRecent messages in this channel (${interaction.context === 0 ? `#${interaction.channel.name}` : `direct messages of ${interaction.user.displayName}, ID: ${interaction.user.id}`}) (most recent message is at the bottom of the list)\n`;
            for(let m of messages) context += m + "\n";
        }

        if(polls.size){
            context += `\n\n-----\n\nRecent polls in this channel (most recent poll is at the bottom of the list)\n`;
            for(let [_, p] of polls) context += pollString(p);
        }
        
        const selectedKey = interaction.options.getInteger("key") ?? 1;
        const aiInstance = interaction.client.ai[selectedKey];
        
        if (!aiInstance) {
            await deferred?.edit({content: "❌ Invalid API key selection. Please use key 1 or 2.", allowedMentions: {users: [], roles: []}});
            return;
        }

        const response = await aiInstance.models.generateContent({
            model: interaction.options.getString("model") ?? "gemini-2.5-flash",
            contents,
            config: {
                systemInstruction: systemInstruction + systemPromptFooter + context,
                temperature:interaction.options.getNumber("temperature") ?? 0.8,
                tools: [
                    { googleSearch: {} },
                    { urlContext: {} }
                ]
            }
        });

        let responseText = addCitations(response);

        //math formatting
        responseText = formatMath(responseText);

        let status = responseText.match(setStatusRegex)?.[1]?.slice(0, 128);
        let bannerDesc = responseText.match(setBannerRegex)?.[1]?.slice(0, 128);
        let summary = responseText.match(summarizeRegex)?.[1]?.slice(0, 512);

        if(status && interaction.context === 0){
            interaction?.client?.user?.setPresence({activities: [{name: status, type: 4}], status: "online"});
            console.log("Setting status to:", status);
            // handle time duraction for rate limiting 
            let currentTime = Date.now();
            // update the status timestamp
            interaction.client.status.timeStamp = currentTime; 
            // set the new status description
            interaction.client.status.description = status;
        }

        if (bannerDesc && attachment && mimeType?.startsWith("image/") && interaction.context === 0) {
            // handle time duraction for rate limiting
            let currentTime = Date.now();
            if (currentTime - interaction.client.banner.timeStamp > 60000 * 5 || !interaction.client.banner.timeStamp) {
                console.log("Setting banner with provided image...", bannerDesc);
                // set the banner image if provided - Discord expects data URI format
                let dataUri = `data:${mimeType};base64,${attachmentData}`;
                interaction?.client?.user?.setBanner(dataUri)
                    .then(() => {
                        console.log("Banner updated successfully.");
                        // update the banner timestamp
                        interaction.client.banner.timeStamp = currentTime; 
                        // set the new banner description
                        interaction.client.banner.description = bannerDesc;
                    })
                    .catch(err => console.error("Failed to update banner:", err));
            } else {
                console.log("Cannot update banner. Please wait for at least 1 minute before updating again.");
            }
        }

        if(summary){
            let currentSummaries = interaction.client.aiContext.summaries.get(interaction.context === 0 ? interaction.guild.id : interaction.user.id) ?? [];
            currentSummaries.push(`[User: ${interaction.user.displayName}, ID: ${interaction.user.id}]: ` + summary);
            while(currentSummaries.join("\n").length > parseInt(process.env.CONTEXT_LIMIT)) currentSummaries.shift();
            interaction.client.aiContext.summaries.set(interaction.context === 0 ? interaction.guild.id : interaction.user.id, currentSummaries);
        }

        responseText = responseText
        ?.replaceAll(new RegExp(setStatusRegex, "g"), "")
        ?.replaceAll(new RegExp(setBannerRegex, "g"), "")
        ?.replaceAll(new RegExp(summarizeRegex, "g"), "");

        responseText = responseText.trim();

        if(!responseText) responseText = "No text was returned.";

        messages = interaction.client.aiContext.messages.get(channID) ?? [];
        messages.push(`[Request from ${interaction.user.displayName} (ID: ${interaction.user.id}); prompt: "${prompt.slice(0, 300)}"; your response: ${responseText.slice(0, 300)}]`);
        while(messages.join("\n").length > parseInt(process.env.CONTEXT_LIMIT)) messages.shift();
        interaction.client.aiContext.messages.set(channID, messages);

        const chunks = splitMarkdownMessage(responseText)?.filter(Boolean);
        let msg;

        if(interaction.context === 0){
            for(let x = 0; x < chunks.length; x++){
                if(x === 0) await deferred?.edit({content: chunks[0]?.slice(0, 2000), allowedMentions: {users: [], roles: []}});
                else if(x === 1) msg = await interaction?.followUp({content: chunks[1]?.slice(0, 2000), allowedMentions: {users: [], roles: []}});
                else msg = await msg?.reply({content: chunks[x]?.slice(0, 2000), allowedMentions: {users: [], roles: []}});
            }
        }
        else {
             for(let x = 0; x < chunks.length; x++){
                if(x === 0) await deferred?.edit({content: chunks[0]?.slice(0, 2000), allowedMentions: {users: [], roles: []}});
                else await interaction.user.send({content: chunks[x]?.slice(0, 2000), allowedMentions: {users: [], roles: []}});
            }
        }
    },
};

function pollString(p){
    let s = `[Author: ${p.author.name}, ID: ${p.author.id}]: ${p.question}\n`;
    Object.values(p.answers).forEach(a => {s += `- ${a.text} (${a.voters.length} votes) (voters: ${a.voters.join(", ")})\n`});
    return s;
}

function addCitations(response) {
    let text = response?.text;
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
