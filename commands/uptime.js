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
        let systemUptime = time.getTimeComponents(Math.floor(os.uptime() * 1000));
        let embed = new EmbedBuilder()
        .setDescription(`Bot uptime: ${botUptime.days} day${botUptime.days === 1 ? "": "s"} ${String(botUptime.hours).padStart(2, "0")}:${String(botUptime.minutes).padStart(2, "0")}:${String(botUptime.seconds).padStart(2, "0")}, since <t:${Math.round((Date.now() - interaction.client.uptime)/1000)}:f>\nSystem uptime: ${systemUptime.days} day${systemUptime.days === 1 ? "": "s"} ${String(systemUptime.hours).padStart(2, "0")}:${String(systemUptime.minutes).padStart(2, "0")}:${String(systemUptime.seconds).padStart(2, "0")}, since <t:${Math.floor((Date.now() / 1000) - os.uptime())}:f>`)
        .setColor(color)
        .setTimestamp();

        interaction?.reply({embeds: [embed]});
    },
};