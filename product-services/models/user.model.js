const Sequelize = require("sequelize");
const UserModel = {
	name: "user",
	define: {
		id: {
			type: Sequelize.UUID,
			primaryKey: true,
			unique: true,
			defaultValue: Sequelize.UUIDV4,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		image: {
			type: Sequelize.TEXT,
		},
		email: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: {
					msg: "Must be a valid email address",
				},
			},
		},
		password: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		point: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
		role: {
			type: Sequelize.STRING,
			defaultValue: "customer",
			validate: {
				isIn: [["admin", "customer"]],
			},
		},
		deliveryInforId: {
			type: Sequelize.UUID,
			references: {
				model: "deliveryinformations",
				key: "id",
			},
		},
	},
};
module.exports = UserModel;
