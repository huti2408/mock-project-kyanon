const bcrypt = require("bcrypt");
const hashPassword = (password) => {
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	return hash;
};
const comparePassword = (password, passwordHash) => {
	const check = bcrypt.compareSync(password, passwordHash);
	return check;
};
module.exports = {
	hashPassword,
	comparePassword,
};
