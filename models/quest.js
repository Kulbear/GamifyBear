const { QuestExpRewardCoefficient } = require('./static.js');


function generateUniqueID(prefix) {
	// generate a unique ID that start with the prefix and followed by a random text of 6 characters with numbers and letters
	return prefix + Math.random().toString(36).substring(2, 8);
}

/**
 * QuestRaw is the class that contains the raw data of the quest submitted by the user.
 * `QuestRaw` is used to store the raw data of the quest before it is reviewed by the admin.
 */
class QuestRaw {
	/**
	 * Create a QuestRaw.
	 */
	constructor() {
		this.questRawId = null;
		this.description = null;
		this.create_by = null;
		this.durationTextRaw = null;
	}

	/**
	 * Set the description of the quest.
	 * @param {string} description - The description of the quest.
	 */
	setDescription(description) {
		this.description = description;
	}

	/**
	 * Set the creator of the quest.
	 * @param {string} dcId - The ID of the creator.
	 */
	setCreateBy(dcId) {
		this.create_by = dcId;
	}

	/**
	 * Set the raw duration text of the quest.
	 * @param {string} durationTextRaw - The raw duration text of the quest.
	 */
	setDuration(durationTextRaw) {
		this.durationTextRaw = durationTextRaw;
	}

	generateQuestRawId() {
		this.questRawId = generateUniqueID('QR');
	}

	/**
	 * Update the attributes of the QuestRaw from a store.
	 * @param {Object} attributes - The attributes to update.
	 */
	updateAttributeFromStore(attributes) {
		this.questRawId = attributes['questRawId'];
		this.description = attributes['description'];
		this.create_by = attributes['create_by'];
		this.durationTextRaw = attributes['durationTextRaw'];
	}

	/**
	 * Return the attributes of the QuestRaw to be stored.
	 * @returns {Object} - The attributes of the QuestRaw.
	 */
	returnAttributeToStore() {
		return {
			'questRawId': this.questRawId,
			'description': this.description,
			'create_by': this.create_by,
			'durationTextRaw': this.durationTextRaw,
		};
	}
}


/**
 * `Quest` is the class that represents a quest data model.
 * Each `Quest` is created by the admin after review a `QuestRaw` object.
 */
class Quest {
	/**
	 * Create a Quest.
	 */
	constructor() {
		this.description = null;
		this.quest_type = null;
		this.repeatable = false;

		this.reward_coefficient = reward_coefficient;
		this.reward_exp = reward_exp;

		this.create_at = null;
		this.expire_at = null;
		this.create_by = null;
	}

	/**
	 * Set the description of the quest.
	 * @param {string} description - The description of the quest.
	 */
	setDescription(description) {
		this.description = description;
	}

	/**
	 * Set the quest type of the quest.
	 * @param {string} quest_type - The quest type of the quest.
	 */
	setQuestType(quest_type) {
		this.quest_type = quest_type;
	}

	/**
	 * Set the repeatable flag of the quest.
	 * @param {boolean} repeatable - The repeatable flag of the quest.
	 */
	setRepeatable(repeatable) {
		this.repeatable = repeatable;
	}

	/**
	 * Set the reward coefficient of the quest.
	 * @param {number} reward_coefficient - The reward coefficient of the quest.
	 */
	setRewardCoefficient(reward_coefficient) {
		this.reward_coefficient = reward_coefficient;
	}

	/**
	 * Set the reward experience of the quest.
	 * @param {number} reward_exp - The reward experience of the quest.
	 */
	setRewardExp(reward_exp) {
		this.reward_exp = reward_exp;
	}

	/**
	 * Set the creation time of the quest.
	 * @param {Date} create_at - The creation time of the quest.
	 */
	setCreateAt(create_at) {
		this.create_at = create_at;
	}

	/**
	 * Set the expiration time of the quest.
	 * @param {Date} expire_at - The expiration time of the quest.
	 */
	setExpireAt(expire_at) {
		this.expire_at = expire_at;
	}

	/**
	 * Set the creator ID of the quest.
	 * @param {string} dcId - The creator ID of the quest.
	 */
	setCreateBy(dcId) {
		this.create_by = dcId;
	}

	/**
	 * Update the attributes of the Quest from a store.
	 * @param {Object} attributes - The attributes to update.
	 */
	updateAttributeFromStore(attributes) {
		this.description = attributes['description'];
		this.create_by = attributes['create_by'];
		this.quest_type = attributes['quest_type'];
		this.reward_coefficient = attributes['reward_coefficient'];
		this.reward_exp = attributes['reward_exp'];
		this.create_at = attributes['create_at'];
		this.expire_at = attributes['expire_at'];
	}

	/**
	 * Return the attributes of the Quest to be stored.
	 * @returns {Object} - The attributes of the Quest.
	 */
	returnAttributeToStore() {
		return {
			'description': this.description,
			'create_by': this.create_by,
			'quest_type': this.quest_type,
			'reward_coefficient': this.reward_coefficient,
			'reward_exp': this.reward_exp,
			'create_at': this.create_at,
			'expire_at': this.expire_at,
		};
	}
}


/**
 * QuestInstance is the class that contains the instance of data related to a quest accepted by the user.
 * Each Quest object can be accepted by multiple users, and each user will have their own corresponding QuestInstance object.
 */
class QuestInstance {
	/**
	 * Create a QuestInstance.
	 * @param {string} questId - The ID of the quest.
	 * @param {string} dcId - The ID of the user.
	 */
	constructor(questId, dcId) {
		this.questId = questId;
		this.dcId = dcId;
		this.accepted_at = null;
		this.completed_at = null;
		this.failed_at = null;
	}

	/**
	 * Update the attributes of the QuestInstance from a store.
	 * @param {Object} attributes - The attributes to update.
	 */
	updateAttributeFromStore(attributes) {
		this.questId = attributes['questId'];
		this.dcId = attributes['dcId'];
		this.accepted_at = attributes['accepted_at'];
		this.completed_at = attributes['completed_at'];
		this.failed_at = attributes['failed_at'];
	}

	/**
	 * Return the attributes of the QuestInstance to be stored.
	 * @returns {Object} - The attributes of the QuestInstance.
	 */
	returnAttributeToStore() {
		return {
			'questId': this.questId,
			'dcId': this.dcId,
			'accepted_at': this.accepted_at,
			'completed_at': this.completed_at,
			'failed_at': this.failed_at,
		};
	}

	/**
	 * Get the current time.
	 * @returns {Date} - The current time.
	 */
	getCurrentTime() {
		return new Date();
	}

	/**
	 * Set the accepted_at attribute to the current time.
	 */
	questAcceptAt() {
		this.accepted_at = this.getCurrentTime();
	}

	/**
	 * Set the completed_at attribute to the current time.
	 */
	questCompleteAt() {
		this.completed_at = this.getCurrentTime();
	}

	/**
	 * Set the failed_at attribute to the current time.
	 */
	questFailedAt() {
		this.failed_at = this.getCurrentTime();
	}
}


module.exports = {
	Quest,
	QuestRaw
	QuestInstance,
};