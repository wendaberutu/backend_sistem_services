const router = require("express").Router();
const c = require("../controllers/jobs.controller");

router.get("/", c.getAll);
router.post("/", c.create);
router.patch("/:id/status", c.updateStatus);
router.get("/:id/actions", c.actions);
router.post("/:id/actions", c.addAction);

module.exports = router;
