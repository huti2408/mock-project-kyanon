const orderModel = require("../models/order.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const {
	NotFound,
	Get,
	Create,
	Delete,
	Update,
	Response,
} = require("../helper");
module.exports = {
	name: "orders",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: orderModel,
	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {
		list: {
			rest: "GET /",
			//auth: "required",
			async handler(ctx) {
				const listOrders = await this.adapter.find({});
				if (listOrders.length == 0) {
					return Response(ctx, {
						message: "Orders is empty",
						listOrders,
					});
				}
				return Get(ctx, listOrders);
			},
		},
		detail: {
			rest: "GET /:id",
			//auth: "required",
			async handler(ctx) {
				console.log(ctx.meta.user);
				const { id } = ctx.params;
				const listOrders = await this.adapter.findOne({
					where: { id },
				});
				if (!listOrders || listOrders.length == 0) {
					throw NotFound("Orders");
				}
				return Get(ctx, listOrders);
			},
		},
		getAllOrderOfUser: {
			rest: "GET /:userId",
			params: {
				userId: "string",
			},
			async handler(ctx) {
				const { userId } = ctx.params;
				const listOrdersByUser = await this.getAllOrderOfUser(userId);
				if (!listOrdersByUser || listOrdersByUser.length == 0) {
					throw NotFound("Orders");
				}
				return Get(ctx, listOrdersByUser);
			},
		},
		create: {
			rest: "POST/",
			params: {
				paymentMethodId: { type: "string", optional: true },
				voucherId: { type: "string", optional: true },
				details: {
					type: "array",
					items: {
						type: "object",
						props: {
							productId: { type: "string" },
							amount: { type: "number", positive: true },
							note: { type: "string", optional: true },
						},
					},
				},
			},
			async handler(ctx) {
				const customerId = ctx.meta.user.userId;
				const { details } = ctx.params;
				const newEnity = ctx.params;
				await this.adapter.insert({ newEnity, customerId });
				let newOrder = await this.adapter.findOne({
					where: { customerId },
				});
				if (details.length === 0) {
					new Promise((resolve) => {
						resolve(newOrder.id);
					}).then(async (orderId) => {
						await this.adapter.removeById(orderId);
					});
					return NotFound("Details");
				}
				for (let i = 0; i < details.length; i++) {
					details[i]["order"] = newOrder.dataValues.id;
					const body = details[i];
					newOrder["total"] += await ctx.call("order_details.add", {
						body,
					});
					await this.adapter.updateById(newOrder.dataValues.id, {
						$set: newOrder.dataValues,
					});
				}
				return Create(ctx, null, newOrder);
			},
		},
		update: {
			rest: "PUT /:id",
			async handler(ctx) {
				console.log(ctx.params);
				const { id } = ctx.params;
				const order_old = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!order_old) {
					return NotFound("order");
				}
				//console.log(update_field);
				// _.forEach(ctx.params, async (key, value) => {
				// 	//console.log(item);
				// 	console.log(key, value);
				// 	await this.adapter.db.query(
				// 		`update orders set ${value} = ? where id=?`,
				// 		{
				// 			replacements: [key, id],
				// 			type: QueryTypes.UPDATE,
				// 		}
				// 	);
				// });
				await this.adapter.updateById(id, {
					$set: ctx.params,
				});
				const order_new = await this.adapter.findOne({
					where: {
						id,
					},
				});
				return Update(ctx, order_new);
			},
		},
		delete: {
			rest: "DELETE /:id",
			async handler(ctx) {
				const { id } = ctx.params;
				const order = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!order) {
					return NotFound("order");
				}
				const temp = await this.adapter.removeById(id);
				console.log(temp);
				return Delete(ctx);
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
