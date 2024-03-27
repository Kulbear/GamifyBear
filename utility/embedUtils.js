const {
	EmbedBuilder,
} = require('discord.js');


function buildQuestSubmitEmbed(interaction, questToSubmit) {

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('任务详情')
		.setAuthor({
			name: interaction.member.nickname,
			iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
			url: `https://discord.com/users/${interaction.user.id}`,
		})
		.setDescription(questToSubmit.description)
		.setThumbnail(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`)
		.addFields(
			{ name: '任务预设时长', value: questToSubmit.durationTextRaw },
			{ name: '任务审核状态', value: questToSubmit.reviewed ? (questToSubmit.approved ? '已通过' : '已拒绝') : '审核中' },
		)
		.setTimestamp()
		.setFooter({ text: '如有疑问和建议，请联系管理员' });

	return embed;

}


module.exports = {
	buildQuestSubmitEmbed,
};