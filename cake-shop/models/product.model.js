const Sequelize = require("sequelize");
const ProductModel = {
	name: "product",
	define: {
		id: {
			type: Sequelize.UUID,
			primaryKey: true,
			unique: true,
			defaultValue: Sequelize.UUIDV4,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		images: {
			type: Sequelize.JSON,
		},
		price: {
			type: Sequelize.INTEGER,
		},
		description: Sequelize.TEXT,
		rating: {
			type: Sequelize.INTEGER,
			validate: {
				min: 0,
				max: 5,
			},
		},
		comments: Sequelize.JSON,
		categoryId: {
			type: Sequelize.UUID,
			references: {
				model: "categories",
				key: "id",
			},
		},
	},
};
module.exports = ProductModel;
