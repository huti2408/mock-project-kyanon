const orderModel = require("../models/order.model");
const { QueryTypes } = require("@sequelize/core");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
//const orderDetail = require("../services/order_detail.service");
const _ = require("lodash");
const {
	NotFound,
	Response,
	Get,
	Create,
	Delete,
	Update,
} = require("../helper");
//const { QueryTypes } = require("sequelize/types");
module.exports = {
	name: "orders",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: orderModel,
	actions: {
		list: {
			rest: "GET /get-all/",
			//auth: "required",
			async handler(ctx) {
				const listOrders = await this.adapter.find({});
				if (listOrders.length == 0) {
					throw NotFound("Orders");
				}
				return Get(ctx, listOrders);
			},
		},
		detail: {
			rest: "GET /:id",
			//auth: "required",
			async handler(ctx) {
				const { id } = ctx.params;
				const listOrders = await this.adapter.findOne({
					where: { id },
				});
				if (listOrders.length == 0) {
					throw NotFound("Orders");
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
					throw NotFound("Orders");
				}
				return Get(ctx, listOrdersByUser);
			},
		},
		create: {
			rest: "POST/",
			params: {
				customer: { type: "string" },
			},
			async handler(ctx) {
				const { customer } = ctx.params;
				//console.log(customer);
				await this.adapter.insert(ctx.params);
				let newOrder = await this.adapter.findOne({
					where: { customer },
				});
				//console.log(newOrder);
				for (let i = 0; i < ctx.params.details.length; i++) {
					ctx.params.details[i]["order"] = newOrder.dataValues.id;
					const body = ctx.params.details[i];
					console.log(ctx.params.details[i]);
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
