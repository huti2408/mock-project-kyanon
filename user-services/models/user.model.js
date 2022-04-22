const {
	STRING,
	DATE,
	INTEGER,
	UUID,
	UUIDV4,
	ARRAY,
	Sequelize,
} = require("sequelize");
const UserModel = {
	name: "user",
	define: {
		id: {
			type: UUID,
			primaryKey: true,
			unique: true,
			defaultValue: UUIDV4,
		},
		name: {
			type: STRING,
			allowNull: false,
		},
		image: {
			type: STRING,
		},
		email: {
			type: STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: STRING,
		},
		passwordToken: {
			type: STRING,
		},
		passwordTokenExpirationDate: {
			type: DATE,
		},
		point: {
			type: INTEGER,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
		role: {
			type: STRING,
			defaultValue: "customer",
			validate: {
				isIn: [["admin", "customer"]],
			},
		},
		deliveryId: {
			type: ARRAY(UUID),
			references: {
				model: "deliveryinformations",
				key: "id",
			},
		},
	},
};
module.exports = UserModel;
