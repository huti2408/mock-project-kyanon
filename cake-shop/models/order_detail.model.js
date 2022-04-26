const Sequelize = require("sequelize");
const order_detailModel = {
	name: "order_detail",
	define: {
		id: {
			type: Sequelize.UUID,
			primaryKey: true,
			unique: true,
			defaultValue: Sequelize.UUIDV4,
		},
		amount: {
			type: Sequelize.BIGINT,
		},
		price: {
			type: Sequelize.BIGINT,
		},
		noet: {
			type: Sequelize.TEXT,
		},
		product: {
			type: Sequelize.UUID,
			references: {
				model: "products",
				key: "id",
			},
		},
	},
};
module.exports = order_detailModel;
