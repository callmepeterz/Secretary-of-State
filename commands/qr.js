const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandIntegerOption, SlashCommandBooleanOption, SlashCommandSubcommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, InteractionResponse, EmbedBuilder, MessageFlags } = require('discord.js');
const encodeURL = require("../util/encodeURL");
const colorRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const banks = [
    {name: "[VietinBank] Ngân hàng TMCP Công thương Việt Nam", value: "970415"},
    {name: "[Vietcombank] Ngân hàng TMCP Ngoại Thương Việt Nam", value: "970436"},
    {name: "[BIDV] Ngân hàng TMCP Đầu tư và Phát triển Việt Nam", value: "970418"},
    {name: "[Agribank] Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam", value: "970405"},
    {name: "[OCB] Ngân hàng TMCP Phương Đông", value: "970448"},
    {name: "[MBBank] Ngân hàng TMCP Quân đội", value: "970422"},
    {name: "[Techcombank] Ngân hàng TMCP Kỹ thương Việt Nam", value: "970407"},
    {name: "[ACB] Ngân hàng TMCP Á Châu", value: "970416"},
    {name: "[VPBank] Ngân hàng TMCP Việt Nam Thịnh Vượng", value: "970432"},
    {name: "[TPBank] Ngân hàng TMCP Tiên Phong", value: "970423"},
    {name: "[Sacombank] Ngân hàng TMCP Sài Gòn Thương Tín", value: "970403"},
    {name: "[HDBank] Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh", value: "970437"},
    {name: "[VietCapitalBank] Ngân hàng TMCP Bản Việt", value: "970454"},
    {name: "[SCB] Ngân hàng TMCP Sài Gòn", value: "970429"},
    {name: "[VIB] Ngân hàng TMCP Quốc tế Việt Nam", value: "970441"},
    {name: "[SHB] Ngân hàng TMCP Sài Gòn - Hà Nội", value: "970443"},
    {name: "[Eximbank] Ngân hàng TMCP Xuất Nhập khẩu Việt Nam", value: "970431"},
    {name: "[MSB] Ngân hàng TMCP Hàng Hải Việt Nam", value: "970426"},
    {name: "[CAKE] TMCP Việt Nam Thịnh Vượng - Ngân hàng số CAKE by VPBank", value: "546034"},
    {name: "[Ubank] TMCP Việt Nam Thịnh Vượng - Ngân hàng số Ubank by VPBank", value: "546035"},
    {name: "[Timo] Ngân hàng số Timo by Ban Viet Bank (Timo by Ban Viet Bank)", value: "963388"},
    {name: "[ViettelMoney] Tổng Công ty Dịch vụ số Viettel - Chi nhánh tập đoàn công nghiệp viễn thông Quân Đội", value: "971005"},
    {name: "[VNPTMoney] VNPT Money", value: "971011"},
    {name: "[SaigonBank] Ngân hàng TMCP Sài Gòn Công Thương", value: "970400"},
    {name: "[BacABank] Ngân hàng TMCP Bắc Á", value: "970409"},
    {name: "[PVcomBank] Ngân hàng TMCP Đại Chúng Việt Nam", value: "970412"},
    {name: "[MBV] Ngân hàng TNHH MTV Việt Nam Hiện Đại", value: "970414"},
    {name: "[NCB] Ngân hàng TMCP Quốc Dân", value: "970419"},
    {name: "[ShinhanBank] Ngân hàng TNHH MTV Shinhan Việt Nam", value: "970424"},
    {name: "[ABBANK] Ngân hàng TMCP An Bình", value: "970425"},
    {name: "[VietABank] Ngân hàng TMCP Việt Á", value: "970427"},
    {name: "[NamABank] Ngân hàng TMCP Nam Á", value: "970428"},
    {name: "[PGBank] Ngân hàng TMCP Thịnh vượng và Phát triển", value: "970430"},
    {name: "[VietBank] Ngân hàng TMCP Việt Nam Thương Tín", value: "970433"},
    {name: "[BaoVietBank] Ngân hàng TMCP Bảo Việt", value: "970438"},
    {name: "[SeABank] Ngân hàng TMCP Đông Nam Á", value: "970440"},
    {name: "[COOPBANK] Ngân hàng Hợp tác xã Việt Nam", value: "970446"},
    {name: "[LPBank] Ngân hàng TMCP Lộc Phát Việt Nam", value: "970449"},
    {name: "[KienLongBank] Ngân hàng TMCP Kiên Long", value: "970452"},
    {name: "[KBank] Ngân hàng Đại chúng TNHH Kasikornbank", value: "668888"},
    {name: "[KookminHN] Ngân hàng Kookmin - Chi nhánh Hà Nội", value: "970462"},
    {name: "[KEBHanaHCM] Ngân hàng KEB Hana – Chi nhánh Thành phố Hồ Chí Minh", value: "970466"},
    {name: "[KEBHANAHN] Ngân hàng KEB Hana – Chi nhánh Hà Nội", value: "970467"},
    {name: "[MAFC] Công ty Tài chính TNHH MTV Mirae Asset (Việt Nam) ", value: "977777"},
    {name: "[Citibank] Ngân hàng Citibank, N.A. - Chi nhánh Hà Nội", value: "533948"},
    {name: "[KookminHCM] Ngân hàng Kookmin - Chi nhánh Thành phố Hồ Chí Minh", value: "970463"},
    {name: "[VBSP] Ngân hàng Chính sách Xã hội", value: "999888"},
    {name: "[Woori] Ngân hàng TNHH MTV Woori Việt Nam", value: "970457"},
    {name: "[VRB] Ngân hàng Liên doanh Việt - Nga", value: "970421"},
    {name: "[UnitedOverseas] Ngân hàng United Overseas - Chi nhánh TP. Hồ Chí Minh", value: "970458"},
    {name: "[StandardChartered] Ngân hàng TNHH MTV Standard Chartered Bank Việt Nam", value: "970410"},
    {name: "[PublicBank] Ngân hàng TNHH MTV Public Việt Nam", value: "970439"},
    {name: "[Nonghyup] Ngân hàng Nonghyup - Chi nhánh Hà Nội", value: "801011"},
    {name: "[IndovinaBank] Ngân hàng TNHH Indovina", value: "970434"},
    {name: "[IBKHCM] Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh TP. Hồ Chí Minh", value: "970456"},
    {name: "[IBKHN] Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh Hà Nội", value: "970455"},
    {name: "[HSBC] Ngân hàng TNHH MTV HSBC (Việt Nam)", value: "458761"},
    {name: "[HongLeong] Ngân hàng TNHH MTV Hong Leong Việt Nam", value: "970442"},
    {name: "[GPBank] Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu", value: "970408"},
    {name: "[Vikki] Ngân hàng TNHH MTV Số Vikki", value: "970406"},
    {name: "[DBSBank] DBS Bank Ltd - Chi nhánh Thành phố Hồ Chí Minh", value: "796500"},
    {name: "[CIMB] Ngân hàng TNHH MTV CIMB Việt Nam", value: "422589"},
    {name: "[CBBank] Ngân hàng Thương mại TNHH MTV Xây dựng Việt Nam", value: "970444"},
]

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