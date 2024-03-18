// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, clientId } = require('./discordConfig.json');
const { supabaseUrl, supabaseKey } = require('./supabaseConfig.json');
const { createClient } = require('@supabase/supabase-js');

const {
	onGuildAvailableInfoLog,
	onGuildAvailableScanUsers,
	onGuildAvailableBatchInitUsers,
	onUserAddToGuild,
	onUserRemoveFromGuild,
	getUserProfile,
} = require('./utility/playerProfile.js');

const {
	sendMessageToChannel,
} = require('./utility/guildMessages.js');

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('[INFO] Supabase app initialized...');

const DEBUG_CHANNEL_ID = '1215866984550629386';

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

// Create a new Collection to hold your commands.
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	// Send message to the channel with ID 1215866984550629386
	// TODO: this is harded coded, need to find a way to get the channel id from the server
	sendMessageToChannel(client, DEBUG_CHANNEL_ID, 'God Kulbear is ready to serve!');
});


client.on(Events.MessageCreate, async message => {
	if (message.author.bot) return;

	if (message.content === 'ping') {
		message.reply('pong');
	}

	console.log(message.content);
	// check if the message start with @ the bot
	if (!message.content.startsWith(`<@${clientId}>`)) { return; }
	else {
		// remove the bot mention from the message
		const messageContent = message.content.replace(`<@${clientId}>`, '').trim();

		// check if the message is a command
		// Command: profile
		if (messageContent.startsWith('profile')) {
			const userTag = message.author.tag;
			const guildId = message.guild.id;
			// check user profile from supabase by userId and guildId
			getUserProfile(userTag, guildId, supabase).then((res) => {
				if (res === null) {
					sendMessageToChannel(client, DEBUG_CHANNEL_ID, `User ${userTag} is not found in the store.`);
				}
				else {
					sendMessageToChannel(client, DEBUG_CHANNEL_ID, `User Profile: ${res.beautifyPrint()}`).then((msg) => {
						// delete the message after 10 sec
						setTimeout(() => {
							msg.delete();
						}, 10000);
					});
				}
			});

			// remove the command message and the infoMessage from the channel after a 5 sec time out
			// also change the content of the message by adding a prefix "Delete in ${sec}" to the message, updated every second
			// then delete the message after 5 sec
			// TODO: maybe we can use a function to do this, or maybe we dont need this at all
			let sec = 5;
			const infoMessage = sendMessageToChannel(client, DEBUG_CHANNEL_ID, `[INFO] Command message will be deleted in ${sec} sec!`);
			const interval = setInterval(() => {
				if (sec >= 0) {
					sec--;
					infoMessage.then((msg) => {
						msg.edit(`[INFO] Command message will be deleted in ${sec} sec!`);
					});
				}
				else {
					clearInterval(interval);
					message.delete();
					infoMessage.then(msg => msg.delete());
				}
			}, 1000);
		}
		else {
			sendMessageToChannel(client, DEBUG_CHANNEL_ID, `Command ${messageContent} is not found.`);
		}

		const messageData = {
			content: message.content,
			// timestamp: message.createdTimestamp,
			author: message.author.tag,
		};

		// Supabase version
		await supabase.from('messages').insert(messageData).then(
			console.log('Insert Done.')).catch((error) => console.log(error));
		console.log(`Logged message from ${message.author.tag} to Supabase`);
	}
});


client.on(Events.GuildAvailable, async guild => {
	onGuildAvailableInfoLog(guild);
	onGuildAvailableScanUsers(guild);
	onGuildAvailableBatchInitUsers(guild, supabase);
});


// when user join server
client.on(Events.GuildMemberAdd, async member => {
	console.log(`User ${member.user.tag} has joined the server!`);
	onUserAddToGuild(member, member.guild, supabase);
	sendMessageToChannel(client, DEBUG_CHANNEL_ID, `User <@${member.user.id}> (${member.user.displayName}) has joined the server!`);
});

// wher user leave server
client.on(Events.GuildMemberRemove, async member => {
	console.log(`User ${member.user.tag} has left the server`);
	onUserRemoveFromGuild(member, member.guild, supabase);
	sendMessageToChannel(client, DEBUG_CHANNEL_ID, `User <@${member.user.id}> (${member.user.displayName}) has left the server!`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Log in to Discord with your client's token
client.login(token);