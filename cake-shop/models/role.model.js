const Sequelize = require("sequelize");
const paymentModel = {
	name: "role",
	define: {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			unique: true,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
	},
};
module.exports = paymentModel;
