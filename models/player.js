// Description: This file contains the player model.
/* eslint-disable no-unused-vars */

const { Role } = require('./static.js');

class Player {
	constructor(dcId, dcTag, role = Role.MEMBER) {
		this.dcTag = dcTag;
		this.dcId = dcId;
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

		// assert attributes is not null
		if (attributes === null) {
			console.log('[INFO] Attributes is null.');
			console.log(`[INFO] Creating a new player profile for ${this.dcTag}`);
			return;
		}

		this.role = attributes.role;
		this.level = attributes.level;
		this.exp = attributes.exp;
		this.have_task = attributes.have_task;
		// map key value pairs in currencies to this.currencies
		this.currencies = attributes.currencies.map((key, value) => {
			this.currencies[key] = value;
		});
	}

	returnAttributeToStore() {
		return {
			'dcId': this.dcId,
			'dcTag': this.dcTag,
			'role': this.role,
			'level': this.level,
			'exp': this.exp,
			'currentTaskId': this.have_task,
			'currencies': this.currencies,
		};
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

