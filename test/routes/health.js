const {assert} = require("chai");
const fetch = require("node-fetch");
const worker = require("../../server/worker");
const db = require("../../server/db");
const {
    SERVER_API_PORT, PROCESS_WORKERS_COUNT, DEFAULT_LIMIT, DEFAULT_MAX_LIMIT,
    DB_TIMEZONE, API_HEADER_NAME, API_HEADER_VALUE, MAX_REQUEST_BODY_SIZE
} = require("../../env");


describe("Test health check routes", ()=>{
    before(async()=>{
        await db.drop();
        await db.sync();
        await worker;
    });
    it("should check that the server is running", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/health/ready`);
        const body = await response.text();
        assert.strictEqual(response.status, 204);
        assert.isEmpty(body);
    });
    it("should check status of the server", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/health/status`);
        const body = await response.json();
        assert.strictEqual(response.status, 200);
        assert.strictEqual(body.status, "OK");
        assert.isObject(body.operatingSystem);
        assert.isObject(body.process);
        assert.isObject(body.application);
    });
    it("should check if the API shows the correct environment variables", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/health/status`);
        const {application} = await response.json();
        assert.strictEqual(application.workers, PROCESS_WORKERS_COUNT);
        assert.strictEqual(application.defaultLimit, DEFAULT_LIMIT);
        assert.strictEqual(application.defaultMaxLimit, DEFAULT_MAX_LIMIT);
        assert.strictEqual(application.databaseTimezone, DB_TIMEZONE);
        assert.strictEqual(application.httpHeader, API_HEADER_NAME);
        assert.strictEqual(application.version, API_HEADER_VALUE);
        assert.strictEqual(application.maxRequestBodySize, MAX_REQUEST_BODY_SIZE);
    });
});