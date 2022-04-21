const categoryModel = require("../models/category.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
module.exports = {
	name: "categories",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: categoryModel,
	actions: {},
	methods: {},
};
