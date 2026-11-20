const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandIntegerOption, SlashCommandBooleanOption, SlashCommandSubcommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, InteractionResponse, EmbedBuilder, MessageFlags, SlashCommandUserOption, TimestampStyles } = require('discord.js');
const countdownList = require("../assets/countdown.js");
const timeUtil = require("../util/formatTime.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("countdown")
    .setDescription("Shows countdowns to events")
    .setNSFW(false)
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("countdown")
        .setDescription("Select countdown")
        .setRequired(true)
        .setAutocomplete(true)
        .setMinValue(0)
    ),
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
        let countdownId = interaction.options.getInteger("countdown");
        let countdown = countdownList.at(countdownId);
        let now = new Date();

        embed.setTitle(countdown.name.slice(0, 256))
        countdown.timers.forEach(t => {
            embed.addFields({
                name: t.name.slice(0, 256),
                value: `**<t:${getDiscordTimestamp(t.getTime(now))}:F>**\n${getRelativeTime(t.getTime(now), now)}`.slice(0, 1024),
                inline: true
            })
        })

        interaction.reply({embeds: [embed]});
    },

    /**
     * @param {AutocompleteInteraction} interaction 
     */
    async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
        let cList = countdownList.map((v, i) => { return {name : v.name, value: i}});
        const filtered = cList.filter(b=>b.name.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25);
        
		await interaction.respond(filtered);
	},
};

function getDiscordTimestamp(time){
    return Math.round(time.getTime() / 1000);
}

function getRelativeTime(time, now){
    const t = new Date(Math.abs(time.getTime() - now.getTime()));
    const tc = timeUtil.getTimeComponents(t);
    const timeString = `${tc.days} day${tc.days === 1 ? "": "s"} ${String(tc.hours).padStart(2, "0")}:${String(tc.minutes).padStart(2, "0")}:${String(tc.seconds).padStart(2, "0")}`;
    return time.getTime() >= now.getTime() ? "in " + timeString : timeString + " ago";
}
