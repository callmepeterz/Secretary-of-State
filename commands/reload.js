const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const fs = require("node:fs");
const path = require("node:path");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads cache")
    .setNSFW(false)
    .setContexts(InteractionContextType.BotDM)
    .addStringOption(
        new SlashCommandStringOption()
        .setName("component")
        .setDescription("The component to reload")
        .setRequired(true)
        .setChoices(
            {name: "Commands", value: "commands"},
            {name: "Event listener callbacks", value: "events"},
            {name: "User data", value: "userdata"},
            {name: "Document data", value: "documentdata"},
            {name: "AI system instruction", value: "systeminstruction"},
            {name: "Limbus Company data", value: "limbus"},
            {name: "Fx data", value: "fx"},
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
        let color = interaction.guild?.members?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let embed = new EmbedBuilder().setColor(color);
        if(interaction.user.id !== process.env.OWNER_ID) return interaction.reply({embeds: [embed.setDescription("Unauthorized!")], flags: MessageFlags.Ephemeral});

        switch(interaction.options.getString("component")){
            case "commands":
                const commandFiles = fs.readdirSync(commandsPath).filter(file=>file.endsWith(".js"));

                for (const file of commandFiles) {
                    reloadCommand(file);
                }
                console.log(`Reloaded ${commandFiles.length} command(s).`);
                interaction.reply({embeds: [embed.setDescription(`Reloaded ${commandFiles.length} command(s).`)]});
                break;

            case "events":
                const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

                interaction.client.removeAllListeners();
                for (const file of eventFiles) {
                    reloadEvent(file);
                }
                console.log(`Reloaded ${eventFiles.length} event(s).`);
                interaction.reply({embeds: [embed.setDescription(`Reloaded ${eventFiles.length} event(s).`)]});
                break;

            case "userdata":
                const userDataPath = path.join(process.cwd(), 'data/users');
                const userDataFiles = fs.readdirSync(userDataPath).filter(file=>file.endsWith(".json"));

                for (const file of userDataFiles) {
                    const filePath = path.join(userDataPath, file);
                    delete require.cache[require.resolve(filePath)];
                    const user = require(filePath);
                    interaction.client.userData[user.id] = user;
                }
                console.log("Reloaded user data cache.");
                interaction.reply({embeds: [embed.setDescription(`Reloaded user data cache.`)]});
                break;

            case "documentdata":
                const docDataPath = path.join(process.cwd(), 'data/documents.json');
                delete require.cache[require.resolve(docDataPath)];
                const docData = require(docDataPath);
                interaction.client.documents = docData;
                
                console.log("Reloaded document data cache.");
                interaction.reply({embeds: [embed.setDescription(`Reloaded document data cache.`)]});
                break;

            case "systeminstruction":
                const systemInstructionPath = path.join(process.cwd(), "assets/systemPrompt.txt");
                interaction.client.aiContext.systemInstruction = fs.readFileSync(systemInstructionPath, "utf-8").toString();
                console.log("Reloaded system instruction.");
                interaction.reply({embeds: [embed.setDescription(`Reloaded system instruction.`)]});
                break;
            case "limbus":
                const limbusDataPath = path.join(process.cwd(), 'assets/limbus.json');
                delete require.cache[require.resolve(limbusDataPath)];

                reloadCommand("limbus.js");
                
                console.log("Reloaded Limbus Company data cache.");
                interaction.reply({embeds: [embed.setDescription(`Reloaded Limbus Company data cache.`)]});
                break;

            case "fx":
                const fxDataPath = path.join(process.cwd(), 'assets/fxList.js');
                delete require.cache[require.resolve(fxDataPath)];

                reloadCommand("fx.js");
                reloadEvent("Fx.js");
                reloadEvent("FxMessageDelete.js");
                
                console.log("Reloaded Fx data cache.");
                interaction.reply({embeds: [embed.setDescription(`Reloaded Limbus Company data cache.`)]});
                break;
        }

        function reloadCommand(file){
            const commandsPath = path.join(process.cwd(), 'commands');
            const filePath = path.join(commandsPath, file);
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                interaction.client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

        function reloadEvent(file){
            const eventsPath = path.join(process.cwd(), 'events');
            const filePath = path.join(eventsPath, file);
            delete require.cache[require.resolve(filePath)];
            const event = require(filePath);
            if (event.once) {
                interaction.client.once(event.name, (...args) => event.execute(...args));
            }
            else {
                interaction.client.on(event.name, (...args) => event.execute(...args));
            }
        }
    },
};