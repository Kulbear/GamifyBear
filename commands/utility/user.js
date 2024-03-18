const { SlashCommandBuilder } = require('discord.js');
const { getUserProfile } = require('../../utility/playerProfile.js');
const { sendMessageToChannel } = require('../../utility/guildMessages.js');
const { debugChannelId } = require('../../discordConfig.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	async execute(interaction, supabase) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild

		const userTag = interaction.user.tag;
		const guildId = interaction.member.guild.id;
		const client = interaction.user.client;

		getUserProfile(userTag, guildId, supabase).then((res) => {
			console.log(JSON.stringify(res));
			if (res === null) {
				sendMessageToChannel(client, debugChannelId, `User ${userTag} is not found in the store.`);
			}
			else {
				// use interaction that only visible to the user who run the command
				interaction.reply({
					content: `User Profile: ${res.beautifyPrint()}`,
					ephemeral: true,
				}).then((msg) => {
					// delete the message after 10 sec
					// Update the message every 1 sec to show the time left
					let sec = 10;
					const interval = setInterval(() => {
						if (sec > 0) {
							sec--;
							msg.edit(`User Profile: ${res.beautifyPrint()}\nThis message will be deleted in ${sec} sec!`);
						}
						else {
							clearInterval(interval);
							msg.delete();
						}
					}, 1000);
				});
			}
		});

		// await interaction.reply(`This command was run by ${interaction.user.username}, who joined guild ${interaction.member.guild.id} on ${interaction.member.joinedAt}.`);
	},
};