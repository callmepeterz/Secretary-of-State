const { SlashCommandBuilder, SlashCommandStringOption, ChatInputCommandInteraction, InteractionResponse, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
const get = require("../util/httpsGet.js");
const encodeURL = require("../util/encodeURL.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dictionary")
        .setDescription("Defines a word")
        .setNSFW(false)
        .addStringOption(
            new SlashCommandStringOption()
                .setName("word")
                .setDescription("The word to be defined")
                .setRequired(true)
                .setMaxLength(200)
        ),
    index: "Tool",
    isDeferred: true,
    cooldown: 3500,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred) {
        let color = interaction.guild?.members?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let word = interaction.options.getString("word");
        let data = await get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURL(word)}`);
        let json;
        try {
            json = JSON.parse(data?.join(""));
        } catch (error) {
            return deferred.edit({ embeds: [announceEmbed("Encountered an error! Please try again.", color)], flags: MessageFlags.Ephemeral });
        }
        if (!json[0]) return deferred.edit({ embeds: [announceEmbed(`No definitions found for "${word.slice(0, 1000)}"!`, color)], flags: MessageFlags.Ephemeral });
        let embeds = makeEmbeds(json, color);
        deferred.edit({
            embeds: [embeds[0]],
            components: getActionRow(0, embeds.length),
            withResponse: true
        })
            .then(m => listDefinitions(m, 0, embeds, interaction.user.id, interaction))
            .catch(() => { });

    }
};

function announceEmbed(t, c) {
    return new EmbedBuilder().setColor(c).setDescription(t);
}

function phoneticsText(a) {
    let t = "";
    a.forEach(v => {
        let s = v.text ? v.audio ? `[${v.text}](${v.audio})\n` : `${v.text}\n` : "";
        if (s.length + t.length <= 2000) t += s;
    });
    return t;
}

function arrStr(a) {
    return a?.join(", ");
}

function definitionFields(a) {
    let fields = [];
    a.forEach(v => {
        let f = {
            name: "",
            value: "",
            inline: false
        };
        f.name = v.partOfSpeech?.slice(0, 250) || "\u200b";
        v.definitions.forEach(v => {
            let sy = arrStr(v.synonyms?.slice(0, 5));
            let an = arrStr(v.antonyms?.slice(0, 5));
            let t = `**• ${v.definition}**\n${v.example ? `> *${v.example}*\n` : ""}${sy ? `__Synonyms__: ${sy}\n` : ""}${an ? `__Antonyms__: ${an}\n` : ""}\n`;
            if (f.value.length + t.length <= 1020) f.value += t;
        });
        if (fields.length < 25) fields.push(f);
    });
    return fields;
}

function makeEmbeds(a, c) {
    let embeds = [];
    a.forEach((v, i, a) => {
        let embed = new EmbedBuilder()
            .setColor(c)
            .setTitle(v.word.slice(0, 250))
            .addFields(...definitionFields(v.meanings))
            .setFooter({ text: `Page ${i + 1} of ${a.length}` });
        let pText = phoneticsText(v.phonetics);
        if (pText) embed.setDescription(pText);
        embeds.push(embed);
    });
    return embeds;
}

async function listDefinitions(message, i, embeds, a, interaction) {
    if (embeds.length === 1) return;
    let filter = res => res.user.id === a;
    message.awaitMessageComponent({
        filter,
        time: 30000
    })
        .then(collected => {
            let options = {
                a: 0,
                b: i - 1,
                c: i + 1,
                d: embeds.length - 1
            }
            let index = options[collected.customId];
            collected.update({
                embeds: [embeds[index]],
                components: getActionRow(index, embeds.length),
                withResponse: true
            })
                .then(() => listDefinitions(message, index, embeds, a, interaction));
        })
        .catch(() => interaction.editReply({
            components: getActionRow(0, 1)
        }));
}

function getActionRow(i, n) {
    let components = [
        {
            type: ComponentType.Button,
            label: "<<",
            style: ButtonStyle.Secondary,
            custom_id: "a",
            disabled: i === 0
        },
        {
            type: ComponentType.Button,
            label: "←",
            style: ButtonStyle.Primary,
            custom_id: "b",
            disabled: i === 0
        },
        {
            type: ComponentType.Button,
            label: "→",
            style: ButtonStyle.Primary,
            custom_id: "c",
            disabled: i === n - 1
        },
        {
            type: ComponentType.Button,
            label: ">>",
            style: ButtonStyle.Secondary,
            custom_id: "d",
            disabled: i === n - 1
        }
    ];
    return n > 1 ? [new ActionRowBuilder({ components })] : [];
}