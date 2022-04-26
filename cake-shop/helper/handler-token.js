const jwt = require("jsonwebtoken");
const ONE_DAY = 60 * 60 * 24;
const generateJWT = (payload) => {
	const token = jwt.sign(payload, process.env.SECRETKEY, {
		expiresIn: ONE_DAY,
	});
	return token;
};

module.exports = {
	generateJWT,
};
