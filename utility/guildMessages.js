function sendMessageToChannel(client, channelId, messageContent) {
	return client.channels.fetch(channelId)
		.then(channel => {
			return channel.send(messageContent);
		});
}


async function botErrorReply(interaction) {
	interaction.reply({
		content: '机器人出错啦，请联系管理员。',
		ephemeral: true,
	});
}


module.exports = {
	sendMessageToChannel,
	botErrorReply,
};