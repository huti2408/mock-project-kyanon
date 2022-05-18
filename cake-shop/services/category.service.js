const categoryModel = require("../models/category.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const {
	NotFound,
	Response,
	Get,
	Create,
	Delete,
	Update,
} = require("../helper");
module.exports = {
	name: "categories",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: categoryModel,
	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {
		list: {
			rest: "GET /",
			cache: true,
			async handler(ctx) {
				console.log("call category service");
				const categories = await this.adapter.find();
				if (categories.length === 0) {
					return Response(ctx, {
						message: "categories is empty",
						categories,
					});
				}
				console.log(categories);
				return Get(ctx, categories);
			},
		},
		get: {
			rest: "GET /:id",
			params: { id: "string" },
			async handler(ctx) {
				const { id } = ctx.params;
				const category = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!category) {
					return NotFound("Category");
				}
				return Get(ctx, category);
			},
		},
		create: {
			rest: "POST /",
			params: {
				name: { type: "string", min: 3, max: 200 },
				image: { type: "string" },
				description: { type: "string" },
			},
			async handler(ctx) {
				//this.broker.cacher.clean("MOL-categories.**");
				const newCategory = ctx.params;
				await this.adapter.insert(newCategory);
				return Create(ctx, null, newCategory);
			},
		},
		update: {
			rest: "PUT /:id",
			params: {
				id: "string",
				name: { type: "string", min: 3, max: 200 },
				image: { type: "string" },
				description: { type: "string" },
			},
			async handler(ctx) {
				const { id } = ctx.params;
				const category = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!category) {
					return NotFound("category");
				}
				await this.adapter.updateById(id);
				return Update(ctx, category);
			},
		},
		remove: {
			rest: "DELETE /:id",
			params: { id: "string" },
			async handler(ctx) {
				const { id } = ctx.params;
				const category = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!category) {
					return NotFound("category");
				}
				await this.adapter.removeById(id);
				return Delete(ctx, category);
			},
		},
	},
	methods: {},
};
