const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const permissionModel = require("../models/permission.model");
module.exports = {
	name: "permissions",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: permissionModel,
	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {},
	methods: {},
};
