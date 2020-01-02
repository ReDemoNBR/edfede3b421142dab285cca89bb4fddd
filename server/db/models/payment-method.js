const {DataTypes} = require("sequelize");

module.exports = require("../db").define("paymentMethod", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true,
        autoIncrementIdentity: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    feeFixed: {
        type: DataTypes.NUMERIC(20, 2),
        allowNull: false,
        defaultValue: 0, // using default as 0 as in the description of the problem it is not used
        comment: "possible fixed fee to use along with the percentage of the transaction",
        field: "fee_fixed"
    },
    feePercentage: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        comment: "% of the transaction",
        field: "fee_percentage"
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    indexes: [
        {fields: ["fee_fixed"]},
        {fields: ["fee_percentage"]}
    ],
    tableName: "payment_method"
});