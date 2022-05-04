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
			defaultValue: "Chờ xác nhận",
		},
		total: {
			type: Sequelize.BIGINT,
			defaultValue: 0,
		},
		customerId: {
			type: Sequelize.UUID,
			references: {
				model: "users",
				key: "id",
			},
		},
		payment_status: {
			type: Sequelize.STRING,
			defaultValue: "Chưa thanh toán",
		},
		paymentMethodId: {
			type: Sequelize.UUID,
			references: {
				model: "payments",
				key: "id",
			},
			defaultValue: "94688fcc-eba4-40a6-938e-7a507c048c61",
		},
		voucherId: {
			type: Sequelize.UUID,
			references: {
				model: "vouchers",
				key: "id",
			},
		},
	},
};
module.exports = orderModel;
