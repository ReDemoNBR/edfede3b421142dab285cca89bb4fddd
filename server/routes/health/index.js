const router = require("express").Router();

router.get("/ready", require("./ready"));
router.get("/status", require("./status"));

module.exports = router;