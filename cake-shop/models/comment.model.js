const Sequelize = require("sequelize");
const CommentModel = {
	name: "comment",
	define: {
		id: {
			type: Sequelize.UUID,
			primaryKey: true,
			unique: true,
			defaultValue: Sequelize.UUIDV4,
		},
		content: {
			type: Sequelize.TEXT,
			allowNull: false,
			validate: {
				notNull: true,
			},
		},
		rating: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
			validate: {
				min: 0,
				max: 5,
			},
		},
		user_id: {
			type: Sequelize.UUID,
			references: {
				model: "users",
				key: "id",
			},
		},
		order_id: {
			type: Sequelize.UUID,
			references: {
				model: "orders",
				key: "id",
			},
		},
	},
};
module.exports = CommentModel;
