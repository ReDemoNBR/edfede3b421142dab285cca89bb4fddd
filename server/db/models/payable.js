const {DataTypes} = require("sequelize");

module.exports = require("../db").define("payable", {
    userId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: false, // exposing this to remember this is also a foreign key
        unique: false, // exposing this to remember this is also a foreign key
        field: "user_id"
    },
    transactionId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        unique: false // exposing this to remember this is also a foreign key
    },
    status: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    payment: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        get() {
            return new Date(this.getDataValue("payment"));
        },
        set(value) {
            value = new Date(value).toISOString().replace(/T.*$/, "");
            this.setDataValue("payment", value);
        }
    },
    value: {
        type: DataTypes.NUMERIC(20, 2),
        allowNull: false
    }
}, {
    indexes: [
        {fields: ["user_id"], using: "HASH"},
        {fields: ["transaction_id"], using: "HASH"},
        {fields: ["status"], using: "HASH"},
        {fields: ["payment"]}
    ],
    tableName: "payable"
});