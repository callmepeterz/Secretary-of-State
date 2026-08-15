const { SlashCommandBuilder, AutocompleteInteraction, SlashCommandSubcommandBuilder, SlashCommandStringOption, SlashCommandBooleanOption, SlashCommandNumberOption, SlashCommandUserOption, ChatInputCommandInteraction, AttachmentBuilder, ActionRowBuilder, ButtonStyle, ComponentType, InteractionResponse, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require("node:fs");
const path = require("node:path");
const documentStatusString = ["🟡 Pending", "✅ Valid", "🔴 DENIED", "🔴 REVOKED", "🔴 EXPIRED", "⭕ SUSPENDED"];
const documentStatusExpString = ["Submission", "Expiry", "Rejection", "Revocation", "Expiry"];
module.exports = {
    data: new SlashCommandBuilder()
    .setName("documents")
    .setDescription("View and apply for state documents")
    .setNSFW(false)
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("View your documents privately")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("type")
            .setDescription("Type of document")
            .setRequired(false)
            .addChoices(
                {name: "BK - Northern Humor License", value: "1"}
            )
        )
        .addBooleanOption(
            new SlashCommandBooleanOption()
            .setName("all")
            .setDescription("Includes expired, denied, and revoked documents")
            .setRequired(false)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("present")
        .setDescription("Present your valid documents publicly")
         .addStringOption(
            new SlashCommandStringOption()
            .setName("type")
            .setDescription("Type of document")
            .setRequired(true)
            .addChoices(
                {name: "BK - Northern Humor License", value: "1"}
            )
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("lookup")
        .setDescription("Look up details of document by number")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("number")
            .setDescription("Document number, for example: BK25-0001")
            .setRequired(true)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("check")
        .setDescription("Check a user's valid document")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("type")
            .setDescription("Type of document")
            .setRequired(true)
            .addChoices(
                {name: "BK - Northern Humor License", value: "1"}
            )
        )
        .addUserOption(
            new SlashCommandUserOption()
            .setName("bearer")
            .setDescription("Bearer of document")
            .setRequired(true)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("apply")
        .setDescription("Apply for documents")
         .addStringOption(
            new SlashCommandStringOption()
            .setName("type")
            .setDescription("Type of document")
            .setRequired(true)
            .addChoices(
                {name: "BK - Northern Humor License", value: "1"}
            )
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("listapplication")
        .setDescription("[ADMIN] List pending applications")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("type")
            .setDescription("Type of document")
            .setRequired(true)
            .addChoices(
                {name: "BK - Northern Humor License", value: "1"}
            )
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("listall")
        .setDescription("[ADMIN] List all users' documents")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("type")
            .setDescription("Type of document")
            .setRequired(false)
            .addChoices(
                {name: "BK - Northern Humor License", value: "1"}
            )
        )
        .addUserOption(
            new SlashCommandUserOption()
            .setName("bearer")
            .setDescription("Bearer of document")
            .setRequired(false)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("confirm")
        .setDescription("[ADMIN] Confirm an application and issue a document")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("number")
            .setDescription("Document number, for example: BK25-0001")
            .setRequired(true)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("cancel")
        .setDescription("[ADMIN] Reject an application or revoke a document")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("number")
            .setDescription("Document number, for example: BK25-0001")
            .setRequired(true)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("suspend")
        .setDescription("[ADMIN] Temporarily suspend a valid document")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("number")
            .setDescription("Document number, for example: BK25-0001")
            .setRequired(true)
        )
        .addBooleanOption(
            new SlashCommandBooleanOption()
            .setName("indefinitely")
            .setDescription("Suspend the document until reinstated.")
            .setRequired(true)
        )
        .addNumberOption(
            new SlashCommandNumberOption()
            .setName("day")
            .setDescription("How many days to suspend the document for")
            .setRequired(false)
            .setMinValue(0)
        )
        .addNumberOption(
            new SlashCommandNumberOption()
            .setName("hour")
            .setDescription("How many hours to suspend the document for")
            .setRequired(false)
            .setMinValue(0)
        )
        .addNumberOption(
            new SlashCommandNumberOption()
            .setName("minute")
            .setDescription("How many minutes to suspend the document for")
            .setRequired(false)
            .setMinValue(0)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("reinstate")
        .setDescription("[ADMIN] Reinstate a suspended document")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("number")
            .setDescription("Document number, for example: BK25-0001")
            .setRequired(true)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("renew")
        .setDescription("[ADMIN] Renew an expired document")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("number")
            .setDescription("Document number, for example: BK25-0001")
            .setRequired(true)
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
        let text = "";

        let documentData = interaction.client.documents;
        if(!documentData) return interaction.reply("No document data!");

        let dtype = interaction.options.getString("type");
        let dnum = interaction.options.getString("number");
        let dbearer = interaction.options.getUser("bearer");
        let all = interaction.options.getBoolean("all") ?? false;

        let dindef = interaction.options.getBoolean("indefinitely");
        let dday = interaction.options.getNumber("day") ?? 0;
        let dhour = interaction.options.getNumber("hour") ?? 0;
        let dminute = interaction.options.getNumber("minute") ?? 0;


        let resdoc, resdoctype, confirmres, collected;

        switch(interaction.options.getSubcommand()){
            case "view":
                if(dtype){
                    if(all){
                        resdoc = filterByType(filterByUser(documentData.records, interaction.user.id), dtype);
                        return listDocuments(resdoc);
                    }
                    else {
                        resdoc = filterValidAndPending(filterByType(filterByUser(documentData.records, interaction.user.id), dtype));
                        if(!resdoc.length) return interaction?.reply({embeds: [embed.setDescription("No valid document found!")], flags: MessageFlags.Ephemeral});
                        return displayDocument(resdoc);
                    }
                }
                else {
                    resdoc = filterByUser(documentData.records, interaction.user.id);
                    return listDocuments(resdoc);
                }
                break;

            case "present":
                resdoc = filterValidOnly(filterByType(filterByUser(documentData.records, interaction.user.id), dtype));
                if(!resdoc.length) return interaction?.reply({embeds: [embed.setDescription("No valid document found!")]});
                return displayDocument(resdoc, false);
                break;

            case "lookup":
                resdoc = findByNumber(dnum);
                resdoctype = getTypeInfo(resdoc);
                if(!resdoc || (resdoc && !resdoctype?.isPublic && resdoc?.bearerId !== interaction.user.id && !documentData.admins[interaction.user.id]?.includes(resdoc?.type))) return interaction?.reply({embeds: [embed.setDescription("No document found or document is not publicly accessible!")], flags: [MessageFlags.Ephemeral]});
                return displayDocument([resdoc]);
                break;

            case "check":
                resdoctype = getTypeInfo({type: dtype});
                if(!resdoctype?.isPublic && !documentData.admins[interaction.user.id]?.includes(resdoctype.id)) return interaction?.reply({embeds: [embed.setDescription("Document is not publicly accessible!")], flags: [MessageFlags.Ephemeral]});
                resdoc = filterValidOnly(filterByType(filterByUser(documentData.records, dbearer.id), dtype));
                if(!resdoc.length) return interaction?.reply({embeds: [embed.setDescription("No valid document found!")]});
                return displayDocument(resdoc, false);

            case "apply":
                resdoc = filterByType(filterByUser(documentData.records, interaction.user.id), dtype);
                resdoctype = getTypeInfo({type: dtype});
                if(!resdoctype.canHoldMultiple && filterValidOnly(resdoc).length)  return interaction?.reply({embeds: [embed.setDescription("You already hold a valid document!")], flags: [MessageFlags.Ephemeral]});
                if(!resdoctype.canHoldMultiple && resdoc.filter(d => d.status === 0).length) return interaction?.reply({embeds: [embed.setDescription("You already have a pending application! Wait or contact the relevant issuer for further processing.")], flags: [MessageFlags.Ephemeral]});
                
                confirmres = await interaction.reply({content: `${resdoctype.hasToC ? "Read and agree to the terms and conditions, and s" : "S"}ubmit an application for ${resdoctype.en}?`, components: getConfirmActionRow("I agree"), files: resdoctype.hasToC ? [new AttachmentBuilder().setFile(`./data/documenttoc/${dtype}.pdf`).setName(`${resdoctype.symbol}-Terms_and_Conditions.pdf`)] : [], flags: [MessageFlags.Ephemeral]})//displayDocument({}, true, "Approve the following application?", getConfirmActionRow());
                collected = await confirmres.awaitMessageComponent({filter: r => r.user.id === interaction.user.id, time: 30000})
                .catch(() => {});
               
                if(collected?.customId !== "y") return confirmres?.edit({content: "Action cancelled.", embeds: [], components: [], files: []});
                
                let application = {
                    type: dtype,
                    number: getNextDocNumber(dtype),
                    status: 0,
                    bearerId: interaction.user.id,
                    requestDate: Date.now(),
                    issuedDate: null,
                    issuedBy: null,
                    expiryDate: null,
                    revokedBy: null,
                    suspendedUntil: 0,
                    suspendedBy: null,
                    extendedBy: null,
                    extendedDate: null,
                    extensions: 0
                }

                documentData.records.push(application);
                confirmres.edit({content: "Successfully submitted the following application, please notify the relevant issuer for further processing:", embeds: [documentEmbed(application)], components: []});
                interaction.user.send({content: "Successfully submitted the following application, please notify the relevant issuer for further processing:", embeds: [documentEmbed(application)], files: resdoctype.hasToC ? [new AttachmentBuilder().setFile(`./data/documenttoc/${dtype}.pdf`).setName(`${resdoctype.symbol}-Terms_and_Conditions.pdf`)] : []}).catch(() => {});

                break;
            
            case "listapplication":
                resdoc = filterPending(filterByType(filterByTypes(documentData.records, documentData.admins[interaction.user.id]), dtype));
                return listDocuments(resdoc);
                break;

            case "listall":
                resdoc = filterByTypes(documentData.records, documentData.admins[interaction.user.id]);
                if(dtype) resdoc = filterByType(resdoc, dtype);
                if(dbearer) resdoc = filterByUser(resdoc, dbearer?.id);
                return listDocuments(resdoc);
                break;

            case "confirm":
                resdoc = findByNumber(dnum);
                if(!resdoc) return interaction?.reply({embeds: [embed.setDescription("No pending application found!")], flags: [MessageFlags.Ephemeral]});
                resdoctype = getTypeInfo(resdoc);
                if(!documentData.admins[interaction.user.id]?.includes(resdoc.type)) return interaction?.reply({embeds: [embed.setDescription("Insufficient permission!")], flags: [MessageFlags.Ephemeral]});
                if(resdoc.status !== 0) return interaction?.reply({embeds: [embed.setDescription("This document is not a pending application!")], flags: [MessageFlags.Ephemeral]});
                if(!resdoctype.canHoldMultiple && filterValidOnly(filterByType(filterByUser(documentData.records, resdoc.bearerId), resdoc.type)).length) return interaction?.reply({embeds: [embed.setDescription("There is already a valid document!")], flags: [MessageFlags.Ephemeral]});

                confirmres = await displayDocument([resdoc], true, "Approve the following application?", getConfirmActionRow("Approve"));
                collected = await confirmres.awaitMessageComponent({filter: r => r.user.id === interaction.user.id, time: 30000})
                .catch(() => {});
               
                if(collected?.customId !== "y") return confirmres?.edit({content: "Action cancelled.", embeds: [], components: []});

                resdoc.status = 1;
                resdoc.issuedDate = Date.now();
                resdoc.issuedBy = interaction.user.id;
                resdoc.expiryDate = resdoc.issuedDate + resdoctype.duration;

                confirmres.edit({content: "Successfully issued the following document:", embeds: [documentEmbed(resdoc)], components: []});
            
                
                break;

            case "cancel":
                resdoc = findByNumber(dnum);
                if(!resdoc) return interaction?.reply({embeds: [embed.setDescription("No pending application or document found!")], flags: [MessageFlags.Ephemeral]});
                if(!documentData.admins[interaction.user.id]?.includes(resdoc.type)) return interaction?.reply({embeds: [embed.setDescription("Insufficient permission!")], flags: [MessageFlags.Ephemeral]});
                if(resdoc.status !== 0 && !isValidAndNotExpired(resdoc)) return interaction?.reply({embeds: [embed.setDescription("This document is not a pending application or a valid application!")], flags: [MessageFlags.Ephemeral]});
                
                confirmres = await displayDocument([resdoc], true, "Deny/Revoke the following document?", getRevokeActionRow("Revoke"));
                collected = await confirmres.awaitMessageComponent({filter: r => r.user.id === interaction.user.id, time: 30000})
                .catch(() => {});

                if(collected?.customId !== "y") return confirmres?.edit({content: "Action cancelled.", embeds: [], components: []});

                resdoctype = getTypeInfo(resdoc);
                resdoc.status = resdoc.status === 0 ? 2 : 3;
                resdoc.expiryDate = Date.now();
                resdoc.revokedBy = interaction.user.id;

                confirmres.edit({content: "Successfully denied/revoked the following document:", embeds: [documentEmbed(resdoc)], components: []});
            
                break;

            case "suspend":
                resdoc = findByNumber(dnum);
                if(!resdoc) return interaction?.reply({embeds: [embed.setDescription("No document found!")], flags: [MessageFlags.Ephemeral]});
                resdoctype = getTypeInfo(resdoc);
                if(!documentData.admins[interaction.user.id]?.includes(resdoc.type)) return interaction?.reply({embeds: [embed.setDescription("Insufficient permission!")], flags: [MessageFlags.Ephemeral]});
                if(!resdoctype.canBeSuspended) return interaction?.reply({embeds: [embed.setDescription("This type of document cannot be suspended!")], flags: [MessageFlags.Ephemeral]});
                if(!isValidAndNotExpired(resdoc)) return interaction?.reply({embeds: [embed.setDescription("This document is not a valid document!")], flags: [MessageFlags.Ephemeral]});
                if(!dindef && !dday && !dhour && !dminute) return interaction?.reply({embeds: [embed.setDescription("Duration of suspension not specified!")], flags: [MessageFlags.Ephemeral]});

                
                confirmres = await displayDocument([resdoc], true, `Suspend the following document ${dindef ? "until reinstated" : `for ${dday} ${pluralString(dday, "day", "days")} ${dhour} ${pluralString(dhour, "hour", "hours")} ${dminute} ${pluralString(dminute, "minute", "minutes")}`}?`, getRevokeActionRow("Suspend"));
                collected = await confirmres.awaitMessageComponent({filter: r => r.user.id === interaction.user.id, time: 30000})
                .catch(() => {});

                if(collected?.customId !== "y") return confirmres?.edit({content: "Action cancelled.", embeds: [], components: []});

                resdoc.suspendedUntil = dindef ? -1 : Date.now() + (dday*86400000) + (dhour*3600000) + (dminute*60000);
                resdoc.suspendedBy = interaction.user.id;

                confirmres.edit({content: "Successfully suspended the following document:", embeds: [documentEmbed(resdoc)], components: []});
            
                break;

            case "reinstate":
                resdoc = findByNumber(dnum);
                if(!resdoc) return interaction?.reply({embeds: [embed.setDescription("No document found!")], flags: [MessageFlags.Ephemeral]});
                resdoctype = getTypeInfo(resdoc);
                if(!documentData.admins[interaction.user.id]?.includes(resdoc.type)) return interaction?.reply({embeds: [embed.setDescription("Insufficient permission!")], flags: [MessageFlags.Ephemeral]});
                if(!resdoctype.canBeSuspended) return interaction?.reply({embeds: [embed.setDescription("This type of document cannot be reinstated!")], flags: [MessageFlags.Ephemeral]});
                if(!isValidAndSuspended(resdoc)) return interaction?.reply({embeds: [embed.setDescription("This document is not a valid suspended document!")], flags: [MessageFlags.Ephemeral]});
                
                confirmres = await displayDocument([resdoc], true, `Reinstate the following document?`, getConfirmActionRow("Reinstate"));
                collected = await confirmres.awaitMessageComponent({filter: r => r.user.id === interaction.user.id, time: 30000})
                .catch(() => {});

                if(collected?.customId !== "y") return confirmres?.edit({content: "Action cancelled.", embeds: [], components: []});

                resdoc.suspendedUntil = 0;

                confirmres.edit({content: "Successfully reinstated the following document:", embeds: [documentEmbed(resdoc)], components: []});
            
                break;

            case "renew":
                resdoc = findByNumber(dnum);
                if(!resdoc) return interaction?.reply({embeds: [embed.setDescription("No valid document found!")], flags: [MessageFlags.Ephemeral]});
                if(!documentData.admins[interaction.user.id]?.includes(resdoc.type)) return interaction?.reply({embeds: [embed.setDescription("Insufficient permission!")], flags: [MessageFlags.Ephemeral]});
                resdoctype = getTypeInfo(resdoc);
                if(!resdoctype.extendDuration) return interaction?.reply({embeds: [embed.setDescription("This type of document cannot be extended!")], flags: [MessageFlags.Ephemeral]});
                if(!isValid(resdoc)) return interaction?.reply({embeds: [embed.setDescription("This document is not a valid document!")], flags: [MessageFlags.Ephemeral]});
                if(!resdoctype.canHoldMultiple && filterExcludeDoc(filterValidAndPending(filterByType(filterByUser(documentData.records, resdoc.bearerId), resdoc.type)), resdoc).length) return interaction?.reply({embeds: [embed.setDescription("There is already a pending application or a valid document!")], flags: [MessageFlags.Ephemeral]});

                confirmres = await displayDocument([resdoc], true, "Renew the following document?", getConfirmActionRow("Renew"));
                collected = await confirmres.awaitMessageComponent({filter: r => r.user.id === interaction.user.id, time: 30000})
                .catch(() => {});

                if(collected?.customId !== "y") return confirmres?.edit({content: "Action cancelled.", embeds: [], components: []});

                resdoctype = getTypeInfo(resdoc);
                resdoc.expiryDate += resdoctype.extendDuration;
                resdoc.extendedBy = interaction.user.id;
                resdoc.extendedDate = Date.now();
                resdoc.extensions++;

                confirmres.edit({content: "Successfully renewed the following document:", embeds: [documentEmbed(resdoc)], components: []});
                
                break;
        }

        let documentDataPath = path.join(process.cwd(), `data/documents.json`);
        fs.writeFileSync(documentDataPath, JSON.stringify(documentData, null, "\t"));

        function filterByUser(documentList, userId){
            return documentList.filter(d => d.bearerId === userId);
        }
        function filterByType(documentList, type){
            return documentList.filter(d => d.type === type);
        }
        function filterByTypes(documentList, types){
            if(!types || !documentList) return [];
            return documentList.filter(d => types.includes(d.type));
        }
        function filterExcludeDoc(documentList, doc){
            return documentList.filter(d => getDocumentNumber(d) !== getDocumentNumber(doc));
        }
        function filterValidOnly(documentList){
            return documentList.filter(d => isValidAndNotExpired(d));
        }
        function filterValidAndPending(documentList){
            return documentList.filter(d => d.status === 0 || isValidAndNotExpired(d));
        }
         function filterPending(documentList){
            return documentList.filter(d => d.status === 0);
        }
        function isExpired(document){
            if(Date.now() > document.expiryDate) return true;
            return false;
        }
        function isSuspended(document){
            if(document.suspendedUntil === -1 || Date.now() < document.suspendedUntil) return true;
            return false;
        }
        function isValid(document){
            return document.status === 1;
        }
        function isValidAndNotExpired(document){
            return isValid(document) && !isExpired(document);
        }
        function isValidAndExpired(document){
            return isValid(document) && isExpired(document);
        }
        function isValidAndSuspended(document){
            return isValid(document) && isSuspended(document);
        }
        function getDocumentNumber(document){
            return `${getTypeInfo(document).symbol}${document.status === 0 || document.status === 2 ? "AP" : new Date(document.issuedDate).getFullYear().toString().slice(-2)}-${document.number.toString().padStart(4, "0")}`;
        }
        function getNextDocNumber(doctype){
            let hnum = 0;
            documentData.records.forEach(d => {
                if(d.type !== doctype) return;
                if(d.number > hnum) hnum = d.number;
            });
            return hnum + 1;
        }
        function getTypeInfo(document){
            if(!document) return null;
            return documentData.types[document.type];
        }
        function getSmallDateString(timestamp){
            return `<t:${Math.round(timestamp/1000)}:d>`
        }
        function getFullDateString(timestamp){
            return `<t:${Math.round(timestamp/1000)}:f>`
        }
        function pluralString(n, singular, plural) {
            return n === 1 ? singular : plural;
        }
        function findByNumber(docnum){
            return documentData.records.find(d => getDocumentNumber(d) === docnum);
        }
        function listDocuments(documentList, isEphermal = true){
            if(!documentList.length) return interaction.reply({embeds: [embed.setDescription("No results found!")], flags: isEphermal ? [MessageFlags.Ephemeral] : []});
            let listString = "";
            sortDocuments(documentList).forEach(d=>{
                if(listString.length >= 4000) return;
                if(isValidAndNotExpired(d) && !isSuspended(d)) return listString += `✅ \`${getDocumentNumber(d)}\` Bearer: <@${d.bearerId}> Issued: ${getSmallDateString(d.issuedDate)} Expires: ${getSmallDateString(d.expiryDate)}\n`;
                else if(isValidAndNotExpired(d) && isSuspended(d)) return listString += `⭕ \`${getDocumentNumber(d)}\` Bearer: <@${d.bearerId}> **SUSPENDED** ${d.suspendedUntil === -1 ? "indefinitely" : `until: ${getSmallDateString(d.suspendedUntil)}`} Expires: ${getSmallDateString(d.expiryDate)}\n`;
                else if(d.status === 0) return listString += `🟡 \`${getDocumentNumber(d)}\` Bearer: <@${d.bearerId}> Submitted: ${getSmallDateString(d.requestDate)}\n`;
                else if(isValidAndExpired(d)) listString += `🔴 \`${getDocumentNumber(d)}\` Bearer: <@${d.bearerId}> **EXPIRED**: ${getSmallDateString(d.expiryDate)}\n`;
                else if(d.status === 2) listString += `🔴 \`${getDocumentNumber(d)}\` Bearer: <@${d.bearerId}> **DENIED**: ${getSmallDateString(d.expiryDate)}\n`;
                else if(d.status === 3) listString += `🔴 \`${getDocumentNumber(d)}\` Bearer: <@${d.bearerId}> **REVOKED**: ${getSmallDateString(d.expiryDate)}\n`;
            })
            embed.setTitle(`Found ${documentList.length} ${pluralString(documentList.length, "result", "results")}`);
            embed.setDescription(listString);
            interaction.reply({embeds: [embed], flags: isEphermal ? [MessageFlags.Ephemeral] : []});
        }
        function sortDocuments(documentList){
            return documentList.sort((a, b)=>{
                if(isValidAndNotExpired(a) && !isValidAndNotExpired(b)) return -1;
                else if(!isValidAndNotExpired(a) && isValidAndNotExpired(b)) return 1;
                else if(a.status === 0 && b.status !== 0) return -1;
                else if(b.status === 0 && a.status !== 0) return 1;
                else if(a.status === 0 && b.status === 0) return a.requestDate > b.requestDate ? -1 : 1;
                else return a.issuedDate > b.issuedDate ? -1 : 1;
            });
        }
        function getConfirmActionRow(text){
            let components = [
                {
                    type: ComponentType.Button,
                    label: "Cancel",
                    style: ButtonStyle.Secondary,
                    custom_id: "n",
                    disabled: false
                },
                {
                    type: ComponentType.Button,
                    label: text,
                    style: ButtonStyle.Success,
                    custom_id: "y",
                    disabled: false
                }
            ];
            return [new ActionRowBuilder( { components })];
        }
        function getRevokeActionRow(text){
            let components = [
                {
                    type: ComponentType.Button,
                    label: "Cancel",
                    style: ButtonStyle.Secondary,
                    custom_id: "n",
                    disabled: false
                },
                {
                    type: ComponentType.Button,
                    label: text,
                    style: ButtonStyle.Danger,
                    custom_id: "y",
                    disabled: false
                }
            ];
            return [new ActionRowBuilder( { components })];
        }
        function documentEmbed(document){
            let docembed = new EmbedBuilder().setColor(color);
            let doctype = getTypeInfo(document);
            let fields = [
                {name: "Bearer", value: `<@${document.bearerId}>`, inline: true},
                {name: "Status", value: `**${isValidAndExpired(document) ? documentStatusString[4] : isValidAndNotExpired(document) && isSuspended(document) ? documentStatusString[5] : documentStatusString[document.status]}**`, inline: true},
                {name: `${isValidAndExpired(document) ? documentStatusExpString[4] : documentStatusExpString[document.status]} date`, value: `${getFullDateString(document.status === 0 ? document.requestDate : document.expiryDate)}`, inline: true}
            ];

            if(document.status !== 0 && document.status !== 2){
                fields.push({name: "Issued by", value: `<@${document.issuedBy}>`, inline: true})
                fields.push({name: "Issuing date", value: getFullDateString(document.issuedDate), inline: true})
            }

            if(document.status === 2 || document.status === 3){
                fields.push({name: `${document.status === 2 ? "Denied" : "Revoked"} by`, value: `<@${document.revokedBy}>`, inline: true});
            }

            if(document.extensions > 0){
                fields.push({name: "Renewals issued", value: document.extensions.toString(), inline: true});
                fields.push({name: "Last renewed date", value: getFullDateString(document.extendedDate), inline: true});
                fields.push({name: "Last renewed by", value: `<@${document.extendedBy}>`, inline: true})
            }

            if(isSuspended(document)){
                fields.push({name: "Suspended until", value: document.suspendedUntil === -1 ? "Indefinitely, until reinstated" : getFullDateString(document.suspendedUntil), inline: true});
                fields.push({name: "Suspended by", value: `<@${document.suspendedBy}>`, inline: true})
            }

            docembed
            .setTitle(doctype.en.slice(0, 256))
            .setDescription(`${doctype.vi ? `*(${doctype.vi})*\n\n` : ""}**Document number:** \`${getDocumentNumber(document)}\`\n\n${doctype.description ?? ""}`.slice(0, 256) || null)
            .addFields(...fields)
            .setFooter({text: "Retrieved"})
            .setTimestamp(Date.now());

            return docembed;
        }
        function displayDocument(document, isEphermal = true, msg = undefined, components = []){
            let embeds = document.map(d => documentEmbed(d)).slice(0, 10);
            return interaction.reply({content: msg, embeds, flags: isEphermal ? [MessageFlags.Ephemeral] : [], components: components});
        }
    },
};