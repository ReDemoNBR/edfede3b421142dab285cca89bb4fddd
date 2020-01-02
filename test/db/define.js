const {assert} = require("chai");
const db = require("../../server/db");
const env = require("../../env");

describe("Test database connection and definitions", ()=>{
    it("should connect to database", async()=>{
        const success = await db.authenticate().then(()=>true).catch(e=>e);
        assert.strictEqual(success, true);
    });
    it("should get the database name", ()=>{
        const name = db.getDatabaseName();
        assert.isString(name);
        assert.strictEqual(name, env.DB_NAME);
    });
    it("should drop all tables and models", async()=>{
        const success = await db.drop().then(()=>true).catch(e=>e);
        assert.strictEqual(success, true);
    });
    it("should sync (define all ORM models and create all DB tables)", async()=>{
        const success = await db.sync().then(()=>true).catch(e=>e);
        assert.strictEqual(success, true);
        assert.isOk(db.models);
        Object.keys(db.models).forEach(model=>assert.strictEqual(db.isDefined(model), true));
    });
});