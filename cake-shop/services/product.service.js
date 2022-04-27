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
				name: { type: "string", min: 3, max: 200 },
				images: { type: "array", items: "string" },
				price: { type: "number", positive: true, integer: true },
				description: { type: "string" },
				categoryId: { type: "string" },
			},
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
				await this.adapter.updateById(id);
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
		// getByCategory{
		// 	rest:"GET /",
		// }
	},
	methods: {},
};
