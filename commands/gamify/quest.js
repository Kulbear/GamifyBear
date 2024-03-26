// Description: This file is used to handle the quest related commands

const {
	SlashCommandBuilder,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	EmbedBuilder,
} = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('quest')
		.setDescription('Quest related options...')
		// Subcommand for general users
		.addSubcommand(subcommand =>
			subcommand
				.setName('submit')
				.setDescription('[General] Submit a quest...'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('[General] List all available quests...'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('accept')
				.setDescription('[General] Accept a quest...'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('complete')
				.setDescription('[General] Complete a quest...'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('abandon')
				.setDescription('[General] Abandon the current quest...'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('[General] Check your current quest...'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('revoke')
				.setDescription('[General] Revoke the quest submitted...'))

		// Subcommand for admins
		// TODO: role check based on DC API for dcTag
		.addSubcommand(subcommand =>
			subcommand
				.setName('publish')
				.setDescription('[Admin] Publish a new quest...'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('review')
				.setDescription('[Admin] Review a quest...'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('[Admin] Delete a quest...')),


	async execute(interaction, supabase) {
		// create a message that contains interactable button/reaction for the user
		if (interaction.options.getSubcommand() === 'submit') {

			const modal = new ModalBuilder()
				.setCustomId('submitQuestModal')
				.setTitle('Submitting a new quest...');

			// Add components to modal
			// Create the text input components that asks for the quest description
			const questDescriptionInput = new TextInputBuilder()
				.setCustomId('questDescriptionInput')
				.setLabel('What\'s the quest for?')
				.setPlaceholder('Enter your task description here!')
				.setStyle(TextInputStyle.Paragraph)
				.setMaxLength(2500)
				.setMinLength(3);


			const questDurationInput = new TextInputBuilder()
				.setCustomId('questDurationInput')
				.setLabel('How long is the quest?')
				.setPlaceholder('Deadline in? (e.g. 1w, 1d12h, 10d, 30m...)')
				.setStyle(TextInputStyle.Paragraph);


			const firstActionRow = new ActionRowBuilder().addComponents(questDescriptionInput);
			const secondActionRow = new ActionRowBuilder().addComponents(questDurationInput);

			// Add inputs to the modal
			modal.addComponents(firstActionRow, secondActionRow);

			interaction.showModal(modal);
		}
		else if (interaction.options.getSubcommand() === 'list') {
			console.log('list');
		}
		else if (interaction.options.getSubcommand() === 'accept') {
			console.log('accept');
		}
		else if (interaction.options.getSubcommand() === 'complete') {
			console.log('complete');
		}
		else if (interaction.options.getSubcommand() === 'abandon') {
			console.log('abandon');
		}
		else if (interaction.options.getSubcommand() === 'info') {
			console.log('info');
		}
		else if (interaction.options.getSubcommand() === 'revoke') {
			console.log('revoke');
			// check if the user has had a quest under review
			supabase.from('RawQuest').select('*').eq('createBy', interaction.user.id)
				.then((r) => {
					console.log(JSON.stringify(r));
					return r['data'];
				})
				.then(data => {
					if (data && data.length > 0) {
					// remove the quest from supabase
						supabase.from('RawQuest').delete().eq('createBy', interaction.user.id)
							.then((r) => {
								console.log(JSON.stringify(r['data']));
								console.log('Quest has been revoked!');
								interaction.reply({
									content: 'Your quest has been revoked! Now you can submit another quest!',
									ephemeral: true,
								});
							});
					}
				});

		}
		else if (interaction.options.getSubcommand() === 'publish') {
			console.log('publish');
		}
		else if (interaction.options.getSubcommand() === 'review') {
			console.log('review');
		}
		else if (interaction.options.getSubcommand() === 'delete') {
			console.log('delete');
		}
	},
};