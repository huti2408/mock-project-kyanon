const Sequelize = require("sequelize");
const order_detailModel = {
	name: "order_details",
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
		note: {
			type: Sequelize.TEXT,
		},
		total: {
			type: Sequelize.BIGINT,
		},
		order: {
			type: Sequelize.UUID,
			references: {
				model: "orders",
				key: "id",
			},
		},
		productId: {
			type: Sequelize.UUID,
			references: {
				model: "products",
				key: "id",
			},
		},
	},
};
module.exports = order_detailModel;
