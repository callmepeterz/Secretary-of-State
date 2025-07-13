const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandNumberOption, SlashCommandAttachmentOption, ChatInputCommandInteraction, InteractionResponse, SlashCommandIntegerOption } = require('discord.js');
const https = require("node:https");
const fs = require("node:fs");
const systemInstruction = fs.readFileSync("./assets/systemPrompt.txt", "utf-8").toString();
const setStatusRegex = /\{\{SetStatus::(.+?)\}\}/;
const setBannerRegex = /\{\{SetBanner::(.+?)\}\}/;
const supportedFileFormats = [ 
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
  "audio/wav",
  "audio/mp3",
  "audio/aiff",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
  "video/mp4",
  "video/mpeg",
  "video/mov",
  "video/avi",
  "video/x-flv",
  "video/mpg",
  "video/webm",
  "video/wmv",
  "video/3gpp",
  "text/plain",
  "text/html",
  "text/css",
  "text/javascript",
  "application/x-javascript",
  "text/x-typescript",
  "application/x-typescript",
  "text/csv",
  "text/markdown",
  "text/x-python",
  "application/x-python-code",
  "application/json",
  "text/xml",
  "application/rtf",
  "text/rtf"
];

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
                attachmentData = await getAttachment(attachment);
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

        await deferred?.edit({content: responseText.slice(0, 2000), allowedMentions: {users: [], roles: []}});
        if (responseText.length > 2000){
            let msg = await interaction?.followUp({content: responseText.slice(2000, 4000), allowedMentions: {users: [], roles: []}});
            if (responseText.length > 4000) msg?.reply({content: responseText.slice(4000, 6000), allowedMentions: {users: [], roles: []}});
        }
    },
};

async function getAttachment(a){
    return new Promise(resolve => {
        let data = [];
        let urlparts = a.url
            .replace("https://", "")
            .replace("http://", "")
            .split("/");
        let host = urlparts[0];
        let p = "/" + urlparts.slice(1).join("/");

        https.request({
            hostname: host,
            path: p,
            method: "GET"
        }, (res) => {
            res.on("data", (chunk) => data.push(chunk));
            res.on("end", () => resolve(Buffer.concat(data).toString("base64")));
            res.on("error", (err) => console.error(err));
        }).end();
    });
}