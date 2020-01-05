const router = require("express").Router();

router.post("/", require("./create"));
router.get("/", require("./list"));

module.exports = router;