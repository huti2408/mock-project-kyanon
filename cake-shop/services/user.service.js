const SqlAdapter = require("moleculer-db-adapter-sequelize");
const DbService = require("moleculer-db");
const { Get, InputError, Create, hashPassword } = require("../helper");
const UserModel = require("../models/user.model");
module.exports = {
	name: "users",
	mixins: [DbService],
	adapter: new SqlAdapter(process.env.MySQL_URI),
	model: UserModel,
	// async started() {
	// 	this.adapter.db.sync({ alter: true });
	// },
	hooks: {
		after: {
			signup: function (ctx, res) {
				delete res.data.dataValues.password;
				return res;
			},
		},
	},
	actions: {
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
					ctx.params.password = hashPassword(ctx.params.password);
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
		// update-delivery-default
		updateDeliveryDefault: {
			params: {
				userId: "string",
				deliveryId: "string",
			},
			async handler(ctx) {
				const { userId, deliveryId } = ctx.params;
				const updatedAt = new Date();
				const updateUser = {
					deliveryDefault: deliveryId,
					updatedAt,
				};
				await this.adapter.updateById(userId, {
					$set: updateUser,
				});
				return;
			},
		},

		// showProfile == /show-profile
		showProfile: {
			rest: "GET /profile",
			async handler(ctx) {
				const user = await this.adapter.findById(ctx.meta.user.userId);
				return Get(ctx, user);
			},
		},
		// updateProfile == /update-profile
		// changePassword == /change-password
		// forgotPassword == /forgot-password
		// resetPassword == /reset-password
	},
	methods: {},
};
