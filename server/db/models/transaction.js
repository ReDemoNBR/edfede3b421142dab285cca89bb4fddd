const {DataTypes} = require("sequelize");

module.exports = require("../db").define("account", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.NUMERIC(20, 2),
        allowNull: false
    },
    cardNumber: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        comment: "only the last 4 digits are stored",
        get() {
            return this.getDataValue("cardNumber").toString().padStart(16, "*");
        },
        set(value) {
            this.setDataValue("cardNumber", value.substring(12));
        },
        field: "card_number"
    },
    cardHolder: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "card_holder"
    },
    cardExpiration: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "card_expiration"
    },
    cvv: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
}, {
    indexes: [
        {fields: ["description"]},
        {fields: ["value"]}
    ],
    tableName: "transaction"
});