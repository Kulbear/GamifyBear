const { QuestExpRewardCoefficient } = require('../models/static.js');
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');


async function onPublishQuestModalSubmit(interaction, quest) {
	const questDescription = interaction.fields.getTextInputValue('questDescriptionInput');
	console.log(questDescription);
	quest.setDescription(questDescription);
	quest.setCreateBy(interaction.user.id);
	const isQuestRepeatable = new StringSelectMenuBuilder()
		.setCustomId('questRepeatable')
		.setPlaceholder('Select the quest type')
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel('Yes')
				.setValue('true'),
			new StringSelectMenuOptionBuilder()
				.setLabel('No')
				.setValue('false'),
		);
	const row = new ActionRowBuilder()
		.addComponents(isQuestRepeatable);


	await interaction.reply({
		content: questDescription,
		ephemeral: true,
		components: [row],
	});

}

async function onQuestDifficultySelect(interaction, quest) {
	quest.setRewardCoefficient(QuestExpRewardCoefficient[interaction.values[0]]);
	quest.setCreateAt(new Date());
	quest.setQuestType('normal');

	await interaction.reply({
		content: JSON.stringify(quest),
		ephemeral: true,
	});
}

async function onQuestRepeatableSelect(interaction, quest) {
	console.log(interaction.values);
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
	onPublishQuestModalSubmit,
};

