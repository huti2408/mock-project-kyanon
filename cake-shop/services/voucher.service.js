const voucherModel = require("../models/voucher.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
module.exports = {
	name: "vouchers",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: voucherModel,
	actions: {},
	methods: {},
};
