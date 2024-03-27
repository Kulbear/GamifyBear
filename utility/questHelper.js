// Description: This file contains the quest related helper functions.

const {
	RawQuest,
	Quest,
} = require('../models/quest.js');
// const { QuestExpRewardCoefficient } = require('../models/static.js');
const {
	ActionRowBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');


function selectObjectByUserId(object, userId) {
	return object[userId];
}

function parseDurationText(durationText) {
	// duration text will be in format of "1d2h3m4s"
	// we will parse this text and calculate the total duration in time delta that can be added to Date() object
	const duration = {
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	};

	const durationTextArray = durationText.match(/(\d+[dhm])/g);
	for (const text of durationTextArray) {
		const unit = text[text.length - 1];
		const value = parseInt(text.slice(0, -1));
		switch (unit) {
		case 'd':
			duration.days = value;
			break;
		case 'h':
			duration.hours = value;
			break;
		case 'm':
			duration.minutes = value;
			break;
		case 's':
			duration.seconds = value;
			break;
		default:
			break;
		}
	}
	return duration;
}


async function onSubmitQuestModalSubmit(interaction, rawQuests, supabaseStore) {
	const questDescription = interaction.fields.getTextInputValue('questDescriptionInput');
	const questDuration = interaction.fields.getTextInputValue('questDurationInput');
	const submitter = interaction.user.id;

	// check if the user has had a quest under review so we need to exclude the reviewed quest
	supabaseStore.from('RawQuest').select('*').eq('createBy', submitter).eq('reviewed', false)
		.then((r) => {
			console.log(JSON.stringify(r));
			return r['data'];
		})
		.then((data) => {
			// user has had existing quest under review
			if (data && data.length > 0) {
				interaction.reply({
					content: 'You have a quest under review, please wait until the admin review it. You can only submit one quest at a time.',
					ephemeral: true,
				});
			}
			else {

				// tenary operator here, if quest undefined, create a new quest, else update the quest
				const rawQuest = selectObjectByUserId(rawQuests, submitter) || new RawQuest();

				rawQuest.generateRawQuestId();
				rawQuest.setDescription(questDescription);
				rawQuest.setCreateBy(submitter);
				rawQuest.setDuration(questDuration);

				// now store the rawQuest object to Supabase
				const rawQuestData = rawQuest.returnAttributeToStore();
				// console.debug(`[INFO] Inserting data ${JSON.stringify(rawQuestData)} to table [RawQuest]`);
				supabaseStore.from('RawQuest').insert(rawQuestData)
					.then((r) => {
						console.debug(`[INFO] Inserted data ${JSON.stringify(r)} to table [RawQuest]`);
					});


				const exampleEmbed = new EmbedBuilder()
					.setColor(0x0099FF)
					.setTitle('Quest Detail')
					.setAuthor({
						name: interaction.member.nickname,
						iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
						url: `https://discord.com/users/${interaction.user.id}`,
					})
					.setDescription(rawQuest.description)
					// user discord avatar url
					.setThumbnail(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`)
					.addFields(
						{ name: 'Quest Duration', value: rawQuest.durationTextRaw },
						{ name: 'Quest Review Status', value: rawQuest.reviewed ? (rawQuest.approved ? 'Approved' : 'Rejected') : 'Pending' },
					)
					.setTimestamp()
					.setFooter({ text: 'Contact Admins if you have any concern!' });


				interaction.reply({
					content: 'Your quest has been submitted! It will be reviewed by the admin ASAP and it will be published upon approval.',
					ephemeral: true,
					embeds: [exampleEmbed],
				}).then(() => {
					// remove the quest from the rawQuests object
					delete rawQuests[submitter];

					// TODO: optionally remove the interaction message
				});
			}
		});
}


async function onReviewDecisionButtonClick(interaction, supabase) {
	const decision = interaction.customId === 'publishQuestButton';
	const questId = interaction.message.embeds[0].description;

	// quest publish!
	if (decision) {
		await interaction.reply({
			content: `The quest with ID ${questId} has been published.\nIt can be found in the quest list now!`,
			ephemeral: true,
		});
	}
	// quest review discard
	// remove from the Quest table
	// change RawQuest review status to false again
	else {
		supabase.from('Quest').delete().eq('questId', questId)
			.then((r) => {
				if (r.error === null) {
					supabase.from('RawQuest').update({ reviewed: false }).eq('rawQuestId', questId)
						.then((r) => {
							if (r.error === null) {
								interaction.reply({
									content: `The review progress of quest with ID ${questId} has been discarded.`,
									ephemeral: true,
								});
							}
						});
				}
			});
	}
}


async function onExpButtonClick(interaction, supabase) {
	const expValue = interaction.customId === 'Exp1Button' ? 1 : (interaction.customId === 'Exp2Button' ? 2 : 5);
	const questId = interaction.message.embeds[0].description;

	const quest = new Quest();

	supabase.from('Quest').select('*').eq('questId', questId)
		.then((r) => {
			return r['data'];
		})
		.then((data) => {
			if (data && data.length > 0) {
				quest.updateAttributeFromStore(data[0]);
				quest.setRewardExp(expValue);

				const questData = quest.returnAttributeToStore();
				supabase.from('Quest').update(questData).eq('questId', questId)
					.then((r) => {
						if (r.error === null) {
							const embed = new EmbedBuilder()
								.setTitle('Quest Id')
								.setDescription(quest.questId)
								.addFields(
									{ name: 'Quest Submitted By', value: `<@${quest.createBy}>` },
									{ name: 'Quest Description', value: quest.description },
									{ name: 'Quest Repeatable', value: quest.repeatable ? 'Yes' : 'No' },
									{ name: 'Quest Exp Reward', value: `${quest.rewardExp}` },
								);

							const publishButton = new ButtonBuilder()
								.setCustomId('publishQuestButton')
								.setLabel('Publish Quest!')
								.setStyle('Success');

							const discardReviewButton = new ButtonBuilder()
								.setCustomId('discardReviewButton')
								.setLabel('Discard Review')
								.setStyle('Danger');

							const actionRow = new ActionRowBuilder()
								.addComponents(publishButton, discardReviewButton);


							interaction.reply({
								content: `The quest with ID ${questId} has been set to ${expValue} exp reward.`,
								ephemeral: true,
								embeds: [embed],
								components: [actionRow],
							});
						}
					});
			}
		});

}


async function onQuestRepeatableButtonClick(interaction, supabase) {
	const repeatable = interaction.customId === 'repeatableQuestButton';
	const questId = interaction.message.embeds[0].description;

	const quest = new Quest();

	supabase.from('Quest').select('*').eq('questId', questId)
		.then((r) => {
			return r['data'];
		})
		.then((data) => {
			if (data && data.length > 0) {
				quest.updateAttributeFromStore(data[0]);
				quest.setRepeatable(repeatable);

				const questData = quest.returnAttributeToStore();
				supabase.from('Quest').update(questData).eq('questId', questId)
					.then((r) => {
						if (r.error === null) {

							const embed = new EmbedBuilder()
								.setTitle('Quest Id')
								.setDescription(questId)
								.addFields(
									{ name: 'Quest Submitted By', value: `<@${quest.createBy}>` },
									{ name: 'Quest Description', value: quest.description },
									{ name: 'Quest Repeatable', value: repeatable ? 'Yes' : 'No' },
								);

							const actionRow = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId('Exp1Button')
										.setLabel('Exp: 1')
										.setStyle('Secondary'),
									new ButtonBuilder()
										.setCustomId('Exp2Button')
										.setLabel('Exp: 2')
										.setStyle('Secondary'),
									new ButtonBuilder()
										.setCustomId('Exp5Button')
										.setLabel('Exp: 5')
										.setStyle('Secondary'),
								);

							interaction.reply({
								content: `The quest with ID ${questId} has been set to ${repeatable ? 'repeatable' : 'non-repeatable'}.`,
								ephemeral: true,
								embeds: [embed],
								components: [actionRow],
							});
						}
					});
			}
		});
}

function addTimeDelta(currentTime, timeDelta) {
	currentTime.setDate(currentTime.getDate() + timeDelta.days);
	currentTime.setHours(currentTime.getHours() + timeDelta.hours);
	currentTime.setMinutes(currentTime.getMinutes() + timeDelta.minutes);
	currentTime.setSeconds(currentTime.getSeconds() + timeDelta.seconds);
	return currentTime;
}

async function onEditQuestModalSubmit(interaction, supabase) {
	console.debug('[INFO] onEditQuestModalSubmit called!');

	const questId = interaction.fields.getTextInputValue('questIdEditInput');
	const questDescription = interaction.fields.getTextInputValue('questDescriptionEditInput');
	const questDuration = interaction.fields.getTextInputValue('questDurationEditInput');

	const quest = new Quest();

	supabase.from('Quest').select('*').eq('questId', questId)
		.then((r) => {
			return r['data'];
		})
		.then((data) => {
			console.log(data);
			if (data && data.length > 0) {
				quest.updateAttributeFromStore(data[0]);
				quest.setDescription(questDescription);
				quest.setDurationTextRaw(questDuration);

				const currentTime = new Date();
				const duration = parseDurationText(questDuration);
				const expireTime = addTimeDelta(currentTime, duration);
				quest.setExpireAt(expireTime);

				const questData = quest.returnAttributeToStore();

				console.log(questData);
				supabase.from('Quest').update(questData).eq('questId', questId)
					.then((r) => {
						console.log(quest.createAt);
						console.log(questData.expireAt);
						console.log(r);
						if (r.error === null) {
							const embed = new EmbedBuilder()
								.setTitle('Quest Id')
								.setDescription(questId)
								.addFields(
									{ name: 'Quest Submitted By', value: `<@${quest.createBy}>` },
									{ name: 'Quest Description', value: quest.description },
									{ name: 'Quest Expire At', value: quest.expireAt.toString() },
								);

							console.log(`New quest ${questId} has been initialized in database!`);
							// create interaction components: two buttons
							const row = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId('repeatableQuestButton')
										.setLabel('Set Repeatable')
										.setStyle('Success'),
									new ButtonBuilder()
										.setCustomId('nonrepeatableQuestButton')
										.setLabel('Set Non-Repeateable')
										.setStyle('Danger'),
								);

							interaction.reply({
								content: 'Whether the quest should be repeatable?',
								ephemeral: true,
								embeds: [embed],
								components: [row],
							});

						}
					});
			}
		});
}


async function onQuestReviewButtonClick(interaction, supabase) {
	const questId = interaction.message.embeds[0].fields[2].value;
	const approve = interaction.customId === 'reviewQuestButton';

	console.log(`Reviewing quest ${questId}, approve: ${approve}`);

	// fetch the quest from the database
	supabase.from('RawQuest').select('*').eq('rawQuestId', questId)
		.then((r) => {
			return r['data'];
		})
		.then((data) => {
			if (data && data.length > 0) {
				const quest = new RawQuest();
				quest.updateAttributeFromStore(data[0]);

				if (approve) {
					quest.setReviewed(true);
					quest.setApproved(true);
				}
				else {
					quest.setReviewed(true);
					quest.setApproved(false);
				}

				// now update the quest in the database
				const questData = quest.returnAttributeToStore();
				// update the row in RawQuest table
				supabase.from('RawQuest').update(questData).eq('rawQuestId', questId)
					.then((r) => {
						if (r.error === null) {
							// quest got rejected
							if (!approve) {
								interaction.reply({
									content: `The quest with ID ${questId} has been rejected.`,
									ephemeral: true,
								});
								return;
							}
							// quest got approved
							else {
								const newQuest = new Quest();
								newQuest.questId = questId;
								newQuest.description = quest.description;
								newQuest.durationTextRaw = quest.durationTextRaw;
								newQuest.createBy = quest.createBy;
								newQuest.reviewedBy = interaction.user.id;

								const modal = new ModalBuilder()
									.setCustomId('editQuestModal')
									.setTitle('Quest Details');
									// .setTitle(`Quest [${newQuest.questId}] Details`);

								const questDescriptionInput = new TextInputBuilder()
									.setCustomId('questDescriptionEditInput')
									.setLabel('What\'s the quest for?')
									.setValue(newQuest.description)
									.setStyle(TextInputStyle.Paragraph)
									.setMaxLength(2500)
									.setMinLength(3);

								const questDurationInput = new TextInputBuilder()
									.setCustomId('questDurationEditInput')
									.setLabel('How long is the quest?')
									.setValue(newQuest.durationTextRaw)
									.setStyle(TextInputStyle.Short);

								const questIdInput = new TextInputBuilder()
									.setCustomId('questIdEditInput')
									.setLabel('Quest ID (DON\'T CHANGE)')
									.setValue(newQuest.questId)
									.setStyle(TextInputStyle.Short);

								modal.addComponents(
									new ActionRowBuilder().addComponents(questDescriptionInput),
									new ActionRowBuilder().addComponents(questDurationInput),
									new ActionRowBuilder().addComponents(questIdInput),
								);

								const newQuestData = newQuest.returnAttributeToStore();
								supabase.from('Quest').insert(newQuestData)
									.then((req) => {
										console.debug(req);
										// ask the reviewer to check the content of the submitted quest
										if (req.error === null) {
											console.debug('Quest approved! Creating a new quest instance!');
											interaction.showModal(modal);
										}
										else {
											interaction.reply({
												content: 'Something wrong! Quest not found!',
												ephemeral: true,
											});
										}
									});
							}
						}
					});

			}
			else {
				interaction.reply({
					content: 'Something wrong! Quest not found!',
					ephemeral: true,
				});
			}
		});
}


module.exports = {
	onEditQuestModalSubmit,
	onExpButtonClick,
	onSubmitQuestModalSubmit,
	onQuestReviewButtonClick,
	onReviewDecisionButtonClick,
	onQuestRepeatableButtonClick,
};

