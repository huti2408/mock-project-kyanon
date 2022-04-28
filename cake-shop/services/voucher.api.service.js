const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const voucherModel = require("../models/voucher.model");
module.exports = {
	name: "categories",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: voucherModel,
	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {},
	methods: {},
};
