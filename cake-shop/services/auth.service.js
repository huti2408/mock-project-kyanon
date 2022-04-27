
const {
	NotFound,
	Response,
	InputError,
	comparePassword,
	generateJWT,
} = require("../helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { NotFound, Create, Response } = require("../helper/response");

const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const UserModel = require("../models/user.model");
const Redis = require("ioredis");

const redis = new Redis();
const ONE_DAY = 60 * 60 * 24;
module.exports = {
	name: "auth",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: UserModel,

	async started() {
		this.adapter.db.sync({ alter: true });
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

				const match = comparePassword(password, user.password);
				if (!match) {
					return InputError(ctx, "Wrong Password");

				console.log(user, password);
				const comparePassword = bcrypt.compareSync(
					password,
					user.password
				);
				if (!comparePassword) {
					return Response(ctx, { message: "Wrong password" });
				}
				const { role, id } = user;
				const payload = {
					userId: id,
					role,
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
	},
	methods: {},
};
