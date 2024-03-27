// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
} = require('discord.js');

const { token, clientId, debugChannelId } = require('./discordConfig.json');
const { supabaseUrl, supabaseKey } = require('./supabaseConfig.json');
const { createClient } = require('@supabase/supabase-js');

const {
	onSubmitQuestModalSubmit,
	onQuestReviewButtonClick,
	onQuestRepeatableButtonClick,
	onExpButtonClick,
	onEditQuestModalSubmit,
	onReviewDecisionButtonClick,
} = require('./utility/questHelper.js');

const {
	onGuildAvailableInfoLog,
	onGuildAvailableScanUsers,
	onGuildAvailableBatchInitUsers,
	onUserAddToGuild,
	onUserRemoveFromGuild,
} = require('./utility/playerProfile.js');

const {
	sendMessageToChannel,
} = require('./utility/guildMessages.js');

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('[INFO] Supabase app initialized...');

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
	sendMessageToChannel(client, debugChannelId, '**God Chen the Almighty Creator** 已经降临这个位面了!');
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
		// remove the bot mention from the message, remove other trailing spaces as well
		const messageContent = message.content.replace(`<@${clientId}>`, '').trim();

		// check if the message is a command
		// Command: profile
		if (messageContent.startsWith('profile')) {
			// replaced by slash command /user
		}
		else {
			sendMessageToChannel(client, debugChannelId, `Command ${messageContent} is not found.`);
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
	sendMessageToChannel(client, debugChannelId, `User <@${member.user.id}> (${member.user.displayName}) has joined the server!`);
});

// wher user leave server
client.on(Events.GuildMemberRemove, async member => {
	console.log(`User ${member.user.tag} has left the server`);
	onUserRemoveFromGuild(member, member.guild, supabase);
	sendMessageToChannel(client, debugChannelId, `User <@${member.user.id}> (${member.user.displayName}) has left the server!`);
});


client.on(Events.InteractionCreate, async interaction => {
	// Simple Documentation for the interaction events
	// /command [subcommand]: interactionCustomId(Helper/Util Functions)

	// /quest submit: submitQuestModal(onSubmitQuestModalSubmit)
	// /quest revoke: ...

	if (interaction.isModalSubmit()) {
		if (interaction.customId === 'submitQuestModal') {
			onSubmitQuestModalSubmit(interaction, supabase);
		}
		else if (interaction.customId === 'editQuestModal') {
			onEditQuestModalSubmit(interaction, supabase);
		}
		return;
	}

	if (interaction.isButton()) {
		if (interaction.customId === 'reviewQuestButton' || interaction.customId === 'rejectQuestButton') {
			onQuestReviewButtonClick(interaction, supabase);
		}
		else if (interaction.customId === 'repeatableQuestButton' || interaction.customId === 'nonRepeatableQuestButton') {
			onQuestRepeatableButtonClick(interaction, supabase);
		}
		else if (interaction.customId === 'Exp1Button' || interaction.customId === 'Exp2Button' || interaction.customId === 'Exp5Button') {
			onExpButtonClick(interaction, supabase);
		}
		else if (interaction.customId === 'publishQuestButton' || interaction.customId === 'discardReviewButton') {
			onReviewDecisionButtonClick(interaction, supabase);
		}
	}


	if (!interaction.isCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, supabase);
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