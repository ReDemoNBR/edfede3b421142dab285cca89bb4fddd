const {assert} = require("chai");
const sample = {status: "paid", payment: new Date(), value: "800.23"};

const Payable = require("../../../server/db/models/payable");
const PaymentMethod = require("../../../server/db/models/payment-method");
const Transaction = require("../../../server/db/models/transaction");
const User = require("../../../server/db/models/user");
const db = require("../../../server/db");


describe("Test payable method database model", ()=>{
    before(async()=>{
        await db.drop();
        await db.sync();
        const paymentMethod = await PaymentMethod.create({name: "debit", feeFixed: 1, feePercentage: 5}); // sample payment method
        const transaction = await Transaction.create({
            description: "Xiaomi Mi9", value: "1000.87", cardNumber: "85239631995127410",
            cardHolder: "John Smith", cardExpiration: new Date(), cvv: 123,
            paymentMethodId: paymentMethod.id
        });
        const user = await User.create({name: "John Smith", email: "johnsmith@example.com"});
        sample.userId = user.id;
        sample.transactionId = transaction.id;
    });

    it("should create a payable", async()=>{
        const payable = await Payable.create(sample);
        assert.isObject(payable);
        assert.strictEqual(payable.transactionId, sample.transactionId);
        assert.strictEqual(payable.userId, sample.userId);
        assert.strictEqual(payable.status, sample.status);
        
        // not using strictEqual because in DB it is stored as NUMERIC (which is parsed back as string for numeric precision)
        assert.equal(payable.value, sample.value);
        
        // asserting payment year, month and date
        assert.strictEqual(payable.payment.getUTCFullYear(), sample.payment.getUTCFullYear());
        assert.strictEqual(payable.payment.getUTCMonth(), sample.payment.getUTCMonth());
        assert.strictEqual(payable.payment.getUTCDate(), sample.payment.getUTCDate()); // should be saved as YYYY/MM/01
    });
    it("should read the payable that was just created", async()=>{
        const payable = await Payable.findOne({where: {userId: sample.userId, transactionId: sample.transactionId}});
        assert.isObject(payable);
        assert.strictEqual(payable.transactionId, sample.transactionId);
        assert.strictEqual(payable.userId, sample.userId);
        assert.strictEqual(payable.status, sample.status);
        
        // not using strictEqual because in DB it is stored as NUMERIC (which is parsed back as string for numeric precision)
        assert.equal(payable.value, sample.value);
        
        // asserting payment year, month and date
        assert.strictEqual(payable.payment.getUTCFullYear(), sample.payment.getUTCFullYear());
        assert.strictEqual(payable.payment.getUTCMonth(), sample.payment.getUTCMonth());
        assert.strictEqual(payable.payment.getUTCDate(), sample.payment.getUTCDate()); // should be saved as YYYY/MM/01
    });
    it("should update the payable entry", async()=>{
        const newStatus = "waiting";
        await Payable.update({status: newStatus}, {where: {userId: sample.userId, transactionId: sample.transactionId}});
        const payable = await Payable.findOne({where: {userId: sample.userId, transactionId: sample.transactionId}});
        assert.isObject(payable);
        assert.equal(payable.status, newStatus);
    });
    it("should delete the payable entry (only one!)", async()=>{
        const deleteCount = await Payable.destroy({where: {userId: sample.userId, transactionId: sample.transactionId}});
        assert.strictEqual(deleteCount, 1);
        const payable = await Payable.findOne({where: {userId: sample.userId, transactionId: sample.transactionId}});
        assert.isNull(payable);
    });
});