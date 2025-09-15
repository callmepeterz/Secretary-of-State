const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require("node:fs");
const path = require("node:path");
const userTemplate = require("../assets/userTemplate.json");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("usersettings")
    .setDescription("User-specific settings for the Secretary of State")
    .setNSFW(false)
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("pronouns")
        .setDescription("Set your preferred pronouns for interactions with the Secretary of State")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("pronouns")
            .setDescription("The pronouns to be set")
            .setRequired(true)
            .setMaxLength(40)
        )
    ),
    index: "",
    isDeferred: false,
    cooldown: 1000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction.guild?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let embed = new EmbedBuilder().setColor(color);

        let userData = interaction.client.userData[interaction.user.id];
        if(!userData) {
            userData = userTemplate;
            userData.id = interaction.user.id;
        }

        switch(interaction.options.getSubcommand()){
            case "pronouns":
                userData.pronouns = interaction.options.getString("pronouns") ?? "";
                interaction.reply({embeds: [embed.setDescription(`Your preferred pronouns have been updated to \`${userData.pronouns}\`.`)], flags: MessageFlags.Ephemeral});
                break;
        }

        interaction.client.userData[interaction.user.id] = userData;
        let userDataPath = path.join(process.cwd(), `data/users/${userData.id}.json`);
        fs.writeFileSync(userDataPath, JSON.stringify(userData));
    },
};