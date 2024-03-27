const {
	ModalBuilder,
	TextInputStyle,
	TextInputBuilder,
	ActionRowBuilder,
} = require('discord.js');


function buildQuestSubmitModal() {

	const modal = new ModalBuilder()
		.setCustomId('submitQuestModal')
		.setTitle('提交新任务');

	const questDescriptionInput = new TextInputBuilder()
		.setCustomId('questDescriptionInput')
		.setLabel('要发布的任务是关于...')
		.setPlaceholder('任务描述...')
		.setStyle(TextInputStyle.Paragraph)
		.setMaxLength(2500)
		.setMinLength(2);

	const questDurationInput = new TextInputBuilder()
		.setCustomId('questDurationInput')
		.setLabel('任务截止时间是...')
		.setPlaceholder('格式示例: 1w2d4h30m, 1d12h, 10d, 3h30m...')
		.setStyle(TextInputStyle.Short);

	modal.addComponents(
		new ActionRowBuilder().addComponents(questDescriptionInput),
		new ActionRowBuilder().addComponents(questDurationInput),
	);

	return modal;

}


module.exports = {
	buildQuestSubmitModal,
};
