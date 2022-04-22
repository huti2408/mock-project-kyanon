const {
	STRING,
	DATE,
	INTEGER,
	UUID,
	UUIDV4,
	ARRAY,
	Sequelize,
	TEXT,
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
			type: TEXT,
		},
		email: {
			type: STRING,
			allowNull: false,
			unique: true,
		},
		passwordToken: {
			type: STRING,
		},
		passwordTokenExpirationDate: {
			type: DATE,
		},
		password: {
			type: Sequelize.STRING,
			allowNull: false,
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
