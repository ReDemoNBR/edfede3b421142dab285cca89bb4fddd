// this script is not supposed to be used as a module, but as a oneshot, possibly as a child process

const db = require("../server/db");

db.sync()
    .then(()=>process.exit(0))
    .catch(e=>console.error("Error creating tables") || console.error(e) || process.exit(1));