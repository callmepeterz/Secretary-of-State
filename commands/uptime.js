const { SlashCommandBuilder, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder } = require('discord.js');
const os = require("node:os");
const time = require("../util/formatTime.js");

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
        let botUptime = time.getTimeComponents(interaction.client.uptime);
        let systemUptime = time.getTimeComponents(os.uptime() * 1000);
        let embed = new EmbedBuilder()
        .setDescription(`Bot uptime: ${botUptime.days} day${botUptime.days > 1 ? "s": ""} ${botUptime.hours}:${botUptime.minutes}:${botUptime.seconds} <t:${Math.round((Date.now() - interaction.client.uptime)/1000)}:F>\nBot uptime: ${systemUptime.days} day${systemUptime.days > 1 ? "s": ""} ${systemUptime.hours}:${systemUptime.minutes}:${systemUptime.seconds} <t:${os.uptime()}:F>`)
        .setColor(color)
        .setTimestamp();

        interaction?.reply({embeds: [embed]});
    },
};