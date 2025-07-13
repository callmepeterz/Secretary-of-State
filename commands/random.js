const { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandBooleanOption, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, MessageFlags } = require('discord.js');
const https = require("node:https");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("random")
    .setDescription("Generates a random number")
    .setNSFW(false)
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("min")
        .setDescription("Lower bound of random range, inclusive")
        .setRequired(true)
        .setMinValue(-1000000000)
        .setMaxValue(1000000000)
    )
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("max")
        .setDescription("Upper bound of random range, inclusive")
        .setRequired(true)
        .setMinValue(-1000000000)
        .setMaxValue(1000000000)
    )
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("n")
        .setDescription("Number of random integers to generate")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(30)
    )
    .addBooleanOption(
        new SlashCommandBooleanOption()
        .setName("duplicates")
        .setDescription("Whether to allow duplicate value, true by default")
        .setRequired(false)
    ),
    index: "Tool",
    isDeferred: false,
    cooldown: 3500,

   /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction?.guild?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let min = interaction.options.getInteger("min");
        let max = interaction.options.getInteger("max");
        let n = interaction.options.getInteger("n") ?? 1;
        let replacement = interaction.options.getBoolean("duplicates") ?? true;
        let embed = new EmbedBuilder().setColor(color);
        if(max <= min) return interaction?.reply({embeds: [embed.setDescription("Invalid range!")], flags: MessageFlags.Ephemeral});
        get({min, max, n, replacement, base: 10}, data => {
            let json;
            try {
                json = JSON.parse(data);
            } catch (error) {
                throw error;
            }
            let resultArray = json.result.random.data;
            let t = "";
            resultArray.forEach(v => t += `**${v}**\u2003`);
            t.slice(0, 2000);
            embed
            .setFooter({text: "Powered by random.org"})
            .setDescription(t);
            interaction?.reply({
                embeds: [embed]
            });
        });
    },
};


function get(p, fn) {
    let body = {
        "jsonrpc": "2.0",
        "method": "generateIntegers",
        "params": {
            "apiKey": process.env.RANDOM_API_KEY,
            ...p
        },
        "id": Math.floor(Math.random() * 9999) + 1
    };
    let reqbody = JSON.stringify(body);
    let options = {
        hostname: "api.random.org",
        path: "/json-rpc/2/invoke",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Content-Length": reqbody.length,
            "Connection": "keep-alive"
        }
    }
    let req = https.request(options, resR => {
        let data = "";
        resR.on("data", chunk => data += chunk);
        resR.on("error", err => {
            throw err
        });
        resR.on("end", () => fn(data));
    });
    req.write(reqbody);
    req.end();
}