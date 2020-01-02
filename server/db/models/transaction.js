const {DataTypes} = require("sequelize");

module.exports = require("../db").define("transaction", {
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
            return this.getDataValue("cardNumber")?.toString().padStart(16, "*");
        },
        set(value) {
            this.setDataValue("cardNumber", value.substring(value.length-4));
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
        field: "card_expiration",
        get() {
            return new Date(this.getDataValue("cardExpiration"));
        },
        set(value) {
            value = new Date(value);
            value.setUTCDate(1); // set date to 1 => YYYY/MM/01
            value = value.toISOString().replace(/T.*$/, "");
            this.setDataValue("cardExpiration", value);
        }
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