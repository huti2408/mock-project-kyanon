const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { NotFound, response } = require("../helper/response");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const _ = require("lodash");
const UserModel = require("../models/user.model");
const Redis = require("ioredis");
const { Sequelize } = require("sequelize/types");

const redis = new Redis();

module.exports = {
	name: "auth",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: UserModel,
	actions: {
		rest: "POST /sign-in",
		params: {
			email: { type: "email", min: 10, max: 100 },
			password: { type: "string", min: 6 },
		},
		async handler(ctx) {
			const { email, password } = ctx.params;
			const existedUser = await this.adapter.findOne({
				where: {
					email,
				},
			});
			if (!existedUser) {
				return NotFound(ctx, email);
			}
			const user = existedUser.dataValues;
			const comparePassword = bcrypt.compareSync(password, user.password);
			if (!comparePassword) {
				return response(ctx, { message: "Wrong password" });
			}
			const permissions = await this.getPermission(user.id);
			const role = user.role;
			const payload = {
				permissions,
				userId: user.id,
				role,
			};
			const token = this.generateJWT(payload, 60 * 60 * 4);

			new Promise((resolve, reject) => {
				resolve(token);
			}).then((token) => {
				redis.setex(user.id, 60 * 60 * 4, token);
			});
			return response(ctx, { data: { token } });
		},
	},
	methods: {
		generateJWT(payload, ttl) {
			const token = jwt.sign({ payload }, process.env.SECRETKEY, ttl);
			return token;
		},
		async getPermission(userId) {
			const document = await this.adapter.db.query(
				"SELECT resource, action FROM permissions, user_permissions WHERE user_permissions.user_id = :userId AND user_permissions.permission_id=permissions.id",
				{
					replacements: { userId },
					type: Sequelize.SELECT,
				}
			);
			let permission = {};
			_.forEach(document, (value) => {
				const resource = value.resource;
				const action = value.action;
				permission[resource]
					? permission[resource].push(action)
					: (permission[resource] = [action]);
			});
			return permission;
		},
	},
};
