const { SlashCommandBuilder, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Shows info of this server")
    .setNSFW(false)
    .setContexts(InteractionContextType.Guild),
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
        let guild = interaction?.guild;
        embed
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL({size: 1024}))
        .setURL(guild.iconURL({size: 1024}))
        .addFields(
            {name: "Server ID", value: guild.id, inline: true},
            {name: "Owner", value: `<@${guild.ownerId}>`, inline: true},
            {name: "Created on", value: `<t:${Math.round((guild.createdTimestamp)/1000)}:F>, <t:${Math.round((guild.createdTimestamp)/1000)}:R>`, inline: false},
            {name: "Total members", value: guild.memberCount.toString(), inline: true},
            {name: "Citizens", value: guild.members.cache.filter(m=>m.roles.cache.find(r=>r.name==="Citizen")).size.toString(), inline: true},
            {name: "Bots", value: guild.members.cache.filter(m=>m.user.bot).size.toString(), inline: true}
        )
        interaction?.reply({embeds: [embed]});
    },
};