const {assert} = require("chai");
const fetch = require("node-fetch");
const worker = require("../../server/worker");
const db = require("../../server/db")
const {SERVER_API_PORT, DEFAULT_LIMIT, DEFAULT_MAX_LIMIT} = require("../../env");
const sample1 = {name: "John Smith", email: "johnsmith@example.com"};
const sample2 = {name: "John Doe", email: "johndoe@example.com"};
const sample3 = {name: "Jane Doe", email: "janedoe@example.com"};
const sample4 = {name: "Random Name", email: "random@example.com"};
const sample5 = {name: "Unnamed", email: "me@example.com"};

const headers = {"Content-Type": "application/json"};

before(async()=>{
    await db.drop();
    await worker;
});

let tmpUser;

// eslint-disable-next-line max-lines-per-function
describe("Test user CRUD", ()=>{
    it("should find no user", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user`);
        const body = await response.json();
        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.statusText, "Not Found");
        assert.property(body, "error");
    });
    it("should create an user", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user`, {method: "POST", headers, body: JSON.stringify(sample1)});
        const body = await response.json();
        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.statusText, "Created");
        assert.strictEqual(body.name, sample1.name);
        assert.strictEqual(body.email, sample1.email);
        assert.isNumber(parseInt(body.id));
        tmpUser = body;
    });
    it("should read the user that was just created", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${tmpUser.id}`);
        const body = await response.json();
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.statusText, "OK");
        assert.strictEqual(body.id, tmpUser.id);
        assert.strictEqual(body.name, tmpUser.name);
    });
    it("should NOT create an user because it has the same email", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user`, {method: "POST", headers, body: JSON.stringify(sample1)});
        const body = await response.json();
        assert.strictEqual(response.status, 409);
        assert.strictEqual(response.statusText, "Conflict");
        assert.include(body.error, "unique");
    });
    it("should NOT create an user because it email is undefined", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user`, {method: "POST", headers, body: JSON.stringify({name: "hello"})});
        const body = await response.json();
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.statusText, "Bad Request");
        assert.include(body.error, "email");
        assert.include(body.error, "required");
    });
    it("should NOT create an user because it email is an empty string", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user`, {method: "POST", headers, body: JSON.stringify({name: "hello", email: ""})});
        const body = await response.json();
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.statusText, "Bad Request");
        assert.include(body.error, "email");
        assert.include(body.error, "required");
    });
    it("should NOT create an user because it email is invalid", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user`, {
            method: "POST", headers,
            body: JSON.stringify({name: "hello", email: "this is not an email"})
        });
        const body = await response.json();
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.statusText, "Bad Request");
        assert.include(body.error, "Invalid email");
    });
    it("should NOT create an user because it name is an empty string", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user`, {
            method: "POST", headers,
            body: JSON.stringify({name: "", email: "hello@example.com"})
        });
        const body = await response.json();
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.statusText, "Bad Request");
        assert.include(body.error, "name");
        assert.include(body.error, "required");
    });
    it("should NOT create an user because it name is undefined", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user`, {method: "POST", headers, body: JSON.stringify({email: "hello@example.com"})});
        const body = await response.json();
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.statusText, "Bad Request");
        assert.include(body.error, "name");
        assert.include(body.error, "required");
    });
    it("should create more users", async()=>{
        for (const user of [sample2, sample3, sample4, sample5]) {
            // eslint-disable-next-line no-await-in-loop
            const response = await fetch(`http://localhost:${SERVER_API_PORT}/user`, {method: "POST", headers, body: JSON.stringify(user)});
            // eslint-disable-next-line no-await-in-loop
            const body = await response.json();
            assert.strictEqual(response.status, 201);
            assert.strictEqual(response.statusText, "Created");
            assert.strictEqual(body.name, user.name);
            assert.strictEqual(body.email, user.email);
            assert.isNumber(parseInt(body.id));
        }
    });
    it(`should read ${DEFAULT_MAX_LIMIT} users because this is the max limit (limit set to this value for testing purposes only)`, async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user?limit=10`);
        const body = await response.json();
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.statusText, "OK");
        assert.lengthOf(body, DEFAULT_MAX_LIMIT);
    });
    it(`should read ${DEFAULT_LIMIT} users because the limit is omitted`, async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user`);
        const body = await response.json();
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.statusText, "OK");
        assert.lengthOf(body, DEFAULT_LIMIT);
    });
    it("should NOT update the user because name is required", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${tmpUser.id}`, {
            method: "PUT", headers,
            body: JSON.stringify({email: "hello@example.com"})
        });
        const body = await response.json();
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.statusText, "Bad Request");
        assert.include(body.error, "name");
        assert.include(body.error, "required");
    });
    it("should NOT update the user because email is required", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${tmpUser.id}`, {
            method: "PUT", headers,
            body: JSON.stringify({name: "hello"})
        });
        const body = await response.json();
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.statusText, "Bad Request");
        assert.include(body.error, "email");
        assert.include(body.error, "required");
    });
    it("should NOT update the user because email already exists", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${tmpUser.id}`, {
            method: "PUT", headers,
            body: JSON.stringify({name: "hello", email: sample2.email})
        });
        const body = await response.json();
        assert.strictEqual(response.status, 409);
        assert.strictEqual(response.statusText, "Conflict");
        assert.include(body.error, "Email");
        assert.include(body.error, "exists");
    });
    it("should NOT update the user because email is invalid", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${tmpUser.id}`, {
            method: "PUT", headers,
            body: JSON.stringify({name: "hello", email: "this is not an email"})
        });
        const body = await response.json();
        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.statusText, "Bad Request");
        assert.include(body.error, "Invalid email");
    });
    it("should update the user", async()=>{
        const newName = "hello";
        const newEmail = "hello@world.com";
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${tmpUser.id}`, {
            method: "PUT", headers,
            body: JSON.stringify({name: newName, email: newEmail})
        });
        const body = await response.text();
        assert.strictEqual(response.status, 204);
        assert.strictEqual(response.statusText, "No Content");
        assert.isEmpty(body);
    });
    it("should patch the name", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${tmpUser.id}`, {
            method: "PATCH", headers,
            body: JSON.stringify({name: tmpUser.name})
        });
        const body = await response.json();
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.statusText, "OK");
        assert.strictEqual(body.name, tmpUser.name);
    });
    it("should delete the user because ID is not found", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${Number.MAX_SAFE_INTEGER}`, {method: "DELETE"});
        const body = await response.json();
        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.statusText, "Not Found");
        assert.property(body, "error");
    });
    it("should delete the user because ID", async()=>{
        const response = await fetch(`http://localhost:${SERVER_API_PORT}/user/${tmpUser.id}`, {method: "DELETE"});
        const body = await response.text();
        assert.strictEqual(response.status, 204);
        assert.strictEqual(response.statusText, "No Content");
        assert.isEmpty(body);
    });
});