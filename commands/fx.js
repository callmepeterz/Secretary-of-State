const { SlashCommandBuilder, SlashCommandStringOption, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, MessageFlags } = require('discord.js');
const urlRegex = /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\//i;
const fxDomains = [
    "fxtwitter.com",
    "girlcockx.com",
    "hotyurisex.com",
    "yaoisex.com",
    "boypussyx.com"
];

module.exports = {
    data: new SlashCommandBuilder()
    .setName("fx")
    .setDescription("Embeds Twitter/X videos")
    .setNSFW(false)
    .addStringOption(
        new SlashCommandStringOption()
        .setName("url")
        .setDescription("Twitter/X URL")
        .setRequired(true)
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

        if(!urlRegex.test(url)) return interaction.reply({embeds: [embed.setDescription("Invalid URL!")], flags: [MessageFlags.Ephemeral]});
        interaction.reply(url.replace(urlRegex, `https://${fxDomains[Math.floor(Math.random() * fxDomains.length)]}/`));
    },
};