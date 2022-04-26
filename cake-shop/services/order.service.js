const orderModel = require("../models/order.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
module.exports = {
	name: "orders",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: orderModel,
	actions: {
		list: {
			rest: "GET /get-all/",
			auth: "required",
			async handler(ctx) {
				const listOrders = await this.adapter.find({});
				if (listOrders.length == 0) {
					throw NotFound("Deliveries");
				}
				return Get(ctx, listOrders);
			},
		},
		getAllOrderOfUser: {
			rest: "GET /",
			async handler(ctx) {
				const { userId } = ctx.meta.user;
				const listOrdersByUser = await this.getAllOrderOfUser(userId);
				if (listOrdersByUser.length == 0) {
					throw NotFound("Deliveries");
				}
				return Get(ctx, listOrdersByUser);
			},
		},
	},
	methods: {
		async getAllOrderOfUser(userId) {
			const listOrder = await this.adapter.find({ where: { userId } });
			// console.log("listDelivery", listDelivery);
			return listOrder;
		},
	},
};
