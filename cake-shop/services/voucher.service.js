const voucherModel = require("../models/voucher.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const moment = require("moment");
const {
	NotFound,
	Response,
	Get,
	Create,
	Delete,
	Update,
} = require("../helper");
module.exports = {
	name: "vouchers",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: voucherModel,
	actions: {
		list: {
			rest: "GET /get-all/",
			//auth: "required",
			async handler(ctx) {
				const listVoucher = await this.adapter.find({});
				if (listVoucher.length == 0) {
					throw NotFound("Orders");
				}
				return Get(ctx, listVoucher);
			},
		},
		detail: {
			rest: "GET /:id",
			//auth: "required",
			async handler(ctx) {
				const { id } = ctx.params;
				const vouchers = await this.adapter.findOne({
					where: { id },
				});
				if (vouchers.length == 0) {
					throw NotFound("Orders");
				}
				return Get(ctx, vouchers);
			},
		},
		async checkValid(ctx, id_order, id_voucher) {
			const { order, voucher } = ctx.params;
			console.log(order, voucher);
			const id = voucher;
			let voucher_new = await this.adapter.findOne({
				where: {
					id,
				},
				fields: [
					"value",
					"quantity_remaining",
					"condition",
					"percent",
					"expired_in",
				],
			});
			const order_new = await ctx.call("orders.getDetail", {
				ctx,
				order,
			});
			if (voucher_new === null) {
				return {
					valid: false,
					msg: "not found voucher",
				};
			}
			if (order_new === null) {
				return {
					valid: false,
					msg: "not found order",
				};
			}
			//check total of order and condition of voucher
			if (
				order_new.dataValues.total >= voucher_new.dataValues.condition
			) {
				const discount =
					order_new.dataValues.total * voucher_new.dataValues.percent;
				//update new total after discount
				if (discount > voucher_new.dataValues.value) {
					voucher_new.dataValues.quantity_remaining -= 1;
					await this.adapter.updateById(id, {
						$set: voucher_new.dataValues,
					});
					return {
						valid: true,
						discount: voucher_new.dataValues.value,
					};
				} else {
					voucher_new.dataValues.quantity_remaining -= 1;
					await this.adapter.updateById(id, {
						$set: voucher_new.dataValues,
					});
					return {
						valid: true,
						discount: discount,
					};
				}
			} else {
				return {
					valid: false,
					msg: "Total of order not qualified to use voucher",
				};
			}
		},
		create: {
			rest: "POST/",
			params: {
				name: { type: "string" },
				value: { type: "number" },
				description: { type: "string" },
				quantity_remaining: { type: "number" },
				expired_in: { type: "string" },
				condition: { type: "number" },
				percent: { type: "string" },
			},
			async handler(ctx) {
				//console.log(customer);
				//console.log("input", ctx.params);
				ctx.params.percent = parseFloat(ctx.params.percent);
				ctx.params.expired_in = moment(
					ctx.params.expired_in,
					"YYYY-MM-DD"
				).format("YYYY-MM-DD");
				console.log("input2", ctx.params);
				await this.adapter.insert(ctx.params);
				return Create(ctx, null, ctx.params);
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
					return NotFound("voucher");
				}
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
	methods: {},
};
