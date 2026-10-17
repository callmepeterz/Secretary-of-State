const { Events, BaseInteraction, MessageReferenceType, MessageFlags } = require("discord.js");
const { fx } = require("../util/fx.js");

module.exports = {
    name: Events.InteractionCreate,
    once: false,

    /**
     * @param {BaseInteraction} interaction 
     */
    async execute(interaction) {
       if(!interaction.isButton()) return;
       if(interaction.customId !== "fx_reload") return;
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

        if(!originalMessage) return interaction.deferUpdate();

        let fxList = fx(originalMessage?.content, true);
        message.edit(fxList?.slice(0, 2000) || null).catch(() => {});
        interaction.deferUpdate();
    }
}
