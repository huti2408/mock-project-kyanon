const order_detailModel = require("../models/order_detail.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
module.exports = {
	name: "order_details",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: order_detailModel,
	actions: {},
	methods: {},
};
