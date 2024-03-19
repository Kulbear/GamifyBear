const {
	SlashCommandBuilder,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('quest')
		.setDescription('Quest related options')
		.addSubcommand(subcommand =>
			subcommand
				.setName('publish')
				.setDescription('Publish a new quest...'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all available quests...'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('accept')
				.setDescription('Accept a quest...')),
	async execute(interaction) {
		// create a message that contains interactable button/reaction for the user
		if (interaction.options.getSubcommand() === 'publish') {

			const modal = new ModalBuilder()
				.setCustomId('publishQuestModal')
				.setTitle('Publishing a new quest...');

			// Add components to modal
			// Create the text input components that asks for the quest description
			const questDescriptionInput = new TextInputBuilder()
				.setPlaceholder('Enter your task description here!')
				.setCustomId('questDescriptionInput')
				.setLabel('What\'s the quest for?')
				.setStyle(TextInputStyle.Paragraph);

			// An action row only holds one text input,
			// so you need one action row per text input.
			const firstActionRow = new ActionRowBuilder().addComponents(questDescriptionInput);
			// const secondActionRow = new ActionRowBuilder().addComponents(questType);
			// const thirdActionRow = new ActionRowBuilder().addComponents(isQuestRepeatable);
			// const fourthActionRow = new ActionRowBuilder().addComponents(questDifficulty);

			// Add inputs to the modal
			modal.addComponents(firstActionRow);

			interaction.showModal(modal);
		}
		else if (interaction.options.getSubcommand() === 'list') {
			console.log('list');
		}
		else if (interaction.options.getSubcommand() === 'accept') {
			console.log('accept');
		}
	},
};