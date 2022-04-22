const { STRING, BOOLEAN, UUID, UUIDV4 } = require("sequelize");
const DeliveryInforModel = {
	name: "deliveryinformation",
	define: {
		id: {
			type: UUID,
			primaryKey: true,
			unique: true,
			defaultValue: UUIDV4,
		},
		receiverName: {
			type: STRING,
			allowNull: false,
		},
		phone: {
			type: STRING,
			allowNull: false,
			validate: {
				notNull: { args: true, msg: "You must enter Phone Number" },
				len: { args: [10, 11], msg: "Phone Number is invalid" },
				isInt: { args: true, msg: "You must enter Phone Number" },
			},
		},
		city: {
			type: STRING,
			allowNull: false,
		},
		district: {
			type: STRING,
			allowNull: false,
		},
		ward: {
			type: STRING,
			allowNull: false,
		},
		detailAddress: {
			type: STRING,
			allowNull: false,
		},
		default: {
			type: BOOLEAN,
			defaultValue: false,
		},
	},
};
module.exports = DeliveryInforModel;
