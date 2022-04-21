const message = {
	GET: "Get completed",
	CREATE: "Create completed",
	UPDATE: "Update completed",
	DELETE: "Delete completed",
};
const response = (ctx, data, statusCode = 200) => {
	ctx.meta.$statusCode = statusCode;
	return data;
};
const Get = (ctx, data) => {
	return response(ctx, { message: message.GET, data }, 200);
};
const Create = (ctx, msg, data) => {
	return response(
		ctx,
		{ message: `${msg === null ? message.CREATE : msg}`, data },
		201
	);
};
const Update = (ctx, data) => {
	return response(ctx, {
		message: message.UPDATE,
		data,
	});
};

const Delete = (ctx, data) => {
	return response(ctx, {
		message: message.DELETE,
		data,
	});
};

const ServerError = (ctx, message) => {
	return response(ctx, { message }, 500);
};

const Unauthenticated = (ctx) => {
	return response(ctx, { message: message.UNAUTHENTICATE }, 401);
};
const Unauthorized = (ctx) => {
	return response(ctx, { message: message.UNAUTHORIZE }, 403);
};
const BadRequest = (ctx, message) => {
	return response(ctx, { message }, 400);
};

const NotFound = (ctx, input) => {
	return response(ctx, { message: `${input} not found` }, 404);
};
module.exports = {
	Get,
	Create,
	Update,
	Delete,
	ServerError,
	BadRequest,
	Unauthorized,
	Unauthenticated,
	NotFound,
	response,
};
