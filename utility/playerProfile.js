/* eslint-disable no-unused-vars */
const { Player } = require('../models/player.js');

// Define a function that when the bot is added to a server, it will log the server name, id, member count, and owner id
async function onGuildAvailableInfoLog(guild) {
	console.log(`Guild available: ${guild.name}`);
	console.log(`Guild ID: ${guild.id}`);
	console.log(`Guild member count: ${guild.memberCount}`);
	console.log(`Guild owner: ${guild.ownerId}`);
}

// Define a function that log all the user in the server, each user should be logged in a new line
// along with their id, tag, username, and whether it is a discord bot
// also log the user's role in the server in a new line, seperate differnet roles with a comma
async function onGuildAvailableScanUsers(guild) {
	guild.members.fetch().then((members) => {
		members.forEach(member => {
			// log the member id, tag, username, and whether it is a discord bot
			console.log(`\nMember: ${member.user.id} | ${member.user.tag} | ${member.user.username} | ${member.user.bot}`);
			// log the member's role in the server
			console.log(`Roles: ${member.roles.cache.map(role => role.name).join(', ')}`);
		});
	}).catch(console.error);
}


async function addUserToStore(member, guild, supabaseStore) {
	// skip bot users
	if (member.user.bot) {
		console.debug(`[INFO] ${member.user.tag} is a bot user. Skipping.`);
		return;
	}
	console.debug(`[INFO] ${member.user.tag} is not found in the store.`);
	const player = new Player(member.user.id, member.user.tag, guild.id);
	const playerData = player.returnAttributeToStore();
	supabaseStore.from('player').insert(playerData)
		.then((r) => {
			console.debug(`[INFO] Inserted data ${JSON.stringify(r)}.`);
		});
}

async function onUserAddToGuild(member, guild, supabaseStore) {
	supabaseStore.from('player').select().eq('dcId', member.user.id).eq('guildId', guild.id)
		.then((res) => {
			console.debug(`[INFO] Fetched data ${JSON.stringify(res)}.`);
			if (res.data.length === 0) {
				addUserToStore(member, guild, supabaseStore);
			}
			else {
				console.debug(`[INFO] ${member.user.tag} is found in the store. No action is taken!`);
			}
		});
}

async function onUserRemoveFromGuild(member, guild, supabaseStore) {
	supabaseStore.from('player').delete().eq('dcId', member.user.id).eq('guildId', guild.id)
		.then((res) => {
			console.debug(`[INFO] Removed user data ${JSON.stringify(res)}.`);
		});
}

// Define a function that when the bot is added to a server, it will check if the user data in Player table
async function onGuildAvailableBatchInitUsers(guild, supabaseStore) {
	guild.members.fetch().then((members) => {
		// for every user check if supabase has the user data in Player table
		// if yes, fetch the data, store to a variable
		// if no, create a new player profile
		// then update the player profile to the store
		members.forEach(member => {
			supabaseStore.from('player').select().eq('dcId', member.user.id)
				.then((res) => {
					console.debug(`[INFO] Fetched data ${JSON.stringify(res)}.`);
					if (res.data.length === 0) {
						addUserToStore(member, guild, supabaseStore);
					}
					else {
						console.debug(`[INFO] ${member.user.tag} is found in the store.`);
						const player = new Player(member.user.id, member.user.tag, guild.id);
						player.updateAttributeFromStore(res.data[0]);
						console.debug(JSON.stringify(player));
					}
				});
		});
	});
}


module.exports = {
	onGuildAvailableInfoLog,
	onGuildAvailableScanUsers,
	onGuildAvailableBatchInitUsers,
	onUserAddToGuild,
	onUserRemoveFromGuild,
};