const router = require("express").Router();
const c = require("../controllers/users.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

router.get("/", auth, requireRole(["admin"]), c.getAll);
router.post("/", auth, requireRole(["admin"]), c.create);

module.exports = router;
