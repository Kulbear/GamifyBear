// Description: This file is used to handle the quest related commands

const {
	SlashCommandBuilder,
	ActionRowBuilder,
	EmbedBuilder,
	ButtonBuilder,
} = require('discord.js');

const { buildQuestSubmitModal } = require('../../utility/modalUtils.js');


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
			console.debug('[DEBUG] "/quest submit" command received.');
			const modal = buildQuestSubmitModal();

			// expected to be handled by onSubmitQuestModalSubmit
			interaction.showModal(modal);
		}
		else if (interaction.options.getSubcommand() === 'list') {
			console.log('list');
			supabase.from('Quest').select('*')
				.then((r) => {
					console.log(JSON.stringify(r));
					const data = r['data'];

					if (data && data.length > 0) {
						// create the embed message with another action row that contians two buttons to navigate the quest
						// the embed started by showing the first quest in the data list
						// the two button is left and right that can be clicked to navigate the quest
						// the button click will change the embed content to the next or previous quest

						const quest = data[0];
						const questDescription = quest['description'];
						const durationTextRaw = quest['durationTextRaw'];
						const author = quest['createBy'];
						const embed = new EmbedBuilder()
							.setColor(0x0099FF)
							.setTitle('Quest Description')
							.setAuthor({
								name: interaction.member.nickname,
								iconURL: `https://cdn.discordapp.com/avatars/${author}/${interaction.guild.members.cache.get(author).avatar}.png`,
								url: `https://discord.com/users/${author}`,
							})
							.setDescription(questDescription)
						// user discord avatar url
							.setThumbnail(`https://cdn.discordapp.com/avatars/${author}/${interaction.guild.members.cache.get(author).avatar}.png`)
							.addFields(
								{ name: 'Quest Duration', value: durationTextRaw },
								{ name: 'Quest Author', value: author },
							)
							.setTimestamp()
							.setFooter({ text: 'Contact admin for questions/suggestions.' });

						const previousButton = new ButtonBuilder()
							.setCustomId('previousQuest')
							.setLabel('Previous')
							.setStyle('Primary');

						const nextButton = new ButtonBuilder()
							.setCustomId('nextQuest')
							.setLabel('Next')
							.setStyle('Primary');

						const actionRow = new ActionRowBuilder()
							.addComponents(previousButton, nextButton);

						interaction.reply({
							content: 'Here is the list of available quests.\nNavigate through quest lists with the interaction below.',
							ephemeral: true,
							embeds: [embed],
							components: [actionRow],
						});
					}
					else {
						interaction.reply({
							content: 'There is no available quest at the moment.',
							ephemeral: true,
						});
					}
				});
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

			// check if the user has had a quest under review, only show unreviewed quest
			supabase.from('RawQuest').select('*').eq('createBy', interaction.user.id).eq('reviewed', false)
				.then((r) => {
					console.log(JSON.stringify(r));
					return r['data'];
				})
				.then(data => {
					if (data && data.length > 0) {
						const quest = data[0];
						const questDescription = quest['description'];
						const durationTextRaw = quest['durationTextRaw'];
						const reviewed = quest['reviewed'];
						const approved = quest['approved'];
						const exampleEmbed = new EmbedBuilder()
							.setColor(0x0099FF)
							.setTitle('Quest Detail')
							.setAuthor({
								name: interaction.member.nickname,
								iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
								url: `https://discord.com/users/${interaction.user.id}`,
							})
							.setDescription(questDescription)
						// user discord avatar url
							.setThumbnail(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`)
							.addFields(
								{ name: 'Quest Duration', value: durationTextRaw },
								{ name: 'Quest Review Status', value: reviewed ? (approved ? 'Approved' : 'Rejected') : 'Pending' },
							)
							.setTimestamp()
							.setFooter({ text: 'Contact admins if you have any concern!' });


						interaction.reply({
							content: 'Your submitted quest has been shown below.',
							ephemeral: true,
							embeds: [exampleEmbed],
						});
					}
					else {
						interaction.reply({
							content: 'You do not have any quest under review.',
							ephemeral: true,
						});
					}
				});
		}
		else if (interaction.options.getSubcommand() === 'revoke') {
			console.log('revoke');
			// check if the user has had a quest under review
			supabase.from('RawQuest').select('*').eq('createBy', interaction.user.id).eq('reviewed', false)
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
			// check whether the user has the right to publish the quest
			// i.e. the user has the admin or the super admin role
		}
		else if (interaction.options.getSubcommand() === 'review') {
			supabase.from('player').select('*').eq('dcId', interaction.user.id)
				.then((uRes) => {
					console.log(JSON.stringify(uRes));
					const userData = uRes['data'];
					if (userData && userData.length > 0) {
						const user = userData[0];
						const role = user['role'];
						// user role === super admin or admin
						if (role === 0 || role === 1) {
							// get the quest that has not been reviewed
							supabase.from('RawQuest').select('*').eq('reviewed', false).order('createAt', { ascending: true })
								.then((qRes) => {
									console.log(JSON.stringify(qRes));
									const rawQuestArray = qRes['data'];
									if (rawQuestArray && rawQuestArray.length > 0) {
										const rawQuest = rawQuestArray[0];
										const embed = new EmbedBuilder()
											.setColor(0x0099FF)
											.setTitle('Quest Description')
											.setDescription(rawQuest['description'])
											// user discord avatar url
											// .setThumbnail(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`)
											.addFields(
												{ name: 'Quest Duration', value: rawQuest['durationTextRaw'] },
												{ name: 'Quest Submitted By', value: `<@${rawQuest['createBy']}>` },
												{ name: 'Quest ID', value: rawQuest['rawQuestId'] },
											)
											.setTimestamp()
											.setFooter({ text: 'Contact admins if you have any concern!' });

										const reviewButton = new ButtonBuilder()
											.setCustomId('reviewQuestButton')
											.setLabel('Start Review')
											.setStyle('Success');

										const rejectButton = new ButtonBuilder()
											.setCustomId('rejectQuestButton')
											.setLabel('Reject Now')
											.setStyle('Danger');

										const actionRow = new ActionRowBuilder()
											.addComponents(reviewButton, rejectButton);

										interaction.reply({
											content: 'Here is the quest that needs to be reviewed.',
											ephemeral: true,
											embeds: [embed],
											components: [actionRow],
										});
									}
									else {
										interaction.reply({
											content: 'There is no quest that needs to be reviewed.',
											ephemeral: true,
										});
									}
								});
						}
						else {
							interaction.reply({
								content: 'You do not have the right to review the quest.',
								ephemeral: true,
							});
						}
					}
					else {
						interaction.reply({
							content: 'You do not have the right to review the quest.',
							ephemeral: true,
						});
					}
				});
		}
		else if (interaction.options.getSubcommand() === 'delete') {
			console.log('delete');
		}
	},
};