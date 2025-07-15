const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandIntegerOption, SlashCommandBooleanOption, SlashCommandSubcommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, InteractionResponse, EmbedBuilder, MessageFlags } = require('discord.js');
const encodeURL = require("../util/encodeURL.js");
const colorRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const banks = require("../assets/banks.json");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("qr")
    .setDescription("Generates QR code")
    .setNSFW(false)
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("url")
        .setDescription("Generates a QR code pointing to a URL")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("url")
            .setDescription("The URL to encode")
            .setRequired(true)
            .setMaxLength(1500)
        )
        .addStringOption(
            new SlashCommandStringOption()
            .setName("color")
            .setDescription("Hex value color of the QR code")
            .setMinLength(3)
            .setMaxLength(7)
        )
        .addStringOption(
            new SlashCommandStringOption()
            .setName("bgcolor")
            .setDescription("Hex value color of the background")
            .setMinLength(3)
            .setMaxLength(7)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("wifi")
        .setDescription("Generates a QR code pointing to a WiFi network")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("ssid")
            .setDescription("The name of the WiFi network")
            .setMaxLength(32)
            .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
            .setName("password")
            .setDescription("The password of the network")
            .setMinLength(8)
            .setMaxLength(63)
        )
        .addStringOption(
            new SlashCommandStringOption()
            .setName("encryption")
            .setDescription("The type of encryption of the network, default is WPA")
            .addChoices(
                {name: "WPA/WPA2", value: "WPA"},
                {name: "WEP", value: "WEP"},
                {name: "No password", value: "nopass"}
            )
        )
        .addBooleanOption(
            new SlashCommandBooleanOption()
            .setName("hidden")
            .setDescription("Whether the network is hidden, default is false")
        )
        .addStringOption(
            new SlashCommandStringOption()
            .setName("color")
            .setDescription("Hex value color of the QR code")
            .setMinLength(3)
            .setMaxLength(7)
        )
        .addStringOption(
            new SlashCommandStringOption()
            .setName("bgcolor")
            .setDescription("Hex value color of the background")
            .setMinLength(3)
            .setMaxLength(7)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("bank")
        .setDescription("Generates a bank QR code (VietQR)")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("bank")
            .setDescription("Name of the bank")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
            .setName("account")
            .setDescription("Account number or alias")
            .setRequired(true)
            .setMaxLength(19)
        )
        .addIntegerOption(
            new SlashCommandIntegerOption()
            .setName("amount")
            .setDescription("Amount of money in VND")
            .setMinValue(0)
            .setMaxValue(9999999999999)
        )
        .addStringOption(
            new SlashCommandStringOption()
            .setName("description")
            .setDescription("Description of the transaction")
            .setMaxLength(50)
        )
        .addStringOption(
            new SlashCommandStringOption()
            .setName("accountname")
            .setDescription("Name of the account")
            .setMaxLength(30)
        )
        .addBooleanOption(
            new SlashCommandBooleanOption()
            .setName("full")
            .setDescription("Whether to show the full version of the QR code")
        )
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
        let qrColor = interaction.options.getString("color")?.match(colorRegex)?.[1] ?? "000";
        let bgColor = interaction.options.getString("bgcolor")?.match(colorRegex)?.[1] ?? "fff";

        let embed = new EmbedBuilder().setColor(color);
        switch(interaction.options.getSubcommand()){
            case "url":
                embed.setImage(`http://api.qrserver.com/v1/create-qr-code/?data=${encodeURL(interaction.options.getString("url"))}&size=300x300&qzone=1&color=${qrColor}&bgcolor=${bgColor}`);
                break;
            case "wifi":
                embed.setImage(`http://api.qrserver.com/v1/create-qr-code/?data=${encodeURL(`WIFI:S:${interaction.options.getString("ssid")};T:${interaction.options.getString("password") ? (interaction.options.getString("encryption") ?? "WPA") : "nopass"};P:${interaction.options.getString("password") ?? ""};H:${interaction.options.getBoolean("hidden") ? "true" : "false"};;`)}&size=300x300&qzone=1&color=${qrColor}&bgcolor=${bgColor}`);
                break;
            case "bank":
                let bank = interaction.options.getString("bank");
                if(!banks.find(b=>b.value===bank)) bank = banks.find(b=>b.name.toLowerCase().includes(bank.toLowerCase()))?.value;
                if(!bank) return interaction?.reply({embeds: [embed.setDescription("Bank not found!")], flags: MessageFlags.Ephemeral});
                embed.setImage(`https://img.vietqr.io/image/${bank}-${interaction.options.getString("account")}-${interaction.options.getBoolean("full") ? "print" : "qr_only"}.png?amount=${interaction.options.getInteger("amount") ?? ""}&addInfo=${encodeURL(interaction.options.getString("description") ?? "")}&accountName=${encodeURL(interaction.options.getString("accountname") ?? "")}`);
                break;
        }
        interaction?.reply({embeds: [embed]});
    },

    /**
     * @param {AutocompleteInteraction} interaction 
     */
    async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
        const filtered = banks.filter(b=>b.name.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25);
        
		await interaction.respond(filtered);
	},
};