const { SlashCommandBuilder, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, MessageFlags } = require('discord.js');
const os = require("node:os");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("mem")
    .setDescription("Sends info about memory usage")
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
        let embed = new EmbedBuilder().setColor(color);
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;

        embed
        .setTitle('Memory Usage')
        .addFields(
            { name: 'Total', value: human(total), inline: true },
            { name: 'Used', value: human(used), inline: true },
            { name: 'Free', value: human(free), inline: true },
            { name: 'Load (1m)', value: `${os.loadavg()[0].toFixed(2)}`, inline: true }
        )
        .setTimestamp();
        interaction?.reply({embeds: [embed]});
    },
};