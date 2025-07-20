"use strict";
require("dotenv").config();
const {Client, Collection} = require('discord.js');
const fs = require("node:fs");
const path = require("node:path");
const client = new Client({intents: [process.env.INTENTS]});
const { GoogleGenAI } = require("@google/genai");

client.commands = new Collection();
client.cooldowns = new Collection();

// Default is 1
client.ai = {
    1: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }),
    2: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_2 })
};

// storing banner description
client.banner = {
    timeStamp: null,
    description: "Not available.",
}
// storing status stuffs
client.status = {
    timeStamp: null,
    description: "Not available.",
}

// storing games
client.games = {};
client.games.chess = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file=>file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.TOKEN);