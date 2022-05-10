const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const RolePermissionModel = require("../models/rolePermission.model");
const Redis = require("ioredis");
const redis = new Redis();
const { NotFound, Response, Get, Create, Delete } = require("../helper");
module.exports = {
	name: "rolePermissions",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: RolePermissionModel,
	async started() {
		// this.adapter.db.sync({ alter: true });
	},
	actions: {
		list: {
			rest: "GET /",
			async handler(ctx) {
				const list = await this.adapter.find();
				if (list.length === 0) {
					return Response(ctx, {
						message: "Role Permissions is empty",
						list,
					});
				}
				return Get(ctx, list);
			},
		},
		create: {
			rest: "POST /",
			params: {
				roleId: { type: "number" },
				permissionId: { type: "string" },
			},
			async handler(ctx) {
				const { roleId, permissionId } = ctx.params;
				const users = (
					await ctx.call("users.listUsersByRole", {
						roleId,
					})
				).data;
				new Promise((resolve) => {
					resolve(users);
				}).then((res) => {
					res.map(async (user) => {
						await this.DeleteRedisValue(user.dataValues.id);
					});
				});

				await this.adapter.insert({ roleId, permissionId });
				return Create(ctx, null, ctx.params);
			},
		},
		remove: {
			rest: "DELETE /:id",
			params: { id: "string" },
			async handler(ctx) {
				const { id } = ctx.params;
				const rolePermission = await this.adapter.findOne({
					where: {
						id,
					},
				});
				if (!rolePermission) {
					return NotFound("Role Permission");
				}
				const users = (
					await ctx.call("users.listUsersByRole", {
						roleId: rolePermission.role_id,
					})
				).data;
				new Promise((resolve) => {
					resolve(users);
				}).then((res) => {
					res.map(async (user) => {
						await this.DeleteRedisValue(user.dataValues.id);
					});
				});
				await this.adapter.removeById(id);
				return Delete(ctx, rolePermission);
			},
		},
	},
	methods: {
		DeleteRedisValue(key) {
			return redis.del(key);
		},
		GetRedisValue(key) {
			return redis.get(key);
		},
	},
};
