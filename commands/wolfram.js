const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const https = require("node:https");
const encodeURL = require("../util/encodeURL.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("wolfram")
    .setDescription("Ask Wolfram Alpha")
    .setNSFW(false)
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("short")
        .setDescription("Gives a short answer")
        .addStringOption(
        new SlashCommandStringOption()
            .setName("query")
            .setDescription("Question to ask Wolfram Alpha")
            .setRequired(true)
            .setMaxLength(256)
        ),
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("img")
        .setDescription("Gives long form answer as an image")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("query")
            .setDescription("Question to ask Wolfram Alpha")
            .setRequired(true)
            .setMaxLength(256)
        ),
    ),
    
    index: "Tool",
    cooldown: 4000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction.guild?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let q = interaction.options.getString("query");
        let embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(q.slice(0, 256))
        if(interaction.options.getSubcommand() === "short"){
            let data = await get(`/v1/result?appid=${process.env.WOLFRAM_ALPHA_APPID_1}&i=${encodeURL(q)}&units=metric&timeout=10`);
            deferred.edit({embeds: [embed.setDescription("```\n"+data.join().slice(0, 2000)+"\n```")]});
        }
        else if(interaction.options.getSubcommand() === "img"){
            let data = await get(`/v1/simple?appid=${process.env.WOLFRAM_ALPHA_APPID_2}&i=${encodeURL(q)}&units=metric&timeout=10&layout=labelbar&fontsize=30&width=500`);
            deferred.edit({
                embeds: [embed.setImage("attachment://wolfram.png")],
                files:[
                    new AttachmentBuilder()
                    .setName("wolfram.png")
                    .setFile(Buffer.concat(data))
                ]
            })
        }
        
    },
};

async function get(path) {
    let options = {
        hostname: "api.wolframalpha.com",
        path,
        method: "GET"
    }
    let data = [];
    return new Promise(resolve => {
        https.request(options, res => {
            res.on("error", err => {
                throw err
            });
            res.on("data", chunk => data.push(chunk));
            res.on("end", () => resolve(data));
        }).end();
    });
}
