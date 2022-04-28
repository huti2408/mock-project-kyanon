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
			validate: {
				notNull: true,
			},
			unique: true,
		},
		value: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		},
		useRemaining: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				notNull: true,
				min: 0,
			},
			defaultValue: 0,
		},
		description: Sequelize.TEXT,
	},
};
module.exports = voucherModel;
