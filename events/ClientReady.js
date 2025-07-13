const { Events, Client } = require('discord.js');
const get = require("../util/httpsGet.js");
const fs = require("node:fs");
const systemInstruction = fs.readFileSync("./assets/systemPrompt.txt", "utf-8").toString();

module.exports = {
	name: Events.ClientReady,
	once: true,

	/**
	 * @param {Client} client 
	 */
	async execute(client) {
		console.log("fuck u");
		console.log(`Logged in as ${client.user.tag}`);

		let bannerurl = (await client?.user?.fetch()).bannerURL({size: 1024});
		if (!bannerurl) return console.log("Banner URL not available");
		let bannerData = await get(bannerurl);

		let contents = [
			{
				inlineData: {
					mimeType: "image/png",
					data: Buffer.concat(bannerData).toString("base64"),
				},
			},
			{
				text: "This is a system intitialization event. The attached image is your current banner image. Give a detailed description, as detailed as possible, including any inside jokes or people you know if detected, for the banner image as you normally would when running the SetBanner command (do not include the command syntax, only the description), obeying the usual rules for responses of such command.",
				role: "model"
			}
		];

		const response = await client.ai[1].models.generateContent({
			model: "gemini-2.5-flash",
			contents,
			config: {
				systemInstruction,
				temperature: 0.8
			}
		}).catch(err=>console.error(err));

		client.banner.description = response?.text;
		console.log("Banner detected: " + client.banner.description)
	},
};