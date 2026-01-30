const router = require("express").Router();
const c = require("../controllers/jobs.controller");

router.get("/", c.getAll);
router.get("/technician/:techId", c.getForTechnician);

router.post("/", c.create);

router.patch("/:id/assign", c.assign);
router.patch("/:id/claim", c.claim);
router.patch("/:id/status", c.updateStatus);

router.get("/:id/actions", c.actions);
router.post("/:id/actions", c.addAction);

router.post("/:id/used-parts", c.usePart);

router.post("/:id/verify", c.verify);

module.exports = router;
