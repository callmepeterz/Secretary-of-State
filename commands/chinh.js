const { SlashCommandBuilder, SlashCommandIntegerOption, ChatInputCommandInteraction, InteractionResponse } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("chinh")
    .setDescription("chinhchinhchinh")
    .setNSFW(false)
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("times")
        .setDescription("Number of times to call chú chinh")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20)
    ),
    index: "Test",
    isDeferred: false,
    cooldown: 3000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        for(let i = 0; i < interaction.options.getInteger("times"); i++){
            if(i === 0) await interaction.reply({content: `<@!${process.env.CHINH_ID}> ÔI CHINH ƠI CHINH ƠI CHINH CHINH CHINH`, allowedMentions: {users: [], roles: []}});
            else await interaction.channel.send({content: `<@!${process.env.CHINH_ID}> ÔI CHINH ƠI CHINH ƠI CHINH CHINH CHINH`, allowedMentions: {users: [], roles: []}});
        }
    },
};