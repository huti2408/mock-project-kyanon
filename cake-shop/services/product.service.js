const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const ProductModel = require("../models/product.model");
const {
	NotFound,
	Response,
	Get,
	Create,
	Delete,
	Update,
} = require("../helper");
module.exports = {
	name: "products",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: ProductModel,
	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {
		list: {
			rest: "GET /",
			cache: true,
			async handler(ctx) {
				const products = await this.adapter.find();
				if (products.length === 0) {
					return Response(ctx, {
						message: "Products is empty",
						products,
					});
				}
				return Get(ctx, products);
			},
		},
		get: {
			rest: "GET /:id",
			params: { id: "string" },
			async handler(ctx) {
				const { id } = ctx.params;
				const product = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!product) {
					return NotFound("Product");
				}
				return Get(ctx, product);
			},
		},
		create: {
			rest: "POST /",
			params: {
				name: { type: "string", min: 3, max: 200 },
				images: { type: "array", items: "string" },
				price: { type: "number", positive: true, integer: true },
				description: { type: "string" },
				categoryId: { type: "string" },
			},
			async handler(ctx) {
				const newProduct = ctx.params;
				await this.adapter.insert(newProduct);
				return Create(ctx, null, newProduct);
			},
		},
		update: {
			rest: "PUT /:id",
			params: {
				id: "string",
				name: { type: "string", min: 3, max: 200, optional: true },
				images: { type: "array", items: "string", optional: true },
				price: {
					type: "number",
					positive: true,
					integer: true,
					optional: true,
				},
				description: { type: "string", optional: true },
				categoryId: { type: "string", optional: true },
			},
			async handler(ctx) {
				const { id, name, images, price, description, categoryId } =
					ctx.params;
				const product = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!product) {
					return NotFound("Product");
				}
				const updatedProduct = {
					name,
					images,
					price,
					description,
					categoryId,
				};
				await this.adapter.updateById(id, updatedProduct);
				return Update(ctx, product);
			},
		},
		remove: {
			rest: "DELETE /:id",
			params: { id: "string" },
			async handler(ctx) {
				const { id } = ctx.params;
				const product = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!product) {
					return NotFound("Product");
				}
				await this.adapter.removeById(id);
				return Delete(ctx, product);
			},
		},
		getByCategory: {
			rest: "GET /by-category/",
			params: { categoryId: "string" },

			async handler(ctx) {
				const { categoryId } = ctx.params;
				const products = await this.adapter.find({
					query: {
						categoryId,
					},
				});
				if (!products || products.length === 0) {
					return NotFound("Product");
				}
				return Get(ctx, products);
			},
		},
		updateRating: {
			params: {
				id: "string",
				rate: { type: "number", min: 0, max: 5, optional: true },
				isNewRating: { type: "boolean", default: false },
			},
			async handler(ctx) {
				const { id, rate, isNewRating } = ctx.params;
				const product = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!product) {
					return NotFound("Product");
				} else {
					const commentsOfProduct = (
						await ctx.call("comments.listByProduct", {
							productId: id,
						})
					).data;
					let ratePoints = [];
					if (!commentsOfProduct) {
						ratePoints = [rate];
						const ratingCount = 1;
						const averageRating = rate;
						await this.adapter.updateById(id, {
							$set: { ratingCount, averageRating },
						});
						return Update(ctx, product);
					} else {
						commentsOfProduct.map((comment) => {
							ratePoints.push(comment.dataValues.rating);
						});
						if (isNewRating) {
							ratePoints.push(rate);
						}

						const totalRate = ratePoints.reduce(
							(accum, currentRate) => {
								return accum + currentRate;
							},
							0
						);
						console.log(totalRate);
						const newRatingCount = ratePoints.length;
						const newAverageRating = totalRate / newRatingCount;
						const updatedRate = {
							ratingCount: newRatingCount,
							averageRating: newAverageRating,
						};
						await this.adapter.updateById(id, {
							$set: updatedRate,
						});
						return Update(ctx, product);
					}
				}
			},
		},
	},
	methods: {},
};
