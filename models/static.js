// Description: Static data for the application.

const Role = {
	SUPER_ADMIN: 0,
	ADMIN: 1,
	PREMIUM_MEMBER: 2,
	MEMBER: 3,
};

const RoleIDToText = {
	0: 'Super Admin',
	1: 'Admin',
	2: 'Premium Member',
	3: 'Member',
};

const QuestExpRewardCoefficient = {
	REWARD_INTRO: 0.5,
	REWARD_NORMAL: 1,
	REWARD_HIGH: 1.5,
	REWARD_VERY_HIGH: 2,
	REWARD_EXTREME: 2.5,
	REWARD_LEGENDARY: 3,
};

module.exports = {
	Role,
	RoleIDToText,
	QuestExpRewardCoefficient,
};