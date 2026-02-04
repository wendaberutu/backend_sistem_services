const router = require("express").Router();
const c = require("../controllers/category.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get("/", auth, role("admin"), c.getAll);
router.post("/", auth, role("admin"), c.create);
router.delete("/:id", auth, role("admin"), c.remove);
module.exports = router;
