const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandNumberOption, SlashCommandAttachmentOption, ChatInputCommandInteraction, InteractionResponse } = require('discord.js');
const https = require("node:https");
const fs = require("node:fs");
const systemInstruction = fs.readFileSync("./assets/systemPrompt.txt", "utf-8").toString();

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
    ),
    index: "Tool",
    cooldown: 5000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let attachment = interaction.options.getAttachment("file");
        let prompt = `[The current user sending the following is ${interaction.user.displayName} with the ID ${interaction.user.id}, mentionable with <@${interaction.user.id}>. The current date and time is ${new Date().toString()}.]: ` + interaction.options.getString("question");
        let contents = prompt;
        if(attachment){
            let attachmentData = await getAttachment(attachment);
            contents = [
                {
                    inlineData: {
                        mimeType: attachment.contentType,
                        data: attachmentData,
                    },
                },
                {text: prompt}
            ];
        }
        const response = await interaction.client.ai.models.generateContent({
            model: interaction.options.getString("model") ?? "gemini-2.5-flash",
            contents,
            config: {
                systemInstruction,
                temperature:interaction.options.getNumber("temperature") ?? 0.8
            }
        });
        await deferred.edit({content: response.text.slice(0, 2000), allowedMentions: {users: [], roles: []}});
        if (response.text.length > 2000){
            let msg = await interaction?.followUp({content: response.text.slice(2000, 4000), allowedMentions: {users: [], roles: []}});
            if (response.text.length > 4000) msg?.reply({content: response.text.slice(4000, 6000), allowedMentions: {users: [], roles: []}});
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