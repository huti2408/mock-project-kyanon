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
		customer: {
			type: Sequelize.UUID,
			references: {
				model: "users",
				key: "id",
			},
		},
		payment_status: {
			type: Sequelize.STRING,
			defaultValue: "chưa thanh toán",
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
	},
};
module.exports = orderModel;
