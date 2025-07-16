const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandNumberOption, SlashCommandAttachmentOption, ChatInputCommandInteraction, InteractionResponse, SlashCommandIntegerOption } = require('discord.js');
const get = require("../util/httpsGet.js");
const formatMath = require("../util/formatMath.js");
const fs = require("node:fs");
const systemInstruction = fs.readFileSync("./assets/systemPrompt.txt", "utf-8").toString();
const setStatusRegex = /\{\{SetStatus::(.+?)\}\}/;
const setBannerRegex = /\{\{SetBanner::(.+?)\}\}/;
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
        .setMaxLength(1000)
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
        let attachment = interaction.options.getAttachment("file");
        let systemPromptHeader = `Current user: ${interaction.user.displayName}, ID: ${interaction.user.id}, mentionable with <@${interaction.user.id}>; Current date and time: ${new Date().toString()}; Current status: "${interaction.client.user?.presence?.activities?.[0]?.name || interaction.client.status.description}, set at ${interaction.client.status.timeStamp?.toString()}"; Current banner: ${interaction.client.banner.description}, set at ${interaction.client.banner.timeStamp?.toString()}`;
        let prompt = interaction.options.getString("question")
        ?.replaceAll(new RegExp(setStatusRegex, "g"), "")
        ?.replaceAll(new RegExp(setBannerRegex, "g"), "");
        let contents = [
            {
                text: prompt,
                role: "user"
            },
            {
                text: systemPromptHeader,
                role: "model"
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
                systemInstruction,
                temperature:interaction.options.getNumber("temperature") ?? 0.8
            }
        });

        let responseText = response?.text;

        //math formatting
        responseText = formatMath(responseText);

        let status = responseText.match(setStatusRegex)?.[1]?.slice(0, 128);
        let bannerDesc = responseText.match(setBannerRegex)?.[1]?.slice(0, 128);

        if(status){
            interaction?.client?.user?.setPresence({activities: [{name: status}], status: "online"});
            console.log("Setting status to:", status);
            // handle time duraction for rate limiting 
            let currentTime = Date.now();
            // update the status timestamp
            interaction.client.status.timeStamp = currentTime; 
            // set the new status description
            interaction.client.status.description = status;
        }

        if (bannerDesc && attachment && mimeType?.startsWith("image/")) {
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
        responseText = responseText
        ?.replaceAll(new RegExp(setStatusRegex, "g"), "")
        ?.replaceAll(new RegExp(setBannerRegex, "g"), "");

        if(!responseText) responseText = "No text was returned.";

        const chunks = splitMarkdownMessage(responseText);
        let msg;

        for(let x = 0; x < chunks.length; x++){
            if(x===0) await deferred?.edit({content: chunks[0]?.slice(0, 2000), allowedMentions: {users: [], roles: []}});
            else if(x===1) msg = await interaction?.followUp({content: chunks[1]?.slice(0, 2000), allowedMentions: {users: [], roles: []}});
            else msg = await msg?.reply({content: chunks[x]?.slice(0, 2000), allowedMentions: {users: [], roles: []}});
        }
    },
};

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
