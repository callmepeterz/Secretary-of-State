const { Events, Client, PresenceUpdateStatus } = require('discord.js');
const get = require("../util/httpsGet.js");
const fs = require("node:fs");
const path = require("node:path");

module.exports = {
	name: Events.ClientReady,
	once: true,

	/**
	 * @param {Client} client 
	 */
	async execute(client) {
		const systemInstruction = client.aiContext.systemInstruction;

		console.log("fuck u");
		console.log(`Logged in as ${client.user.tag}`);

		if(client.status.description) client?.user?.setPresence({activities: [{name: client.status.description, type: 4}], status: getUpdateStatus()});

		if(client.banner.description) return;

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
				text: "This is a system intitialization event. The attached image is your current banner image. Give a detailed but concise description, as detailed as possible, for your future self, not the user, including any inside jokes or people you know if detected, for the banner image as you normally would when running the SetBanner command (do not include the command syntax, only the description), obeying the usual rules for responses of such command (no emojis, only use characters allowed, max length, no mentions, etc.).",
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
		fs.writeFileSync(path.join(process.cwd(), "data/bot/banner.txt"), client.banner.description);
		console.log("Banner detected: " + client.banner.description);
	},
};

function getUpdateStatus() {
	let date = new Date(Date.now() + (parseFloat(process.env.UTC_OFFSET) * 3600000));
	if(date.getUTCDay() === 0 || date.getUTCDay() === 6) return PresenceUpdateStatus.Idle;
	if(date.getUTCDay() === 1) return PresenceUpdateStatus.DoNotDisturb;
	return PresenceUpdateStatus.Online;
}