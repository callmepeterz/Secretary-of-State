const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandBooleanOption, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, MessageFlags } = require('discord.js');
const twitterUrlRegex = /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\//i;
const instagramUrlRegex = /^https?:\/\/(?:www\.)?(?:instagram\.com|x\.com)\//i;

const fxDomains = [
    "fxtwitter.com",
    "girlcockx.com",
    "hotyurisex.com",
    "yaoisex.com",
    "boypussyx.com"
];

module.exports = {
    data: new SlashCommandBuilder()
    .setName("fx")
    .setDescription("Embeds Twitter/X or Instagram posts")
    .setNSFW(false)
    .addStringOption(
        new SlashCommandStringOption()
        .setName("url")
        .setDescription("Twitter/X or Instagram URL")
        .setRequired(true)
    )
    .addBooleanOption(
        new SlashCommandBooleanOption()
        .setName("spoiler")
        .setDescription("Mark this post as spoiler")
        .setRequired(false)
    ),
    index: "",
    isDeferred: false,
    cooldown: 1000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction.guild?.members?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let embed = new EmbedBuilder().setColor(color);
        let url = interaction.options.getString("url");
        let spoiler = interaction.options.getBoolean("spoiler") ?? false;

        if(twitterUrlRegex.test(url)) return interaction.reply(setSpoiler(url.replace(twitterUrlRegex, `https://${fxDomains[Math.floor(Math.random() * fxDomains.length)]}/`), spoiler));
        if(instagramUrlRegex.test(url)) return interaction.reply(setSpoiler(url.replace(instagramUrlRegex, `https://oginstagram.com/`), spoiler));
        interaction.reply({embeds: [embed.setDescription("Invalid URL!")], flags: [MessageFlags.Ephemeral]});
    },
};

function setSpoiler(text, spoiler){
    return spoiler ? `||${text}||` : text;
}