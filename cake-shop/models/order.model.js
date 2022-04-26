const Sequelize = require("sequelize");
const orderModel = {
	name: "order",
	define: {
		id: {
			type: Sequelize.UUID,
			primaryKey: true,
			unique: true,
			defaultValue: Sequelize.UUIDV4,
		},
		status: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		total: {
			type: Sequelize.BIGINT,
		},
		customer: {
			type: Sequelize.UUID,
			references: {
				model: "users",
				key: "id",
			},
		},
		payment_method: {
			type: Sequelize.UUID,
			references: {
				model: "payments",
				key: "id",
			},
		},
		voucher: {
			type: Sequelize.UUID,
			references: {
				model: "vouchers",
				key: "id",
			},
		},
		detail: {
			type: Sequelize.UUID,
			references: {
				model: "order_details",
				key: "id",
			},
		},
	},
};
module.exports = orderModel;
