const Sequelize = require("sequelize");
const paymentModel = {
	name: "permission",
	define: {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			unique: true,
		},
		source: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		action: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
	},
};
module.exports = paymentModel;
