const paymentModel = require("../models/payment.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
module.exports = {
	name: "payments",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: paymentModel,
	actions: {},
	methods: {},
};
