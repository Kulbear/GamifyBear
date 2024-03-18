// Description: This file contains the player model.
/* eslint-disable no-unused-vars */

const {
	Role,
	RoleIDToText,
} = require('./static.js');

class Player {
	constructor(dcId, dcTag, guildId, role = Role.MEMBER) {
		this.dcTag = dcTag;
		this.dcId = dcId;
		this.guildId = guildId;
		this.role = role;

		this.level = 0;
		this.exp = 0;
		this.currentTaskId = null;
		this.currencies = {
			'silverCoin': 0,
			'royalPoint': 0,
		};
	}

	hasTask() {
		return this.currentTaskId !== null;
	}

	acceptTask(taskId) {
		if (this.hasTask()) {
			return false;
		}
		this.currentTaskId = taskId;
		return true;
	}

	updateAttributeFromStore(attributes) {
		// get player data from object "attributes"
		this.role = attributes['role'];
		this.level = attributes['level'];
		this.exp = attributes['exp'];
		this.currentTaskId = attributes['currentTaskId'];
		// map key value pairs in currencies to this.currencies
		this.currencies = attributes['currencies'];
	}

	returnAttributeToStore() {
		this.updateLevel();
		return {
			'dcId': this.dcId,
			'dcTag': this.dcTag,
			'guildId': this.guildId,
			'role': this.role,
			'level': this.level,
			'exp': this.exp,
			'currentTaskId': this.currentTaskId,
			'currencies': this.currencies,
		};
	}

	// Recursively print the player profile
	// For properties that are text/numbers, print them with the format `\n|-> Property: value`
	// For properties that are objects, print the key value pairs
	beautifyPrint() {
		return `\nPlayer: <@${this.dcId}> \n|-> Nametag: ${this.dcTag} \n|-> Level: ${this.level} \n|-> Exp: ${this.exp} \n|-> Role: ${RoleIDToText[this.role]} \n|-> Currencies: ${JSON.stringify(this.currencies)}`;
	}

	updateCurrency(currency, amount) {
		// if currency to update does not exist
		if (!Object.prototype.hasOwnProperty.call(this.currencies, currency)) {
			return false;
		}

		// if the amount of currency is less than 0 after update
		if (this.currencies[currency] + amount < 0) {
			return false;
		}

		this.currencies[currency] += amount;
		return true;
	}

	updateRole(role) {
		this.role = role;
	}

	updateLevel() {
		this.level = this.exp / 100;
	}

	updateExp(exp) {
		this.exp += exp;
	}
}

module.exports = {
	Player,
};