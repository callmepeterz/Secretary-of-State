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
        let color = interaction.guild?.members?.me?.displayHexColor || process.env.DEFAULT_COLOR;
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

function human(bytes) {
  const units = ['B','KB','MB','GB','TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length-1) { bytes /= 1024; i++; }
  return `${bytes.toFixed(2)} ${units[i]}`;
}