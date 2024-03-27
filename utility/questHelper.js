// Description: This file contains the quest related helper functions.

const { RawQuest } = require('../models/quest.js');
const { QuestExpRewardCoefficient } = require('../models/static.js');
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');


function selectObjectByUserId(object, userId) {
	return object[userId];
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

async function onQuestDifficultySelect(interaction, quests) {

	const quest = selectObjectByUserId(quests, interaction.user.id);
	quest.setRewardCoefficient(QuestExpRewardCoefficient[interaction.values[0]]);
	quest.setCreateAt(new Date());
	quest.setQuestType('normal');

	await interaction.reply({
		content: JSON.stringify(quest),
		ephemeral: true,
	});
}

async function onQuestRepeatableSelect(interaction, quests) {

	const quest = selectObjectByUserId(quests, interaction.user.id);
	quest.setRepeatable(interaction.values[0] === 'true');
	const questDifficulty = new StringSelectMenuBuilder()
		.setCustomId('questDifficulty')
		.setPlaceholder('Select the quest difficulty')
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel('Intro')
				.setValue('REWARD_INTRO'),
			new StringSelectMenuOptionBuilder()
				.setLabel('Normal')
				.setValue('REWARD_NORMAL'),
			new StringSelectMenuOptionBuilder()
				.setLabel('High')
				.setValue('REWARD_HIGH'),
			new StringSelectMenuOptionBuilder()
				.setLabel('Very High')
				.setValue('REWARD_VERY_HIGH'),
			new StringSelectMenuOptionBuilder()
				.setLabel('Extreme')
				.setValue('REWARD_EXTREME'),
			new StringSelectMenuOptionBuilder()
				.setLabel('Legendary')
				.setValue('REWARD_LEGENDARY'),
		);
	const row = new ActionRowBuilder()
		.addComponents(questDifficulty);

	await interaction.reply({
		content: interaction.values[0],
		ephemeral: true,
		components: [row],
	});
}

module.exports = {
	onQuestDifficultySelect,
	onQuestRepeatableSelect,
	onSubmitQuestModalSubmit,
};

