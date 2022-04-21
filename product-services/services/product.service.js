const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const ProductModel = require("../models/product.model");
module.exports = {
	name: "products",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: ProductModel,
	actions: {},
	methods: {},
};
