const {DataTypes, fn} = require("sequelize");

module.exports = require("../db").define("user", {
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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {isEmail: true}
    }
}, {
    indexes: [
        {fields: ["name"]},
        {fields: [fn("LOWER", "name")], name: "account_lower_name"},
        {fields: ["email"], using: "HASH"}
    ],
    tableName: "user"
});