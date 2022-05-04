const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const DeliveryInforModel = require("../models/delivery-information.model");
const userService = require("./user.service");
const { Get, NotFound, Create, Update } = require("../helper");
module.exports = {
	name: "deliveryinfors",
	mixins: [DbService, userService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: DeliveryInforModel,
	// async started() {
	// 	this.adapter.db.sync({ alter: true });
	// },
	actions: {
		// *ADMIN
		// get-all-delivery == /
		list: {
			rest: "GET /get-all/",
			auth: "required",
			async handler(ctx) {
				const listDeliveries = await this.adapter.find({});
				if (listDeliveries.length == 0) {
					throw NotFound("Deliveries");
				}
				return Get(ctx, listDeliveries);
			},
		},

		// * USER
		create: {
			rest: "POST /",
			params: {
				receiverName: "string",
				phone: "string",
				city: "string",
				district: "string",
				ward: "string",
				detailAddress: "string",
			},
			async handler(ctx) {
				const { userId } = ctx.meta.user;
				const delivery = await this.adapter.insert(ctx.params);
				const listDelivery = await this.getAllDeliveryOfUser(userId);
				if (listDelivery.length == 1 || ctx.params.default == true) {
					await ctx.call("users.updateDeliveryDefault", {
						userId,
						deliveryId: delivery.id,
					});
				}
				return Create(ctx, null, delivery.dataValues);
			},
		},
		update: {
			rest: "PUT /:id",
			params: {
				id: "string",
			},
			async handler(ctx) {
				const { id } = ctx.params;
				const { userId } = ctx.meta.user;
				const updatedAt = new Date();
				const updateDelivery = {
					...ctx.params,
					updatedAt,
				};
				const updatedDelivery = await this.adapter.updateById(id, {
					$set: updateDelivery,
				});
				// console.log("update", updatedDelivery);
				if (ctx.params.default == true) {
					await ctx.call("users.updateDeliveryDefault", {
						userId,
						deliveryId: id,
					});
				}
				return Update(ctx, updatedDelivery);
			},
		},
		remove: {
			rest: "DELETE /:id",
			params: {
				id: "string",
			},
			async handler(ctx) {
				const delivery = ctx.call("deliveryinfors.get", {
					id: ctx.params.id,
				});
				console.log("delivery", delivery);
				// const deliveryDelete = await this.adapter.deleteById(
				// 	ctx.params.id
				// );
			},
		},
		// * USER
		getAllDeliveryOfUser: {
			rest: "GET /",
			async handler(ctx) {
				const { userId } = ctx.meta.user;
				const listDeliveriesByUser = await this.getAllDeliveryOfUser(
					userId
				);
				if (listDeliveriesByUser.length == 0) {
					throw NotFound("Deliveries");
				}
				return Get(ctx, listDeliveriesByUser);
			},
		},
		// * ADMIN & USER
		get: {
			rest: "GET /:id",
			params: {
				id: "string",
			},
			async handler(ctx) {
				const delivery = await this.adapter.findById(ctx.params.id);
				// console.log("delivery", delivery.dataValues);
				if (!delivery) {
					throw NotFound("Delivery");
				}
				return Get(ctx, delivery.dataValues);
			},
		},
		// * ADMIN AND USER
		getByUserId: {
			rest: "GET /by-user/:userId",
			params: {
				userId: "string",
			},
			auth: "required",
			async handler(ctx) {
				const listDeliveriesByUser = await this.getAllDeliveryOfUser(
					ctx.params.userId
				);
				if (listDeliveriesByUser.length == 0) {
					throw NotFound("Deliveries");
				}
				return Get(ctx, listDeliveriesByUser);
			},
		},
	},
	methods: {
		async getAllDeliveryOfUser(userId) {
			const listDelivery = await this.adapter.find({ where: { userId } });
			// console.log("listDelivery", listDelivery);
			return listDelivery;
		},
	},
};
