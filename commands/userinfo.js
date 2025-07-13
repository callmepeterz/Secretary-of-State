const { SlashCommandBuilder, SlashCommandUserOption, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Shows info of a user")
    .setNSFW(false)
    .addUserOption(
        new SlashCommandUserOption()
        .setName("user")
        .setDescription("User to get info of, leave blank for yourself")
        .setRequired(false)
    ),
    index: "Tool",
    isDeferred: false,
    cooldown: 1000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction.guild?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let user = interaction.options.getUser("user") ?? interaction.user;
        let member = interaction.guild?.members?.cache?.get(user.id);
        let embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${user.tag} ${member?.nickname ? `(${member.nickname})` : user?.globalName ? `(${user.globalName})` : ""}`.slice(0,256))
        .setThumbnail(user.avatarURL({size: 1024}))
        .setURL(user.avatarURL({size: 1024}))
        .addFields(
            {name: "Username", value: user.tag, inline: true},
            {name: "Display name", value: user.globalName ?? "`None`", inline: true},
            {name: "Server nickname", value: member?.nickname ?? "`None`", inline: true},
            {name: "User ID", value: user.id, inline: false},
            {name: "Created on", value: `<t:${Math.round((user.createdTimestamp)/1000)}:F>, <t:${Math.round((user.createdTimestamp)/1000)}:R>`, inline: false},
            {name: "Joined server on", value: member?.joinedTimestamp ? `<t:${Math.round((member.joinedTimestamp)/1000)}:F>, <t:${Math.round((member.joinedTimestamp)/1000)}:R>`: "`Not available`", inline: false}
        )
        interaction?.reply({embeds: [embed]});
    },
};