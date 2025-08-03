const { Events, PollAnswer, Snowflake, ChannelType, Collection } = require('discord.js');

module.exports = {
    name: Events.MessagePollVoteAdd,
    once: false,

    /**
     * @param {PollAnswer} pollAnswer 
     * @param {Snowflake} userID
     */
    async execute(pollAnswer, userID){
        let channID = pollAnswer.poll.message.channel.type === ChannelType.GuildText ? pollAnswer.poll.message.channel.id : pollAnswer.poll.message.author.id;
        let msgID = pollAnswer.poll.message.id;
        let polls = pollAnswer.poll.client.aiContext.polls.get(channID) ?? new Collection();

        if(!polls.has(msgID)) return;

        let poll = polls.get(msgID);

        if(poll.answers?.[pollAnswer.id]?.voters?.includes(userID)) return;
        poll.answers?.[pollAnswer.id]?.voters?.push(userID);
        polls.set(msgID, poll);

        while(polls.map(pollString).join("\n").length > parseInt(process.env.CONTEXT_LIMIT)) polls.delete(polls.firstKey());
        pollAnswer.poll.client.aiContext.polls.set(channID, polls);
    },
};

function pollString(p){
    let s = `[Author: ${p.author.name}, ID: ${p.author.id}]: ${p.question.text}\n`;
    Object.values(p.answers).forEach(a => {s += `- ${a.text} (${a.voters.length} votes) (voters: ${a.voters.join(", ")})\n`});
    return s;
}