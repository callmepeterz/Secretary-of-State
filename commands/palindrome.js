const { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandBooleanOption, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder } = require('discord.js');
const getPalindromes = require("../assets/palindromes.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("palindromes")
    .setDescription("Get the three palindrome numbers that add up to the given integer")
    .setNSFW(false)
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("n")
        .setDescription("The integer to which the three palindromes add up")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(Number.MAX_SAFE_INTEGER)
    )
    .addBooleanOption(
        new SlashCommandBooleanOption()
        .setName("verbose")
        .setDescription("Whether or not to show additional information")
        .setRequired(false)
    ),
    index: "Tool",
    cooldown: 1500,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction.guild?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let n = interaction.options.getInteger("n");
        let verbose = interaction.options.getBoolean("verbose") ?? false;
        let palindromesOutput = getPalindromes(n);
        let embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`Palindromes of ${n}`)
            .setDescription(getPalindromeText(palindromesOutput.palindromes, palindromesOutput.sum));
        if(verbose) embed.addFields({name: "Additional information", value:  `__Type__: ${palindromesOutput.type ?? "None"}\n__Is a Special Number?__: ${palindromesOutput.isSpecial ?? "None"}\n__Algorithm__: ${palindromesOutput.algorithm || "None"}\n__Adjustment Step__: ${palindromesOutput.adjustment || " None"}`});
        deferred.edit({embeds: [embed]});
    },
};

function getPalindromeText(p, s) {
    let length = p[0].toString().length;
    let spaces = n => " ".repeat(n);
    return "```\n" + `${spaces(1)}${p[0]}\n` + `+${spaces(length - p[1].toString().length)}${p[1]}\n` + `+${spaces(length - p[2].toString().length)}${p[2]}\n` + "-".repeat(length + 1) + "\n" + `${spaces(length - s.toString().length + 1)}${s}\n` + "```";
}