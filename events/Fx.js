const { Events, Message, MessageFlags, ActionRowBuilder, ComponentType, ButtonStyle } = require('discord.js');
const { fx } = require("../util/fx.js");
const refreshButton = [
    new ActionRowBuilder({
        components: [
            {
                type: ComponentType.Button,
                label: "⟳",
                style: ButtonStyle.Secondary,
                custom_id: "fx_reload",
                disabled: false
            },
            {
                type: ComponentType.Button,
                label: "💀",
                style: ButtonStyle.Danger,
                custom_id: "fx_delete",
                disabled: false
            }
        ]
    })
];

module.exports = {
    name: Events.MessageCreate,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message){
        if(!message.content || message.author.bot) return;
        
        let urlList = fx(message.content);
        if(!urlList) return;

        message.reply({
            content: urlList.slice(0, 2000),
            allowedMentions: {users: [], roles: []},
            flags: [MessageFlags.SuppressNotifications],
            components: refreshButton
        })
        .then(() => message?.suppressEmbeds().catch(() => {}))
        .catch(() => {});
    },
};
