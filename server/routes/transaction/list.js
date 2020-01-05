const PaymentMethod = require("../../db/models/payment-method");
const Transaction = require("../../db/models/transaction");
const Payable = require("../../db/models/payable");
const User = require("../../db/models/user");
const sortOptions = ["description", "value", "created"];
const {col} = require("sequelize");

module.exports = async(req, res, next)=>{
    const {query: {limit, offset, sortDirection}} = req;
    let {query: {sort}} = req;
    sort = sort?.toLowerCase() ?? "created";
    if (!sortOptions.includes(sort)) return res.status(400).send({error: `Invalid 'sort' in query string. Options are: ${sortOptions.join(", ")}`});
    
    try {
        const transactions = await Transaction.findAll({
            attributes: {
                exclude: ["paymentMethodId"],
                include: [
                    [col("paymentMethod.name"), "paymentMethod"],
                    [col("user.name"), "userName"],
                    [col("user.email"), "userEmail"]
                ]
            },
            include: [{
                model: PaymentMethod,
                attributes: [],
                required: true
            }, {
                model: Payable,
                attributes: [],
                required: true,
                include: [{
                    model: User,
                    attributes: [],
                    required: true
                }]
            }],
            order: [[sort, sortDirection], ["created", "ASC"]],
            limit, offset
        });
        if (!transactions?.length) return res.status(404).send({error: "No transaction found"});
        return res.send(transactions);
    } catch(e) {
        return next(e);
    }
};