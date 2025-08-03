const { Events, PollAnswer, Snowflake, ChannelType, Collection } = require('discord.js');

module.exports = {
    name: Events.MessagePollVoteRemove,
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

        if(!poll.answers?.[pollAnswer.id]?.voters?.includes(userID)) return;
        poll.answers[pollAnswer.id].voters = poll.answers?.[pollAnswer.id]?.voters?.filter(v => v !== userID);
        polls.set(msgID, poll);

        pollAnswer.poll.client.aiContext.polls.set(channID, polls);
    },
};