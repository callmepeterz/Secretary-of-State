const { Events, BaseInteraction, MessageReferenceType, MessageFlags } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    once: false,

    /**
     * @param {BaseInteraction} interaction 
     */
    async execute(interaction) {
       if(!interaction.isButton()) return;
       if(interaction.customId !== "fx_delete") return;
       let message = interaction.message;
       if(
            !message ||
            message.author.id !== interaction.client.user.id ||
            !message.flags.has(MessageFlags.SuppressNotifications) ||
            !message.reference ||
            message.reference.type !== MessageReferenceType.Default
        ) return;

        let originalMessage;
        try{
            originalMessage = await message.fetchReference();
        } catch (error){
            originalMessage = null;
        }

        if(!originalMessage || interaction.user.id !== originalMessage.author.id) return interaction.deferUpdate();

        message.delete().catch(() => {});
        interaction.deferUpdate();
    }
}
