// worker/slave thread of the server that access the database

const Express = require("express");
const {SERVER_API_PORT, PROD, MAX_REQUEST_BODY_SIZE} = require("../env");
const app = Express();

app.use(Express.json({limit: MAX_REQUEST_BODY_SIZE}));
app.use(Express.urlencoded({extended: false, limit: MAX_REQUEST_BODY_SIZE}));
app.use(require("compression")());
app.use(require("helmet")());
app.use(require("frameguard")({action: "deny"}));
app.use(require("referrer-policy")({policy: "same-origin"}));

if (PROD) app.enable("trust proxy");
else app.set("json spaces", "\t");
app.set("json replacer", (key, value)=>typeof value==="bigint" && value.toString() || value);
app.set("etag", "strong");
app.use(require("./routes"));

module.exports = new Promise((resolve, reject)=>require("./db").sync().then(()=>app.listen(SERVER_API_PORT).once("listening", ()=>{
    console.info(`Server open on port ${SERVER_API_PORT}`);
    resolve(app);
})).catch(e=>{
    console.error(`Error opening server on port ${SERVER_API_PORT}`);
    console.error(e);
    reject(e);
    process.exit(1);
}));