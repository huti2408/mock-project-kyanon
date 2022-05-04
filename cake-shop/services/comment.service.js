const commentModel = require("../models/comment.model");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const { QueryTypes } = require("@sequelize/core");
const {
	NotFound,
	Response,
	Get,
	Create,
	Delete,
	Update,
} = require("../helper");
module.exports = {
	name: "comments",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: commentModel,
	actions: {
		detail: {
			rest: "GET /:id",
			//auth: "required",
			async handler(ctx) {
				const { id } = ctx.params;
				const comment = await this.adapter.findOne({
					where: { id },
				});
				if (comment.length == 0) {
					throw NotFound("comment");
				}
				return Get(ctx, comment);
			},
		},
		getAllCommentOfUser: {
			rest: "GET /",
			async handler(ctx) {
				const { userId } = ctx.meta.user;
				const listCommentByUser = await this.getAllCommentOfUser(
					userId
				);
				if (listCommentByUser.length == 0) {
					throw NotFound("User");
				}
				return Get(ctx, listCommentByUser);
			},
		},
		create: {
			rest: "POST/",
			params: {
				content: { type: "string" },
				rating: { type: "number" },
				order: { type: "string" },
			},
			async handler(ctx) {
				let newCommnet = ctx.params;
				newCommnet["user_id"] = ctx.meta.user;
				console.log(newCommnet);
				await this.adapter.insert(newCommnet);
				return Create(ctx, null, newCommnet);
			},
		},
		update: {
			rest: "PUT /:id",
			async handler(ctx) {
				console.log(ctx.params);
				const { id } = ctx.params;
				//const update_field = Object.keys(ctx.params);
				const comment_old = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!comment_old) {
					return NotFound("comment");
				}
				await this.adapter.updateById(id, {
					$set: ctx.params,
				});
				const comment_new = await this.adapter.findOne({
					where: {
						id,
					},
				});
				return Update(ctx, comment_new);
			},
		},
		delete: {
			rest: "DELETE /:id",
			async handler(ctx) {
				const { id } = ctx.params;
				console.log(id);
				const comment = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!comment) {
					return NotFound("comment");
				}
				const temp = await this.adapter.removeById(id);
				console.log(temp);
				return Delete(ctx);
			},
		},
	},
	methods: {
		async getAllCommentOfUser(use_id) {
			const listComment = await this.adapter.find({
				where: { user_id },
			});
			// console.log("listDelivery", listDelivery);
			return listComment;
		},
	},
};
