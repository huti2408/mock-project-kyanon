const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
	NotFound,
	Response,
	InputError,
	Create,
} = require("../helper/response");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const _ = require("lodash");
const UserModel = require("../models/user.model");
const Redis = require("ioredis");
const redis = new Redis();
const ONE_DAY = 60 * 60 * 24;
module.exports = {
	name: "users",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: UserModel,
	actions: {
		signIn: {
			rest: "POST sign-in",
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
				const comparePassword = this.comparePassword(
					password,
					user.password
				);
				if (!comparePassword) {
					return InputError(ctx, "Wrong Password");
				}
				const { role, id } = user;
				const payload = {
					userId: id,
					role,
				};
				// console.log("payload", payload);
				const token = this.generateJWT(payload);
				new Promise((resolve, reject) => {
					resolve(token);
				}).then((token) => {
					redis.setex(user.id, ONE_DAY, token);
				});
				return Response(ctx, { data: { token } });
			},

			// showProfile == /show-profile
			// updateProfile == /update-profile
			// changePassword == /change-password
			// forgotPassword == /forgot-password
			// resetPassword == /reset-password
			showProfile() {},
		},
		// signUp == /sign-up
		signUp: {
			rest: "POST sign-up",
			params: {
				name: "string",
				email: "string|email",
				password: "string|min:6",
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
				const entity = ctx.params;
				const entityExists = await this.adapter.findOne({
					where: {
						email: entity.email,
					},
				});
				if (entityExists) {
					return InputError(ctx, "Email already register");
				}
				const user = await this.adapter.insert(entity);
				return Create(ctx, "Sign up successfully", user);
			},
		},
	},
	methods: {
		hashPassword(password) {
			const salt = bcrypt.genSaltSync(10);
			const hash = bcrypt.hashSync(password, salt);
			return hash;
		},
		comparePassword(password, passwordHash) {
			const check = bcrypt.compareSync(password, passwordHash);
			return check;
		},
		generateJWT(payload) {
			const token = jwt.sign(payload, process.env.SECRETKEY, {
				expiresIn: ONE_DAY,
			});
			return token;
		},
	},
};
