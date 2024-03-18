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

module.exports = {
	Role,
	RoleIDToText,
};