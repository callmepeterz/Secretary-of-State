const { SlashCommandBuilder, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Sends info about uptime")
    .setNSFW(false),
    index: "Tool",
    isDeferred: false,
    cooldown: 1000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction.guild?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let embed = new EmbedBuilder()
        .setDescription(`This bot has been up since <t:${Math.round((Date.now() - interaction.client.uptime)/1000)}:F>, <t:${Math.round((Date.now() - interaction.client.uptime)/1000)}:R>`)
        .setColor(color);

        interaction?.reply({embeds: [embed]});
    },
};