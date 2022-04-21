const Sequelize = require("sequelize");
const DeliveryInforModel = {
	name: "deliveryinformations",
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
		phone: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notNull: { args: true, msg: "You must enter Phone Number" },
				len: { args: [11, 11], msg: "Phone Number is invalid" },
				isInt: { args: true, msg: "You must enter Phone Number" },
			},
		},
		address: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		default: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		},
	},
};
module.exports = DeliveryInforModel;
