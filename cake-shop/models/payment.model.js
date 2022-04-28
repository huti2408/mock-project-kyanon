const Sequelize = require("sequelize");
const paymentModel = {
	name: "payment",
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
		},
	},
};
module.exports = paymentModel;
