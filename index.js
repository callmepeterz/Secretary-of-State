"use strict";
require("dotenv").config();
const {Client, Collection, Partials} = require('discord.js');
const fs = require("node:fs");
const path = require("node:path");
const client = new Client({intents: JSON.parse(process.env.INTENTS), partials: JSON.parse(process.env.PARTIALS)});
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
    description: fs.readFileSync("./data/bot/banner.txt", "utf-8")?.toString() ?? null,
}
// storing status stuffs
client.status = {
    timeStamp: null,
    description: fs.readFileSync("./data/bot/status.txt", "utf-8")?.toString() ?? null,
}
// storing context cache
client.aiContext = {
    systemInstruction: fs.readFileSync("./assets/systemPrompt.txt", "utf-8").toString(),
    messages: new Collection(),
    summaries: new Collection(),
    polls: new Collection(),
    hasAttemptedChannelFetch: new Collection(),
    lastCalled: {},
}

// storing games
client.games = {};
client.games.chess = new Collection();

// storing user data
client.userData = {};

// load commands
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

// load events
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

// load user data
const userDataPath = path.join(__dirname, 'data/users');
const userDataFiles = fs.readdirSync(userDataPath).filter(file=>file.endsWith(".json"));

for (const file of userDataFiles) {
    const filePath = path.join(userDataPath, file);
    const user = require(filePath);
    client.userData[user.id] = user;
}

client.login(process.env.TOKEN);