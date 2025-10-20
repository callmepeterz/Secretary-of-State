const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandAttachmentOption, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const sharp = require("sharp");
const get = require("../util/httpsGet.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("convert")
    .setDescription("Converts an image to a different format")
    .setNSFW(false)
    .addAttachmentOption(
        new SlashCommandAttachmentOption()
        .setName("file")
        .setDescription("Image to be converted. Accepts JPEG, PNG, WebP, AVIF, GIF, SVG, and TIFF.")
        .setRequired(true)
    )
    .addStringOption(
        new SlashCommandStringOption()
        .setName("format")
        .setDescription("The format to convert to")
        .setRequired(true)
        .setChoices(
            {name: "PNG", value: "png"},
            {name: "JPG/JPEG", value: "jpeg"},
            {name: "GIF", value: "gif"},
            {name: "WEPB", value: "webp"},
            {name: "TIFF", value: "tiff"},
        )
    ),
    index: "",
    isDeferred: true,
    cooldown: 5000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        const color = interaction.guild?.members?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let embed = new EmbedBuilder().setColor(color);
        const attachment = interaction.options.getAttachment("file");
        const originalFormat = attachment.name.split(".")?.at(-1).toLowerCase();
        const newFormat = interaction.options.getString("format");
        const newName = attachment.name.split(".").slice(0, -1).join(".") + "." + newFormat;

        if(!["png", "jpg", "jpeg", "gif", "webp", "svg", "tiff", "avif"].includes(originalFormat)) return deferred.edit({embeds: [embed.setDescription("Invalid file format!")]});

        try {
            const originalData = await get(attachment.url);
            const convertedData = await sharp(Buffer.concat(originalData))
            [newFormat]()
            .toBuffer();
            let convertedAttachment = new AttachmentBuilder()
            .setName(newName)
            .setFile(Buffer.from(convertedData));
            deferred.edit({embeds: [embed.setTitle(`${originalFormat.toUpperCase()} → ${newFormat.toUpperCase()}`).setImage(newFormat === "tiff" ? null : `attachment://${newName}`)], files: [convertedAttachment]});
        } catch(err) {
            deferred.edit({embeds: [embed.setDescription(`Encountered an error!\n\`\`\`\n${String(err).slice(0, 1000)}\n\`\`\``)]});
        }
    },
};