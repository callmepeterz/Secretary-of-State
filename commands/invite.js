const { SlashCommandBuilder, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder } = require('discord.js');
const encodeURL = require("../util/encodeURL");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Sends an invite to the server")
    .setNSFW(false),
    index: "Tool",
    cooldown: 1000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction.guild?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let embed = new EmbedBuilder().setColor(color);
        let invites = await interaction?.guild?.invites?.fetch();
        let invite = invites.filter(i => i.channel.name === "welcome").first() ?? invites.first();
        if(!invite) return deferred?.edit({embeds: [embed.setDescription("Could not find invites!")]});

        embed
        .setTitle(invite.guild.name)
        .setURL(invite.url)
        .setDescription(invite.url)
        .setFields(
            {name: "Expiry", value: invite.expiresTimestamp ? `<t:${Math.round(invite.expiresTimestamp/1000)}:F>, <t:${Math.round(invite.expiresTimestamp/1000)}:R>` : "Never"},
            {name: "Uses", value: `${invite.uses ?? "Not available"}`, inline: true},
            {name: "Max uses", value: `${invite.maxUses || "∞"}`, inline: true}
        )
        .setThumbnail(`http://api.qrserver.com/v1/create-qr-code/?data=${encodeURL(invite.url)}&size=150x150&qzone=1`)
        deferred?.edit({embeds: [embed]});
    },
};