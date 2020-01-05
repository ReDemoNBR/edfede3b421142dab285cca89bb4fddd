const router = require("express").Router();

router.post("/", require("./create"));
router.get("/:id/payable", require("./payables/list"));
router.get("/:id", require("./read"));
router.get("/", require("./list"));
router.put("/:id", require("./update"));
router.patch("/:id", require("./patch"));
router.delete("/:id", require("./delete"));

module.exports = router;