const { QuestExpRewardCoefficient } = require('./static.js');


class QuestInstance {
	constructor(questId, dcId) {
		this.questId = questId;
		this.dcId = dcId;
		this.accepted_at = null;
		this.completed_at = null;
		this.failed_at = null;
	}

	updateAttributeFromStore(attributes) {
		this.questId = attributes['questId'];
		this.dcId = attributes['dcId'];
		this.accepted_at = attributes['accepted_at'];
		this.completed_at = attributes['completed_at'];
		this.failed_at = attributes['failed_at'];
	}

	returnAttributeToStore() {
		return {
			'questId': this.questId,
			'dcId': this.dcId,
			'accepted_at': this.accepted_at,
			'completed_at': this.completed_at,
			'failed_at': this.failed_at,
		};
	}

	getCurrentTime() {
		return new Date();
	}

	questAcceptAt() {
		this.accepted_at = this.getCurrentTime();
	}

	questCompleteAt() {
		this.completed_at = this.getCurrentTime();
	}

	questFailedAt() {
		this.failed_at = this.getCurrentTime();
	}
}

class Quest {
	constructor(reward_exp = 1, reward_coefficient = QuestExpRewardCoefficient.REWARD_INTRO) {
		this.description = null;
		this.quest_type = null;
		this.repeatable = false;

		this.reward_coefficient = reward_coefficient;
		this.reward_exp = reward_exp;

		this.create_at = null;
		this.expire_at = null;
		this.create_by = null;
	}

	// setters for all attributes
	setDescription(description) {
		this.description = description;
	}

	setQuestType(quest_type) {
		this.quest_type = quest_type;
	}

	setRepeatable(repeatable) {
		this.repeatable = repeatable;
	}

	setRewardCoefficient(reward_coefficient) {
		this.reward_coefficient = reward_coefficient;
	}

	setRewardExp(reward_exp) {
		this.reward_exp = reward_exp;
	}

	setCreateAt(create_at) {
		this.create_at = create_at;
	}

	setExpireAt(expire_at) {
		this.expire_at = expire_at;
	}
	
	setCreateBy(dcId) {
		this.create_by = dcId;
	}

	updateAttributeFromStore(attributes) {
		this.description = attributes['description'];
		this.create_by = attributes['create_by'];
		this.quest_type = attributes['quest_type'];
		this.reward_coefficient = attributes['reward_coefficient'];
		this.reward_exp = attributes['reward_exp'];
		this.create_at = attributes['create_at'];
		this.expire_at = attributes['expire_at'];
	}

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

module.exports = {
	Quest,
	QuestInstance,
};