const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandBooleanOption, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, MessageFlags } = require('discord.js');
const fxList = require("../assets/fxList.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("fx")
    .setDescription("Embeds social media posts")
    .setNSFW(false)
    .addStringOption(
        new SlashCommandStringOption()
        .setName("url")
        .setDescription("Post URL")
        .setRequired(true)
    )
    .addBooleanOption(
        new SlashCommandBooleanOption()
        .setName("spoiler")
        .setDescription("Mark this post as spoiler")
        .setRequired(false)
    ),
    index: "",
    isDeferred: false,
    cooldown: 1000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction.guild?.members?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let embed = new EmbedBuilder().setColor(color);
        let url = interaction.options.getString("url");
        let spoiler = interaction.options.getBoolean("spoiler") ?? false;

        let fxURL = "";
        for(let fx of fxList){
            let fxregex = new RegExp(`^${fx.regex.source}$`, "i");
            let match = fxregex.exec(url.trim());
            if(match){
                let {prefix, domain, suffix} = match.groups;
                fxURL = prefix + fx.domains[Math.floor(Math.random() * fx.domains.length)] + suffix;
                break;
            }
        }
        
        if(!fxURL) return interaction.reply({embeds: [embed.setDescription("Invalid/unsupported URL!")], flags: [MessageFlags.Ephemeral]});
        if(spoiler) fxURL = `||${fxURL}||`;

        interaction.reply(fxURL.slice(0, 2000));
    },
};