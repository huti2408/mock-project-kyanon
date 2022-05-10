const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const CommentModel = require("../models/comment.model");
const {
	Get,
	NotFound,
	Response,
	Create,
	Update,
	Unauthorized,
	Delete,
} = require("../helper");
module.exports = {
	name: "comments",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: CommentModel,

	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {
		listByProduct: {
			rest: "GET /:productId",
			params: {
				productId: "string",
			},
			async handler(ctx) {
				const { productId } = ctx.params;
				const comments = await this.adapter.find({
					query: {
						productId,
					},
				});
				if (!comments) {
					return NotFound("Comments");
				}
				if (comments.length === 0) {
					return Response(ctx, {
						message: "This products has no comment",
						comments,
					});
				}
				return Get(ctx, comments);
			},
		},
		createOnProduct: {
			rest: "POST /:productId",
			params: {
				content: { type: "string" },
				rating: { type: "number", min: 0, max: 5 },
				productId: "string",
			},
			async handler(ctx) {
				const { content, rating, productId } = ctx.params;
				const { userId } = ctx.meta.user;
				const orderByUsers = (
					await ctx.call("orders.getAllOrderOfUser", { userId })
				).data;
				let hasBought = false;
				for (let i = 0; i < orderByUsers.length; i++) {
					const orderDetailsbyOrder = await ctx.call(
						"order_details.getAllDetailOfOrder",
						{ orderId: orderByUsers[i].id }
					);
					let hasProduct = false;
					orderDetailsbyOrder.data.filter(async (item) => {
						if (item.dataValues.productId === productId) {
							hasBought = hasProduct = true;
							await this.adapter.insert({
								content,
								rating,
								userId,
								productId,
								orderId: orderByUsers[i].id,
							});
							return;
						} else {
							hasBought = false;
						}
					});
					if (hasProduct) break;
				}
				if (hasBought) {
					new Promise((resolve) => {
						resolve(rating);
					}).then(async (res) => {
						await ctx.call("products.updateRating", {
							rate: res,
							id: productId,
							isNewRating: true,
						});
					});

					return Create(ctx, "Comment Created", ctx.params);
				} else {
					return Response(
						ctx,
						{
							message:
								"Only after you bought this product, you could comment on it!",
						},
						400
					);
				}
			},
		},
		update: {
			rest: "PUT /:id",
			params: {
				id: "string",
				content: { type: "string", optional: true },
				rating: { type: "number", min: 0, max: 5, optional: true },
			},
			async handler(ctx) {
				const { id, content, rating } = ctx.params;
				const currentUser = ctx.meta.user;
				const comment = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!comment) {
					return NotFound("Comment");
				}
				if (!currentUser.userId === comment.userId) {
					return Response(
						ctx,
						{ message: "You can't edit this comment!" },
						403
					);
				}
				const updatedComment = {
					content,
					rating,
				};
				await this.adapter.updateById(id, {
					$set: updatedComment,
				});
				new Promise((resolve) => {
					resolve(rating);
				}).then(async (res) => {
					await ctx.call("products.updateRating", {
						rate: res,
						id: comment.productId,
					});
				});
				return Update(ctx, updatedComment);
			},
		},
		remove: {
			rest: "DELETE /:id",
			params: {},
			async handler(ctx) {
				const { id } = ctx.params;
				const currentUser = ctx.meta.user;
				const comment = await this.adapter.findOne({
					where: {
						id,
					},
				});
				console.log(currentUser.userId !== comment.userId);
				if (!comment) {
					return NotFound("Comment");
				}
				if (
					currentUser.roleId !== 1 &&
					currentUser.userId !== comment.userId
				) {
					return Response(
						ctx,
						{ message: "You can't delete this comment!" },
						403
					);
				} else if (
					currentUser.roleId === 1 ||
					currentUser.userId === comment.userId
				) {
					await this.adapter.removeById(id);
					new Promise((resolve) => {
						resolve(comment.productId);
					}).then(async (res) => {
						await ctx.call("products.updateRating", {
							id: res,
						});
					});
					return Delete(ctx, comment);
				}
			},
		},
	},
	methods: {},
};
