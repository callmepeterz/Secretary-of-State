const { SlashCommandBuilder, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Sends info about latency")
    .setNSFW(false),
    index: "Tool",
    cooldown: 1000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction.guild?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let embed = new EmbedBuilder().setColor(color);
        let msg = await interaction.channel?.send("Pinging...").catch(()=>{});
        if(!msg) return deferred?.edit({embeds: [embed.setDescription("Could not get latency!")]});
        let msgTimestamp = msg?.createdTimestamp;
        msg.delete().catch(()=>{});
        embed.setDescription(`**Command latency: ** ${msgTimestamp - interaction.createdTimestamp} ms\n**API latency: **${interaction.client.ws.ping === -1 ? "Not available" : `${interaction.client.ws.ping} ms`}`);
        deferred?.edit({embeds: [embed]});
    },
};