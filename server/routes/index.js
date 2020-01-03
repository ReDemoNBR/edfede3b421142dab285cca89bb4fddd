const cors = require("cors");
const router = require("express").Router();
const bodyTreat = require("./middlewares/body-treat");

router.options("*", cors());
router.use(cors());
router.use(require("./middlewares/cluster-log"));
router.use(require("./middlewares/api-version"));

router.use(require("./middlewares/accepts"));
router.post(bodyTreat);
router.put(bodyTreat);
router.patch(bodyTreat);
router.use(require("./middlewares/query-limit-offset"));
router.use("/health", require("./health"));
router.use("/user", require("./user"));

router.use(require("./middlewares/not-found"));
router.use(require("./middlewares/error-handler"));

module.exports = router;