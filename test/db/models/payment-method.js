const {assert} = require("chai");
const sample1 = {name: "debit", feeFixed: 0, feePercentage: 4.2};
const sample2 = {name: "credit", feeFixed: 2, feePercentage: 5, active: false};

const PaymentMethod = require("../../../server/db/models/payment-method");
const db = require("../../../server/db");


describe("Test payment method database model", ()=>{
    before(async()=>{
        await db.drop();
        await db.sync();
    });
    it("should create a payment method with active=true as default", async()=>{
        const paymentMethod = await PaymentMethod.create(sample1);
        assert.isObject(paymentMethod);
        assert.strictEqual(paymentMethod.id, 1n);
        assert.strictEqual(paymentMethod.name, sample1.name);
        
        // not using strictEqual because in DB it is stored as NUMERIC (which is parsed back as string for numeric precision)
        assert.equal(paymentMethod.feeFixed, sample1.feeFixed);
        assert.equal(paymentMethod.feePercentage, sample1.feePercentage);
        assert.strictEqual(paymentMethod.active, true); // testing if default value was set
    });
    it("should read the payment method that was just created", async()=>{
        const paymentMethod = await PaymentMethod.findByPk(1);
        assert.isObject(paymentMethod);
        assert.strictEqual(paymentMethod.id, 1n);
        assert.strictEqual(paymentMethod.name, sample1.name);
        assert.equal(paymentMethod.feeFixed, sample1.feeFixed);
        assert.equal(paymentMethod.feePercentage, sample1.feePercentage);
        assert.strictEqual(paymentMethod.active, true); // testing if default value was set
    });
    it("should create a payment method with setting active=false", async()=>{
        const paymentMethod = await PaymentMethod.create(sample2);
        assert.isObject(paymentMethod);
        assert.strictEqual(paymentMethod.id, 2n);
        assert.strictEqual(paymentMethod.name, sample2.name);
        assert.equal(paymentMethod.feeFixed, sample2.feeFixed);
        assert.equal(paymentMethod.feePercentage, sample2.feePercentage);
        assert.strictEqual(paymentMethod.active, false); // testing if default value was set
    });
    it("should have 2 entries in table", async()=>{
        const count = await PaymentMethod.count();
        assert.strictEqual(count, 2);
    });
    it("should update the debit entry", async()=>{
        const newFee = 10;
        await PaymentMethod.update({feeFixed: newFee}, {where: {name: sample1.name}});
        const paymentMethod = await PaymentMethod.findOne({where: {name: sample1.name}});
        assert.isObject(paymentMethod);
        assert.equal(paymentMethod.feeFixed, newFee);
    });
    it("should delete the 'debit' entry (only one!)", async()=>{
        const deleteCount = await PaymentMethod.destroy({where: {name: sample1.name}});
        assert.strictEqual(deleteCount, 1);
        const paymentMethod = await PaymentMethod.findOne({where: {name: sample1.name}});
        assert.isNull(paymentMethod);
    });
});