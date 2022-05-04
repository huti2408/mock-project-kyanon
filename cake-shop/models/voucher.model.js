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
		},
		value: {
			type: Sequelize.BIGINT,
		},
		description: {
			type: Sequelize.STRING,
		},
		quantity_remaining: {
			type: Sequelize.INTEGER,
		},
		expired_in: {
			type: Sequelize.DATE,
		},
		condition: {
			type: Sequelize.BIGINT,
		},
		percent: {
			type: Sequelize.FLOAT,
		},
	},
};
module.exports = voucherModel;
