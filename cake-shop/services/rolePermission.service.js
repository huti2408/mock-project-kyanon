const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const RolePermissionModel = require("../models/rolePermission.model");
module.exports = {
	name: "rolepermissions",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: RolePermissionModel,
	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {
		list: {
			rest: "GET /",
			async handler(ctx) {},
		},
		create: {
			rest: "POST /:id",
			params: {},
			async handler(ctx) {},
		},
		remove: {
			rest: "DELETE /:id",
			params: {},
			async handler(ctx) {},
		},
	},
	methods: {},
};
