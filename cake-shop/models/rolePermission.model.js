const Sequelize = require("sequelize");
const RolePermissionModel = {
	name: "rolePermission",
	define: {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			unique: true,
		},
		role_id: {
			type: Sequelize.INTEGER,
			references: {
				model: "roles",
				key: "id",
			},
		},
		permission_id: {
			type: Sequelize.INTEGER,
			references: {
				model: "permissions",
				key: "id",
			},
		},
	},
};
module.exports = RolePermissionModel;
