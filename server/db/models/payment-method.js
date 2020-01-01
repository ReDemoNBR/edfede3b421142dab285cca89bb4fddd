const {DataTypes} = require("sequelize");

module.exports = require("../db").define("account", {
    id: {
        type: DataTypes.BIGINT,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
        allowNull: false,
        unique: true
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
    tableName: "transaction"
});