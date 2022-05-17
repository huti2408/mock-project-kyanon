const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const roleModel = require("../models/role.model");
module.exports = {
	name: "roles",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: roleModel,
	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {},
	methods: {},
};
