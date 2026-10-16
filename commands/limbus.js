const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandIntegerOption, SlashCommandBooleanOption, SlashCommandSubcommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, InteractionResponse, EmbedBuilder, MessageFlags, SlashCommandUserOption } = require('discord.js');
const fs = require("node:fs");
const path = require("node:path");
const userTemplate = require("../assets/userTemplate.json");
const limbus = require("../assets/limbus.json");
const dayMili = 86400000;

module.exports = {
    data: new SlashCommandBuilder()
    .setName("limbus")
    .setDescription("User's Limbus Company (LC) information")
    .setNSFW(false)
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("show")
        .setDescription("Displays a user's Limbus Company (LC) information")
        .addUserOption(
            new SlashCommandUserOption()
            .setName("user")
            .setDescription("Leave blank for yourself")
            .setRequired(false)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("setcode")
        .setDescription("Set your Limbus Company friend code")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("code")
            .setDescription("Your Limbus Company friend code; enter 0000000000 to clear")
            .setMinLength(10)
            .setMaxLength(10)
            .setRequired(true)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("setspoiler")
        .setDescription("Mark your most recently completed Canto/Intervallo")
        .addIntegerOption(
            new SlashCommandIntegerOption()
            .setName("chapter")
            .setDescription("Your most recently completed Canto/Intervallo")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("admin")
        .setDescription("[ADMIN]")
        .addUserOption(   
            new SlashCommandUserOption()
            .setName("user")
            .setDescription("The target user")
            .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
            .setName("code")
            .setDescription("The Limbus Company friend code; enter 0000000000 to clear")
            .setMinLength(10)
            .setMaxLength(10)
            .setRequired(false)
        )
        .addIntegerOption(
            new SlashCommandIntegerOption()
            .setName("chapter")
            .setDescription("The most recently completed Canto/Intervallo")
            .setRequired(false)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("time")
        .setDescription("Shows Limbus Company reset and update schedule")
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
        let now = new Date();

        let user = interaction.options.getUser("user") || interaction.user;
        let code = interaction.options.getString("code") || null;
        let chapter = interaction.options.getInteger("chapter") ?? null;
        let userData = interaction.client.userData[user.id];
        if(!userData) {
            userData = JSON.parse(JSON.stringify(userTemplate));
            userData.id = user.id;
        }
        if(!userData.limbus) {
            userData.limbus = JSON.parse(JSON.stringify(userTemplate.limbus));
        }

        switch(interaction.options.getSubcommand()){
            case "show":
                return showLimbus(false);
                break;
            case "setcode":
                userData.limbus.code = code === "0000000000" ? null : code;
                showLimbus();
                break;
            case "setspoiler":
                if(!validateChapter(chapter)) return showError("Invalid Canto/Intervallo!");
                userData.limbus.chapter = chapter;
                showLimbus();
                break;
            case "admin":
                if(interaction.user.id !== process.env.OWNER_ID) return showError("Unauthorized!");
                if(chapter){
                    if(!validateChapter(chapter)) return showError("Invalid Canto/Intervallo!");
                    userData.limbus.chapter = chapter;
                }
                if(code) userData.limbus.code = code === "0000000000" ? null : code;
                showLimbus();
                break;
            case "time":
                return showTime();
        }

        interaction.client.userData[user.id] = userData;
        let userDataPath = path.join(process.cwd(), `data/users/${userData.id}.json`);
        fs.writeFileSync(userDataPath, JSON.stringify(userData, null, "\t"));

        function showLimbus(ephemeral = true){
            embed
            .setAuthor({name: user.displayName, iconURL: user.avatarURL()})
            .setDescription(`<@$1124352399570653185> friend code:\n\`\`\`\n${userData.limbus.code ?? "No friend code set"}\n\`\`\`\n${userData.limbus.chapter === -1 ? "" : userData.limbus.chapter === limbus.chapters.length - 1 ? `-# This user has completed the latest Canto/Intervallo` : `ⓘ Spoiler advisory: This user has progressed up to and completed **${limbus.chapters[userData.limbus.chapter]}**.`}`)
            interaction?.reply({embeds: [embed], flags: ephemeral ? [MessageFlags.Ephemeral] : []});
        }

        function showTime(){
            embed
            .setDescription(`**<@$1124352399570653185> Schedule**\n- **Daily reset:** <t:${getDailyReset()}:F>, <t:${getDailyReset()}:R>\n- **Weekly reset:** <t:${getWeeklyReset()}:F>, <t:${getWeeklyReset()}:R>\n- **Weekly update:** <t:${getWeeklyUpdate()}:F>, <t:${getWeeklyUpdate()}:R>`);
            interaction?.reply({embeds: [embed]});
        }

        function getDailyReset(){
            let time = new Date();
            time.setUTCFullYear(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            time.setUTCHours(21, 0, 0, 0);
            
            if(now.getUTCHours() >= 21) time.setTime(time.getTime() + dayMili);
            return getDiscordTimestamp(time);
        }

        function getWeeklyReset(){
            let time = new Date();
            time.setUTCFullYear(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            time.setUTCHours(21, 0, 0, 0);
            
            if(now.getUTCDay() < 3 || (now.getUTCDay() === 3 && now.getUTCHours() < 21)) time.setTime(time.getTime() + dayMili * (3 - now.getUTCDay()));
            else if(now.getUTCDay() > 3 || (now.getUTCDay() === 3 && now.getUTCHours() >= 21)) time.setTime(time.getTime() + dayMili * (7 - now.getUTCDay() + 3));
            return getDiscordTimestamp(time);
        }

        function getWeeklyUpdate(){
            let time = new Date();
            time.setUTCFullYear(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            time.setUTCHours(3, 0, 0, 0);
            
            if(now.getUTCDay() < 4 || (now.getUTCDay() === 4 && now.getUTCHours() < 3)) time.setTime(time.getTime() + dayMili * (4 - now.getUTCDay()));
            else if(now.getUTCDay() > 4 || (now.getUTCDay() === 4 && now.getUTCHours() >= 3)) time.setTime(time.getTime() + dayMili * (7 - now.getUTCDay() + 4));
            return getDiscordTimestamp(time);
        }

        function getDiscordTimestamp(time){
            return Math.round(time.getTime() / 1000);
        }

        function showError(e){
            interaction?.reply({embeds: [embed.setDescription(e)], flags: MessageFlags.Ephemeral});
        }

        function validateChapter(c){
            return c === -1 || (c >= 0 && c <= limbus.chapters.length - 1);
        }
    },

    /**
     * @param {AutocompleteInteraction} interaction 
     */
    async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
        let chapterList = [{name: "None", value: -1}, ...limbus.chapters.map((v, i, a) => { return {name : (i === a.length - 1 ? "[LATEST] " : "") + v, value: i}})];
        const filtered = chapterList.filter(b=>b.name.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25);
        
		await interaction.respond(filtered);
	},
};