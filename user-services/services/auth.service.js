const {
	NotFound,
	Response,
	InputError,
	comparePassword,
	generateJWT,
} = require("../helper");
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
	// async created() {
	// 	console.log("this.adapter.db");
	// },
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
