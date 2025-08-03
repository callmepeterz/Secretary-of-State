const { Events, Message, ChannelType, Collection } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    once: false,

    /**
     * @param {Message} message 
     */
    async execute(message){
        let channID = message.channel.type === ChannelType.GuildText ? message.channel.id : message.author.id;
        let messages = message.client.aiContext.messages.get(channID) ?? [];
        let polls = message.client.aiContext.polls.get(channID) ?? new Collection();

        if(message.poll){
            let poll = {
                author: {name: message.author.displayName, id: message.author.id},
                question: message.poll.question.text,
                answers: {}
            }
            for(let [_, a] of message.poll.answers){
                let answer = {
                    text: a.text,
                }
                let votedUsers = await a.fetchVoters();
                answer.voters = votedUsers.map(v => v.id) ?? [];
                poll.answers[a.id] = answer;
            }
            polls.set(message.id, poll);
            while(polls.map(pollString).join("\n").length > parseInt(process.env.CONTEXT_LIMIT)) polls.delete(polls.firstKey());
            message.client.aiContext.polls.set(channID, polls);
        }

        if(message.author.bot || !message.content) return;
        messages.push(`[Author: ${message.author.displayName}, ID: ${message.author.id}]: ` + message.content.slice(0, 1000));
        while(messages.join("\n").length > parseInt(process.env.CONTEXT_LIMIT)) messages.shift();
        message.client.aiContext.messages.set(channID, messages);
    },
};

function pollString(p){
    let s = `[Author: ${p.author.name}, ID: ${p.author.id}]: ${p.question.text}\n`;
    Object.values(p.answers).forEach(a => {s += `- ${a.text} (${a.voters.length} votes) (voters: ${a.voters.join(", ")})\n`});
    return s;
}