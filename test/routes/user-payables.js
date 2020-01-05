const {assert} = require("chai");
const fetch = require("node-fetch");
const worker = require("../../server/worker");
const db = require("../../server/db");
const User = require("../../server/db/models/user");
const Payable = require("../../server/db/models/payable");
const PaymentMethod = require("../../server/db/models/payment-method");
const Transaction = require("../../server/db/models/transaction");
const {SERVER_API_PORT} = require("../../env");
const sampleUser = {name: "hello", email: "hello@example.com"};
const sampleMethod = {name: "debit", feeFixed: 0, feePercentage: 4.2, waitingDays: 0};
const samplePayments = [
    {
        transaction: {
            description: "Xiaomi Mi9", value: "1000.87", cardNumber: "85239631995127410",
            cardHolder: "John Smith", cardExpiration: new Date(), cvv: 123
        },
        payable: {status: "paid", payment: new Date(), value: "800.23"}
    },
    {
        transaction: {
            description: "Samsung Galaxy S10 Plus", value: "5000.87", cardNumber: "85239631995127410",
            cardHolder: "John Smith", cardExpiration: new Date(), cvv: 123
        },
        payable: {status: "waiting_funds", payment: new Date(), value: "4800.23"}
    }
];

let tmpUser;

// eslint-disable-next-line max-lines-per-function
describe("Test user payable routes", ()=>{
    before(async()=>{
        await db.drop();
        await db.sync();
        tmpUser = await User.create(sampleUser);
        const method = await PaymentMethod.create(sampleMethod);
        for (const payment of samplePayments) {
            // eslint-disable-next-line no-await-in-loop
            const transaction = await Transaction.create({...payment.transaction, paymentMethodId: method.id});
            // eslint-disable-next-line no-await-in-loop
            await Payable.create({...payment.payable, transactionId: transaction.id, userId: tmpUser.id});
        }
        await worker;
    });
    after(async()=>{
        await db.drop();
    });
    it("should get user payables", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${tmpUser.id}/payable`);
        const body = await response.json();
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.statusText, "OK");
        assert.lengthOf(body, samplePayments.length);
        body.forEach((payable, index)=>{
            const {payable: samplePayable} = samplePayments[index];
            assert.strictEqual(payable.status, samplePayable.status);
            assert.strictEqual(payable.value, samplePayable.value);
            const payment = new Date(payable.payment);
            assert.strictEqual(payment.getUTCFullYear(), samplePayable.payment.getUTCFullYear());
            assert.strictEqual(payment.getUTCMonth(), samplePayable.payment.getUTCMonth());
            assert.strictEqual(payment.getUTCDate(), samplePayable.payment.getUTCDate());
        });
    });
    it("should get the correct funds in his account", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${tmpUser.id}`);
        const body = await response.json();
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.statusText, "OK");
        assert.strictEqual(body.available, samplePayments.find(payment=>payment.payable.status==="paid").payable.value);
        assert.strictEqual(body.waitingFunds, samplePayments.find(payment=>payment.payable.status==="waiting_funds").payable.value);
    });
});