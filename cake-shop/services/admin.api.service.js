"use strict";
const { Unauthenticated, Unauthorized } = require("../helper");
const ApiGateway = require("moleculer-web");
const Redis = require("ioredis");
const redis = new Redis();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	settings: {
		// Exposed port
		port: process.env.PORT_ADMIN || 3001,

		// Exposed IP
		ip: "0.0.0.0",

		// Global Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
		use: [],

		routes: [
			{
				path: "/api/admin",
				name: "auth",
				aliases: {
					"POST /sign-in": "auth.signIn",
				},
			},

			{
				name: "deliveryInfor",
				path: "/api/admin/deli-infors/",
				authentication: true,
				authorization: true,
				aliases: {
					// admin-handler
					"GET /get-all/": "deliveryinfors.list",
					"GET /by-user/:userId": "deliveryinfors.getByUserId",
					"GET /:id": "deliveryinfors.get",
				},
			},
		],
		// Calling options. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Calling-options
		callingOptions: {},
		autoAliases: true,
		bodyParsers: {
			json: {
				strict: false,
				limit: "1MB",
			},
			urlencoded: {
				extended: true,
				limit: "1MB",
			},
		},

		// Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
		mappingPolicy: "all", // Available values: "all", "restrict"
		mergeParams: true,
		// Enable/disable logging
		logging: true,
		onError(req, res, err) {
			// Return with the error as JSON object
			res.setHeader("Content-type", "application/json; charset=utf-8");
			res.writeHead(err.code || 500);
			let errorObject = {};
			if (err.code == 422) {
				err.data.forEach((e) => {
					let field = e.field;
					errorObject[field] = e.message;
				});
				errorObject.type = "UNPROCESSABLE_ENTITY";
				errorObject.code = 422;
				res.end(JSON.stringify({ errors: errorObject }));
			} else if (err.name == "TokenExpiredError") {
				errorObject = _.pick(err, ["message"]);
				errorObject.type = "JWT_EXPIRED_ERROR";
				errorObject.code = 500;
				res.end(JSON.stringify({ errors: errorObject }));
			} else {
				// pick chỉ lấy field chỉ định
				errorObject = _.pick(err, ["message", "type", "code"]);
				res.end(JSON.stringify({ errors: errorObject }));
			}
			this.logResponse(req, res, err ? err.ctx : null);
		},

		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: null,
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: null,

		// Serve assets from "public" folder. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Serve-static-files
		assets: {
			folder: "public",

			// Options to `server-static` module
			options: {},
		},
	},

	methods: {
		/**
		 * Authenticate the request. It check the `Authorization` token value in the request header.
		 * Check the token value & resolve the user by the token.
		 * The resolved user will be available in `ctx.meta.user`
		 *
		 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		async authenticate(ctx, route, req) {
			// Read the token from header
			const auth = req.headers["authorization"];
			// console.log("auth", auth);
			if (auth && auth.startsWith("Bearer")) {
				const token = auth.split(" ")[1];
				// Check the token. Tip: call a service which verify the token. E.g. `accounts.resolveToken`
				// Or use Promise
				if (token) {
					// Returns the resolved user. It will be set to the `ctx.meta.user`
					const res = jwt.verify(token, process.env.SECRETKEY);
					console.log("res", res);
					const redisToken = await redis.get(res.userId);
					// console.log("redisToken: ", redisToken);
					if (!redisToken) {
						// Invalid token
						throw Unauthenticated();
					}
					ctx.meta.user = res;
					ctx.meta.token = token;
					return res;
				} else {
					// Invalid token
					throw Unauthenticated();
				}
			} else {
				// No token. Throw an error or do nothing if anonymous access is allowed.
				// throw new E.UnAuthorizedError(E.ERR_NO_TOKEN);
				throw Unauthenticated();
			}
		},

		/**
		 * Authorize the request. Check that the authenticated user has right to access the resource.
		 *
		 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		async authorize(ctx, route, req) {
			const { userId, role } = ctx.meta.user;
			if (role == "admin") {
				return;
			} else {
				throw Unauthorized();
			}
		},
	},
};
