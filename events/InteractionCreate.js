const { Events, BaseInteraction, MessageFlags, Collection } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,

    /**
     * @param {BaseInteraction} interaction 
     */
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        const { cooldowns } = interaction.client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown ?? process.env.DEFAULT_COOLDOWN);
        
        let deferred = null;
        if(command.isDeferred) deferred = await interaction.deferReply();

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                if(command.isDeferred){
                    interaction.followUp({ content: `You are on a cooldown for \`${command.data.name}\`. You can use it again <t:${Math.round(expirationTime/1000)}:R>.`, flags: MessageFlags.Ephemeral });
                    return deferred.delete();
                }
                else return interaction.reply({ content: `You are on a cooldown for \`${command.data.name}\`. You can use it again <t:${Math.round(expirationTime/1000)}:R>.`, flags: MessageFlags.Ephemeral });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            await command.execute(interaction, deferred);
        } catch (error) {
            console.error(error);
            try {            
                if(command.isDeferred) deferred?.edit({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral }).catch(()=>{});     
                else interaction?.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral }).catch(()=>{});
            } catch (err) {
                console.error(error);
            }
        }
    },
};