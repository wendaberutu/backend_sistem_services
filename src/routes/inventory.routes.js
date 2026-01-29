const router = require("express").Router();
const c = require("../controllers/inventory.controller");

router.get("/", c.getAll);
router.post("/", c.create);
router.post("/use", c.use);

module.exports = router;
