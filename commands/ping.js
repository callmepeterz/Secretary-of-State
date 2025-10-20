const { SlashCommandBuilder, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Sends info about latency")
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
        let msg = await interaction.channel?.send("Pinging...").catch(()=>{});
        if(!msg) return interaction?.reply({embeds: [embed.setDescription("Could not get latency!")], flags: MessageFlags.Ephemeral});
        let msgTimestamp = msg?.createdTimestamp;
        msg.delete().catch(()=>{});
        embed
        .setDescription(`**Command latency: ** ${msgTimestamp - interaction.createdTimestamp} ms\n**API latency: **${interaction.client.ws.ping === -1 ? "Not available" : `${interaction.client.ws.ping} ms`}`)
        .setTimestamp();
        interaction?.reply({embeds: [embed]});
    },
};