const { Events, BaseInteraction, MessageFlags, Collection } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,

    /**
     * @param {BaseInteraction} interaction 
     */
    async execute(interaction) {
        if (!interaction.isAutocomplete()) return;

        const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
		}
    },
};