const {underscore} = require("inflection");

const db = require("./db");

const Payable = require("./models/payable");
const PaymentMethod = require("./models/payment-method");
const Transaction = require("./models/transaction");
const User = require("./models/user");

const fk = (name, unique=false, as=undefined, allowNull=false)=>({foreignKey: {name, field: underscore(name), unique, allowNull}, as});

Payable.belongsTo(User, fk("userId"));
User.hasMany(Payable, fk("userId"));
Payable.belongsTo(Transaction, fk("transactionId"));
Transaction.hasOne(Payable, fk("transactionId"));

PaymentMethod.hasMany(Transaction, fk("paymentMethodId"));
Transaction.belongsTo(PaymentMethod, fk("paymentMethodId"));

module.exports = db;