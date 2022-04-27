const {
	NotFound,
	Response,
	InputError,
	comparePassword,
	generateJWT,
	Create,
} = require("../helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const _ = require("lodash");
const UserModel = require("../models/user.model");
const Redis = require("ioredis");
const Sequelize = require("sequelize");

const redis = new Redis();
const PERMISSIONS_INDEX = 0;

const ONE_DAY = 60 * 60 * 24;
module.exports = {
	name: "auth",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: UserModel,

	async started() {
		// this.adapter.db.sync({ alter: true });
	},

	actions: {
		// auth/sign-in
		signIn: {
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
					throw NotFound("Email");
				}
				const user = existedUser.dataValues;
				const comparePassword = bcrypt.compareSync(
					password,
					user.password
				);
				if (!comparePassword) {
					return Response(ctx, { message: "Wrong password" });
				}
				const roleId = user.roleId;
				const permissions = await this.getPermission(roleId);

				const payload = {
					permissions,
					userId: user.id,
					roleId,
				};
				// console.log("payload", payload);
				const token = generateJWT(payload);
				new Promise((resolve, reject) => {
					resolve(token);
				}).then((token) => {
					redis.setex(user.id, ONE_DAY, token);
				});
				return Response(ctx, { data: { token } });
			},
		},
		register: {
			rest: "POST /sign-up",
			params: {
				email: { type: "email", min: 10, max: 100 },
				password: { type: "string", min: 6 },
				name: { type: "string", min: 6, max: 100 },
				image: "string",
				role: {
					type: "string",
					optional: true,
					lowercase: true,
				},
			},
			hooks: {
				before(ctx) {
					ctx.params.password = this.hashPassword(
						ctx.params.password
					);
					return ctx;
				},
			},
			async handler(ctx) {
				const newUser = ctx.params;
				const existedUser = await this.adapter.findOne({
					where: {
						email: newUser.email,
					},
				});
				if (existedUser) {
					return Response(ctx, {
						message: "Email is already registered",
					});
				}
				await this.adapter.insert(newUser);
				return Create(ctx, "Sign Up successfully!", newUser);
			},
		},
	},
	methods: {
		hashPassword(password) {
			const salt = bcrypt.genSaltSync(10);
			const hash = bcrypt.hashSync(password, salt);
			return hash;
		},
		generateJWT(payload, ttl) {
			const token = jwt.sign(payload, process.env.SECRETKEY, {
				expiresIn: ttl,
			});
			return token;
		},
		async getPermission(roleId) {
			const document = (
				await this.adapter.db.query(
					// "SELECT resource, action FROM permissions, user_permissions WHERE user_permissions.user_id = :userId AND user_permissions.permission_id=permissions.id",
					"SELECT source,action FROM mockproject.permissions inner join rolepermissions on rolepermissions.role_id=:roleId and permissions.id=rolepermissions.permission_id",
					{
						replacements: { roleId },
						type: Sequelize.SELECT,
					}
				)
			)[PERMISSIONS_INDEX];
			let permission = {};
			_.forEach(document, (value) => {
				const source = value.source;
				const action = value.action;
				permission[source]
					? permission[source].push(action)
					: (permission[source] = [action]);
			});
			return permission;
		},
	},
};
