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
} = require('./utility/playerProfile.js');

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