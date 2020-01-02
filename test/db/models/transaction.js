const {assert} = require("chai");
const sample = {description: "Xiaomi Mi9", value: "1000.87", cardNumber: "85239631995127410", cardHolder: "John Smith", cardExpiration: new Date(), cvv: 123};

const Transaction = require("../../../server/db/models/transaction");
const PaymentMethod = require("../../../server/db/models/payment-method");
const db = require("../../../server/db");


describe("Test transaction database model", ()=>{
    before(async()=>{
        await db.drop();
        await db.sync();
        const paymentMethod = await PaymentMethod.create({name: "debit", feeFixed: 1, feePercentage: 5}); // sample payment method
        sample.paymentMethodId = paymentMethod.id;
    });

    it("should create a transaction", async()=>{
        const transaction = await Transaction.create(sample);
        assert.isObject(transaction);
        assert.isString(transaction.id); // uuidv1
        assert.strictEqual(transaction.description, sample.description);
        
        // not using strictEqual because in DB it is stored as NUMERIC (which is parsed back as string for numeric precision)
        assert.equal(transaction.value, sample.value);
        assert.notEqual(transaction.cardNumber, sample.cardNumber); // assuring that the credit card is not stored
        assert.match(transaction.cardNumber, /^\*{12}\d{4}$/);
        assert.match(transaction.cardNumber, new RegExp(`${sample.cardNumber.substring(sample.cardNumber.length-4)}$`));
        assert.strictEqual(transaction.cardHolder, sample.cardHolder);
        assert.strictEqual(transaction.cvv, sample.cvv);
        
        // asserting cardExpiration year and month
        assert.strictEqual(transaction.cardExpiration.getUTCFullYear(), sample.cardExpiration.getUTCFullYear());
        assert.strictEqual(transaction.cardExpiration.getUTCMonth(), sample.cardExpiration.getUTCMonth());
        assert.strictEqual(transaction.cardExpiration.getUTCDate(), 1); // should be saved as YYYY/MM/01
    });
    it("should read the transaction that was just created", async()=>{
        const transaction = await Transaction.findOne({where: {description: sample.description, cardHolder: sample.cardHolder, value: sample.value}});
        assert.isObject(transaction);
        assert.isString(transaction.id); // uuidv1
        assert.strictEqual(transaction.description, sample.description);
        
        // not using strictEqual because in DB it is stored as NUMERIC (which is parsed back as string for numeric precision)
        assert.equal(transaction.value, sample.value);
        assert.notEqual(transaction.cardNumber, sample.cardNumber); // assuring that the credit card is not stored
        assert.match(transaction.cardNumber, /^\*{12}\d{4}$/);
        assert.match(transaction.cardNumber, new RegExp(`${sample.cardNumber.substring(sample.cardNumber.length-4)}$`));
        assert.strictEqual(transaction.cardHolder, sample.cardHolder);
        assert.strictEqual(transaction.cvv, sample.cvv);
    });
    it("should update the transaction entry", async()=>{
        const newValue = "Apple iPhone X";
        await Transaction.update({description: newValue}, {where: {description: sample.description}});
        const transaction = await Transaction.findOne({where: {value: sample.value, cardHolder: sample.cardHolder}});
        assert.isObject(transaction);
        assert.equal(transaction.description, newValue);
    });
    it("should delete the transaction entry (only one!)", async()=>{
        const deleteCount = await Transaction.destroy({where: {value: sample.value, cardHolder: sample.cardHolder}});
        assert.strictEqual(deleteCount, 1);
        const transaction = await Transaction.findOne({where: {value: sample.value, cardHolder: sample.cardHolder}});
        assert.isNull(transaction);
    });
});