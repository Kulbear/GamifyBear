function sendMessageToChannel(client, channelId, messageContent) {
	client.channels.fetch(channelId)
		.then(channel => {
			channel.send(messageContent);
		}).catch(console.error(`Channel with id ${channelId} not found`));
}


module.exports = {
	sendMessageToChannel,
};