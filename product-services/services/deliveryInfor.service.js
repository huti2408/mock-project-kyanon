const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const DeliveryInforModel = require("../models/deliveryInfor.model");
module.exports = {
	name: "deliveryinfors",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: DeliveryInforModel,
	actions: {},
	methods: {},
};
