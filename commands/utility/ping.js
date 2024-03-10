const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		// interaction.reply() sends a message to the channel where the command was run
		// indicate the current server latency and API latency
		await interaction.reply(`\`\`\` API Latency: ${Math.round(interaction.client.ws.ping)}ms. \`\`\``);
	},
};