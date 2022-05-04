const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const CommentModel = require("../models/comment.model");
module.exports = {
	name: "payments",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: CommentModel,
	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {},
	methods: {},
};
