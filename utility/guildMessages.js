function sendMessageToChannel(client, channelId, messageContent) {
	return client.channels.fetch(channelId)
		.then(channel => {
			return channel.send(messageContent);
		});
}


module.exports = {
	sendMessageToChannel,
};