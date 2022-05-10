const order_detailModel = require("../models/order_detail.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const { QueryTypes } = require("@sequelize/core");
const { NotFound, Get, Create, Delete, Update } = require("../helper");
module.exports = {
	name: "order_details",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: order_detailModel,
	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {
		detail: {
			rest: "GET /:id",
			//auth: "required",
			async handler(ctx) {
				const { id } = ctx.params;
				const detail = await this.adapter.findOne({
					where: { id },
				});
				if (detail.length == 0) {
					throw NotFound("Orders");
				}
				return Get(ctx, detail);
			},
		},
		getAllDetailOfOrder: {
			rest: "GET /",
			async handler(ctx) {
				const { userId } = ctx.meta.user;
				const listDetailByOrder = await this.getAllDetailOfOrder(
					userId
				);
				if (listDetailByOrder.length == 0) {
					throw NotFound("Orders");
				}
				return Get(ctx, listDetailByOrder);
			},
		},
		create: {
			rest: "POST/",
			params: {
				product: { type: "string" },
				amount: { type: "number" },
				order: { type: "string" },
			},
			async handler(ctx) {
				let newDetail = ctx.params;
				const price = await this.adapter.db.query(
					"select price from products where id = ?",
					{
						replacements: [ctx.params.product],
						type: QueryTypes.SELECT,
					}
				);
				if (price.length === 0) {
					return NotFound("product");
				}
				newDetail["price"] = price[0].price;
				newDetail["total"] = newDetail.amount * price[0].price;
				console.log(newDetail);
				await this.adapter.insert(newDetail);
				return Create(ctx, null, newDetail);
			},
		},
		async add(body) {
			const data = body.params.body;
			const price = await this.adapter.db.query(
				"select price from products where id = ?",
				{
					replacements: [data.productId],
					type: QueryTypes.SELECT,
				}
			);
			if (price.length === 0) {
				return NotFound("product");
			}
			data["price"] = price[0].price;
			data["total"] = data.amount * price[0].price;

			await this.adapter.insert(data);
			return data.total;
		},
		update: {
			rest: "PUT /:id",
			async handler(ctx) {
				console.log(ctx.params);
				const { id } = ctx.params;
				//const update_field = Object.keys(ctx.params);
				const detail_old = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!detail_old) {
					return NotFound("detail");
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
				const detail_new = await this.adapter.findOne({
					where: {
						id,
					},
				});
				return Update(ctx, detail_new);
			},
		},
		delete: {
			rest: "DELETE /:id",
			async handler(ctx) {
				const { id } = ctx.params;
				console.log(id);
				const detail = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!detail) {
					return NotFound("detail");
				}
				const temp = await this.adapter.removeById(id);
				console.log(temp);
				return Delete(ctx);
			},
		},
	},
	methods: {
		async getAllDetailOfOrder(order) {
			const listOrder = await this.adapter.find({ where: { order } });
			// console.log("listDelivery", listDelivery);
			return listOrder;
		},
	},
};
