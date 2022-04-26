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
			validate: {
				notNull: false,
			},
			unique: true,
		},
		images: {
			type: Sequelize.JSON,
			defaultValue: "[https://via.placeholder.com/500]",
		},
		price: {
			type: Sequelize.INTEGER,
			validate: {
				notNull: false,

				min: 0,
			},
		},
		description: Sequelize.TEXT,
		averageRating: {
			type: Sequelize.FLOAT,
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
