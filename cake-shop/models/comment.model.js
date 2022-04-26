const Sequelize = require("sequelize");
const categoryModel = {
	name: "category",
	define: {
		id: {
			type: Sequelize.UUID,
			primaryKey: true,
			unique: true,
			defaultValue: Sequelize.UUIDV4,
		},
		content: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		rating: {
			type: Sequelize.STRING,
		},
		user: {
			type: Sequelize.UUID,
			references: {
				model: "users",
				key: "id",
			},
		},
		order: {
			type: Sequelize.UUID,
			references: {
				model: "orders",
				key: "id",
			},
		},
	},
};
module.exports = categoryModel;
