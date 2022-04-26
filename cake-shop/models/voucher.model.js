const Sequelize = require("sequelize");
const voucherModel = {
	name: "voucher",
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
			unique: true,
			isAlpha: true,
			max: 20,
			min: 6,
		},
		value: {
			type: Sequelize.STRING,
		},
		description: Sequelize.STRING,
		use_remaining: {
			type: Sequelize.STRING,
		},
	},
};
module.exports = voucherModel;
