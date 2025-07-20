const { AutocompleteInteraction, Message, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption, SlashCommandStringOption, SlashCommandBooleanOption, ChatInputCommandInteraction, InteractionResponse, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const { Chess, Move } = require("chess.js");
const get = require("../util/httpsGet.js");
const encode = require("../util/encodeURL.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("chess")
    .setDescription("Play chess against another player or Stockfish.")
    .setNSFW(false)
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("start")
        .setDescription("Start a game of chess")
        .addUserOption(
            new SlashCommandUserOption()
            .setName("player")
            .setDescription("The user you would like to play against, leave blank for Stockfish")
        )
        .addBooleanOption(
            new SlashCommandBooleanOption()
            .setName("white")
            .setDescription("Whether or not to designate yourself as white (meaning you move first), default is true")
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("move")
        .setDescription("Make a move in the ongoing game of chess")
        .addStringOption(
            new SlashCommandStringOption()
            .setName("move")
            .setDescription("The move you would like to make in Standard Algebraic Notation (SAN)")
            .setMaxLength(7)
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("resign")
        .setDescription("Resign from the ongoing game of chess")
    )
    .addSubcommand(
        new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("View the ongoing game of chess")
    ),
    index: "Games",
    isDeferred: false,
    cooldown: 2000,

    /**
     * @param {ChatInputCommandInteraction} interaction 
     * @param {InteractionResponse} deferred
     */
    async execute(interaction, deferred){
        let color = interaction.guild?.me?.displayHexColor || process.env.DEFAULT_COLOR;
        let embed = new EmbedBuilder().setColor(color);

        if(interaction.context !== 0) return interaction.reply({embeds: [embed.setDescription("You can only use `/chess` in a server!")], flags: MessageFlags.Ephemeral});

        let move = interaction.options.getString("move");
        let currentPlayer = interaction.user;
        
        /**@type {{w: {id: string, name: string}, b: {id: string, name: string}, stockfish: boolean, board: Chess, threadId: string}} */
        let chess = interaction.client.games.chess.find((v, k) => k?.split("-")?.includes(currentPlayer.id));

        switch(interaction.options.getSubcommand()){
            case "start":
                if(interaction.channel.type !== 0) return interaction.reply({embeds: [embed.setDescription("You can only use `/chess start` in a guild text channel!")], flags: MessageFlags.Ephemeral});

                let opponent = interaction.options.getUser("player");
                let isWhite = interaction.options.getBoolean("white") ?? true;

                /**@type {Message} */
                let intRes;

                if(chess) return interaction.reply({embeds: [embed.setDescription("You are already in an ongoing game of chess! Finish or resign from the current game before starting a new one.")], flags: MessageFlags.Ephemeral});
                if (currentPlayer.id === opponent?.id || opponent?.bot) return interaction.reply({embeds: [embed.setDescription("Invalid user!")], flags: MessageFlags.Ephemeral});
                if(opponent && interaction.client.games.chess.some((v, k) => k?.split("-")?.includes(opponent?.id))) return interaction.reply({embeds: [embed.setDescription("The invited player is already in an ongoing game of chess!")], flags: MessageFlags.Ephemeral});
                if(opponent){
                    let components = [
                        new ButtonBuilder()
                        .setCustomId("accept")
                        .setLabel("Accept")
                        .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                        .setCustomId("decline")
                        .setLabel("Decline")
                        .setStyle(ButtonStyle.Danger)
                    ]
                    intRes = (await interaction.reply({content: `<@${opponent.id}>`, embeds: [embed.setDescription(`<@${currentPlayer.id}> has invited <@${opponent.id}> to a game of chess. Please accept or decline the invitation below. Invitation expires <t:${Math.round(Date.now()/1000) + 30}:R>`)], components:[new ActionRowBuilder({components})], withResponse: true}))?.resource?.message;
                    let filter = r => r.user.id === opponent.id;
                    let compRes = await intRes.awaitMessageComponent({filter, time: 30000}).catch(()=>{});
                    if(!compRes?.customId) return intRes?.edit({content: "", embeds: [embed.setDescription("Invitation timed out.")], components: []});
                    if(compRes.customId !== "accept") return intRes.edit({content: "", embeds: [embed.setDescription("Invitation declined.")], components: []});
                }

                let date = new Date(Date.now() + (parseFloat(process.env.UTC_OFFSET) * 3600000));
                
                chess = {
                    w: {
                        id: isWhite ? currentPlayer?.id : opponent?.id,
                        name: isWhite ? currentPlayer?.username : opponent?.username
                    },
                    b: {
                        id: isWhite ? opponent?.id : currentPlayer?.id,
                        name: isWhite ? opponent?.username : currentPlayer?.username
                    },
                    stockfish: !(currentPlayer && opponent)
                }
                if(chess.stockfish){
                    if(isWhite) {
                        chess.b.id = "stockfish",
                        chess.b.name = "Stockfish"
                    }
                    else {
                        chess.w.id = "stockfish",
                        chess.w.name = "Stockfish"
                    }
                }
                chess.board = new Chess();
                chess.board.setHeader("Event", "Secretary of State Chess Game");
                chess.board.setHeader("Date", `${date.getUTCFullYear()}.${(date.getUTCMonth() + 1).toString().padStart(2, "0")}.${date.getUTCDate().toString().padStart(2, "0")}`);
                chess.board.setHeader("Time", `${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}:${date.getUTCSeconds().toString().padStart(2, "0")}`);
                chess.board.setHeader("White", chess.w.name);
                chess.board.setHeader("Black", chess.b.name);
                
                if(chess.stockfish && chess.w.id === "stockfish"){
                    let bestmovejson = (await get(`https://stockfish.online/api/s/v2.php?fen=${encode(chess.board.fen())}&depth=12`))?.join("");
                    bestmovejson = JSON.parse(bestmovejson);
                    let bestmove = bestmovejson?.bestmove?.split(" ")?.[1];
                    if(!bestmove) return interaction.reply({embeds: [embed.setDescription("Could not get best move from Stockfish!")], flags: MessageFlags.Ephemeral});
                    try {
                        chess.board.move(bestmove);
                    } catch(err){
                        return interaction.reply({embeds: [embed.setDescription("Received invalid move from Stockfish!")], flags: MessageFlags.Ephemeral});
                    }
                }

                if(opponent) intRes.edit({content: `<@${chess[chess.board.turn()].id}>`, embeds: [chessStateEmbed(chess, embed)], components: []});
                else {intRes = (await interaction.reply({content: chess[chess.board.turn()].id === "stockfish" ? "Stockfish" : `<@${chess[chess.board.turn()].id}>`, embeds: [chessStateEmbed(chess, embed)], withResponse: true}))?.resource?.message};

                let thread = await intRes.startThread({name: `${chess.w.name} v. ${chess.b.name} - ${chess.board.getHeaders()?.Date} ${chess.board.getHeaders()?.Time}`.slice(0, 100), autoArchiveDuration: 1440});
                thread.send(`# ${chess.w.id === "stockfish" ? "Stockfish" : `<@${chess.w.id}>`} v. ${chess.b.id === "stockfish" ? "Stockfish" : `<@${chess.b.id}>`} - ${chess.board.getHeaders()?.Date} ${chess.board.getHeaders()?.Time}`);

                chess.threadId = thread.id;
                chess.board.setHeader("Site", `<#${chess.threadId}>, #${interaction.channel.name} ${interaction.guild.name.slice(0, 3).toUpperCase()}`)

                interaction.client.games.chess.set([chess.w.id, chess.b.id].join("-"), chess);
                break;
            case "move":
                if(!chess) return interaction.reply({embeds: [embed.setDescription("You are not yet in an ongoing game of chess! Start a new game first.")], flags: MessageFlags.Ephemeral});
                if(interaction.channel.id !== chess.threadId) return interaction.reply({embeds: [embed.setDescription(`You are not in the thread of the current game! Go to <#${chess.threadId}>.`)], flags: MessageFlags.Ephemeral});
                if(chess[chess.board.turn()].id !== currentPlayer.id) return interaction.reply({embeds: [embed.setDescription("It is not your turn!")], flags: MessageFlags.Ephemeral});

                try {
                    chess.board.move(move);
                } catch(err){
                    return interaction.reply({embeds: [embed.setDescription("Invalid move!")], flags: MessageFlags.Ephemeral});
                }
                
                if(chess.stockfish && chess[chess.board.turn()].id === "stockfish" && !chess.board.isGameOver()){
                    let bestmovejson = (await get(`https://stockfish.online/api/s/v2.php?fen=${encode(chess.board.fen())}&depth=12`))?.join("");
                    bestmovejson = JSON.parse(bestmovejson);
                    let bestmove = bestmovejson?.bestmove?.split(" ")?.[1];
                    if(!bestmove) return interaction.reply({embeds: [embed.setDescription("Could not get best move from Stockfish!")], flags: MessageFlags.Ephemeral});
                    try {
                        chess.board.move(bestmove);
                    } catch(err){
                        return interaction.reply({embeds: [embed.setDescription("Received invalid move from Stockfish!")], flags: MessageFlags.Ephemeral});
                    }
                }

                if(chess.board.isGameOver()){
                    chess.board.setHeader("Termination", "normal")
                    await interaction.reply({embeds: [chessStateEmbed(chess, embed)], files: [new AttachmentBuilder().setName(`${chess.w.name}_v_${chess.b.name}-${chess.board.getHeaders()?.Date}-${chess.board.getHeaders()?.Time}.pgn`).setFile(Buffer.from(chess.board.pgn()))]});
                    interaction.channel?.setArchived();
                    interaction.client.games.chess.delete([chess.w.id, chess.b.id].join("-"));
                }
                else {
                    interaction.reply({content: `<@${chess[chess.board.turn()].id}>`, embeds: [chessStateEmbed(chess, embed)]});
                    interaction.client.games.chess.set([chess.w.id, chess.b.id].join("-"), chess);
                }
                break;
            case "resign":
                if(!chess) return interaction.reply({embeds: [embed.setDescription("You are not yet in an ongoing game of chess! Start a new game first.")], flags: MessageFlags.Ephemeral});
                if(interaction.channel.id !== chess.threadId) return interaction.reply({embeds: [embed.setDescription(`You are not in the thread of the current game! Go to <#${chess.threadId}>.`)], flags: MessageFlags.Ephemeral});
                chess.board.setHeader("Termination", "abandoned");
                await interaction.reply({embeds: [chessStateEmbed(chess, embed, true, (chess.w.id === currentPlayer.id ? "w" : "b"))], files: [new AttachmentBuilder().setName(`${chess.w.name}_v_${chess.b.name}-${chess.board.getHeaders()?.Date}-${chess.board.getHeaders()?.Time}.pgn`).setFile(Buffer.from(chess.board.pgn()))]});
                interaction.channel?.setArchived();
                interaction.client.games.chess.delete([chess.w.id, chess.b.id].join("-"));
                break;
            case "view":
                if(!chess) return interaction.reply({embeds: [embed.setDescription("You are not yet in an ongoing game of chess! Start a new game first.")], flags: MessageFlags.Ephemeral});
                if(interaction.channel.id !== chess.threadId) return interaction.reply({embeds: [embed.setDescription(`You are not in the thread of the current game! Go to <#${chess.threadId}>.`)], flags: MessageFlags.Ephemeral});
                interaction.reply({embeds: [chessStateEmbed(chess, embed)]});
                break;
        }
    },

    /**
     * @param {AutocompleteInteraction} interaction 
     */
    async autocomplete(interaction) {
        let chess = interaction.client.games.chess.find((v, k) => k?.split("-")?.includes(interaction.user.id));
        if(!chess || chess?.[chess?.board?.turn()]?.id !== interaction.user.id || interaction.channel.id !== chess.threadId) return await interaction.respond([]);
		
        const focusedValue = interaction.options.getFocused();
        const moveList = chess.board.moves({ verbose: true }).map(m => { return {name: getMoveString(m), value: m.san} });
        const filtered = moveList.filter(m=>m.name.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25);
        
		await interaction.respond(filtered);
	},
};

const chessPieces = {
    w: {
        k: "♔",
        q: "♕",
        r: "♖",
        b: "♗",
        n: "♘",
        p: "♙"
    },
    b: {
        k: "♚",
        q: "♛",
        r: "♜",
        b: "♝",
        n: "♞",
        p: "♟"
    }
}

const pieceNames = {
    k: "King",
    q: "Queen",
    r: "Rook",
    b: "Bishop",
    n: "Knight",
    p: "Pawn"
}

/**
 * 
 * @param {Move} move 
 * @returns string
 */
function getMoveString(move){
    if(!move) return "";
    if(move.isKingsideCastle()) return `O-O: Kingside castle`;
    if(move.isQueensideCastle()) return `O-O-O: Queenside castle`;
    return `${move.san}: ${chessPieces[move.color][move.piece]} ${pieceNames[move.piece]} ${move.from} → ${move.to}${move.isCapture() || move.isEnPassant() ? `; capturing ${chessPieces[move.color==="w" ? "b" : "w"][move.captured]} ${pieceNames[move.captured]}${move.isEnPassant() ? " (en passant)" : ""}` : ""}${move.isPromotion() ? `; promoted to ${chessPieces[move.color][move.promotion]} ${pieceNames[move.promotion]}` : ""}`;
}

/**
 * 
 * @param {{w: {id: string, name: string}, b: {id: string, name: string}, stockfish: boolean, board: Chess, threadId: string}} chess 
 * @param {EmbedBuilder} embed 
 * @param {boolean} resigned
 * @returns EmbedBuilder
 */
function chessStateEmbed(chess, embed, resigned = false, resignColor){
    let gameOver = "\n**Game over ";
    if(chess.board.isGameOver() || resigned){
        if(resigned) gameOver += `(${resignColor === "w" ? "White" : "Black"} <@${chess[resignColor].id}> resigned)`;
        else if(chess.board.isStalemate()) gameOver += "(stalemate)";
        else if(chess.board.isThreefoldRepetition()) gameOver += "(threefold repetition)";
        else if(chess.board.isInsufficientMaterial()) gameOver += "(insufficient material)";
        else if(chess.board.isDrawByFiftyMoves()) gameOver += "(draw by 50-move rule)";
        else if(chess.board.isCheckmate()) gameOver += `(${chess.board.turn() === "w" ? "White" : "Black"} <@${chess[chess.board.turn()].id}> has been checkmated)`;
    }
    gameOver += "**";

    let lastMove = chess.board.history({ verbose: true })?.at(-1);

    embed
    .setTitle(`♔ ${chess.w.name} v. ♚ ${chess.b.name}`.slice(0, 256))
    .setDescription(`**${chess.board.turn() === "w" ? `White (<@${chess.w.id}>)` : `Black (<@${chess.b.id}>)`}** to move${lastMove ? `\nLast move: #${chess.board.moveNumber()}. ${getMoveString(lastMove)}` : ""}${chess.board.isCheck() ? `\n${chess.board.turn() === "w" ? "White" : "Black"} <@${chess[chess.board.turn()].id}> is in check` : ""}${chess.board.isGameOver() || resigned ? gameOver : ""}`.slice(0, 4096))
    .setImage(`https://www.chess.com/dynboard?fen=${encode(chess.board.fen())}&board=green&piece=neo&size=3&coordinates=true${chess.board.turn() === "b" ? "&flip=true" : ""}`);
    return embed;
}