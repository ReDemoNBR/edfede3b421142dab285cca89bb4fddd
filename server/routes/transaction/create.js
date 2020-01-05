const Transaction = require("../../db/models/transaction");
const PaymentMethod = require("../../db/models/payment-method");
const Payable = require("../../db/models/payable");
const User = require("../../db/models/user");
const db = require("../../db/");
const {isCreditCard} = require("validator");
const BigNumber = require("bignumber.js");

const keys = ["description", "method", "cardNumber", "cardHolder", "cardExpiration", "cvv", "value", "userId"];

module.exports = async(req, res, next)=>{
    const {body} = req;
    for (const key of keys) if (!(key in body)) return res.status(400).send({error: `Property '${key}' is required in POST body`});
    if (!Number(body.value) || Number(body.value)<0) return res.status(400).send({error: "Invalid 'value' in POST body"});
    if (!isCreditCard(body.cardNumber)) return res.status(400).send({error: "Invalid 'cardNumber' in POST body"});
    body.cardExpiration = new Date(body.cardExpiration);
    if (new Date()>body.cardExpiration) return res.status(400).send({error: "Invalid card. It is expired"});
    
    try {
        const method = await PaymentMethod.findOne({where: {name: body.method, active: true}});
        if (!method) return res.status(404).send({error: "Payment Method not found"});
        if (Number(method.feeFixed)>Number(body.value)) return res.status(400).send({error: "Value is too low"});
        const userExists = Boolean(await User.findOne({where: {id: body.userId}, raw: true})); // using raw=true for better performance
        if (!userExists) return res.status(404).send({error: "User not found"});
        let trans;
        
        // create a DB transaction to assure that the payment transaction and the payable instances are created
        await db.transaction(async transaction=>{
            const {userId} = body;
            delete body.userId;
            trans = await Transaction.create(body, {transaction});
            
            // (value-fee_fixed)*(100-fee_percentage)/100
            const value = BigNumber(body.value).minus(BigNumber(method.feeFixed)).times((100-method.feePercentage)/100);
            const payable = {
                userId, transactionId: trans.id,
                payment: new Date(Date.now()+method.waitingDays*24*60*60*1000),
                status: method.waitingDays && "waiting_funds" || "paid",
                value
            };
            await Payable.create(payable, {transaction});
        });
        return res.status(201).send({transactionId: trans.id});
    } catch(e) {
        return next(e);
    }
};