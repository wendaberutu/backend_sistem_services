const router = require("express").Router();
const c = require("../controllers/inventory.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware"); 


router.get("/", auth, role("admin"), c.getAll);
router.post("/", auth, role("admin"), c.create);
router.post("/use", auth, role("admin"), c.use);

module.exports = router;
