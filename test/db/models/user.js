const {assert} = require("chai");
const sample = {name: "hello", email: "hello@example.com"};

const {Op: {startsWith}} = require("sequelize");
const User = require("../../../server/db/models/user");
const db = require("../../../server/db");


describe("Test user database model", ()=>{
    before(async()=>{
        await db.drop();
        await db.sync();
    });
    it("should create an user", async()=>{
        const user = await User.create(sample);
        assert.isObject(user);
        assert.strictEqual(user.id, 1n);
        assert.strictEqual(user.name, sample.name);
        assert.strictEqual(user.email, sample.email);
    });
    it("should read the user that was just created", async()=>{
        const user = await User.findOne({where: {name: sample.name, email: sample.email}});
        assert.isObject(user);
        assert.strictEqual(user.id, 1n);
        assert.strictEqual(user.name, sample.name);
        assert.strictEqual(user.email, sample.email);
    });
    it("should not create an user with non-unique email", async()=>{
        const error = await User.create(sample).catch(e=>e);
        assert.instanceOf(error, Error);
        assert.strictEqual(error.name, "SequelizeUniqueConstraintError");
        assert.isObject(error.fields);
        assert.ownInclude(error.fields, {email: sample.email});
    });
    it("should update the user to have '.br' in the end of the email", async()=>{
        const newEmail = `${sample.email}.br`;
        await User.update({email: `${sample.email}.br`}, {where: {email: sample.email}});
        const user = await User.findOne({where: {email: newEmail}});
        assert.isObject(user);
        assert.strictEqual(user.email, newEmail);
    });
    it("should delete the user (only one!)", async()=>{
        const deleteCount = await User.destroy({where: {email: {[startsWith]: sample.email}}});
        assert.strictEqual(deleteCount, 1);
        const user = await User.findOne({where: {email: {[startsWith]: sample.email}}});
        assert.isNull(user);
    });
});