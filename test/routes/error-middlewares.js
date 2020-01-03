const {assert} = require("chai");
const fetch = require("node-fetch");
const worker = require("../../server/worker");
const {SERVER_API_PORT, API_HEADER_NAME, API_HEADER_VALUE} = require("../../env");

before(async()=>{
    await worker;
});

describe("Test middlewares", ()=>{
    it("should return HTTP 406 - Not Acceptable", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/health/ready`, {headers: {Accept: "not-application/not-json"}});
        const body = await response.json();
        assert.isFalse(response.ok);
        assert.strictEqual(response.status, 406);
        assert.strictEqual(response.statusText, "Not Acceptable");
        assert.deepEqual(body, {error: "Not acceptable"});
    });
    it("should return HTTP 404 - Not Found because no route exist", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/this/route/does/not/exist`);
        const body = await response.json();
        assert.isFalse(response.ok);
        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.statusText, "Not Found");
        assert.include(body.error, "Endpoint not found");
    });
    it("should get API name and version in headers", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/`);
        assert.isTrue(response.headers.has(API_HEADER_NAME));
        assert.strictEqual(response.headers.get(API_HEADER_NAME), API_HEADER_VALUE);
    });
});