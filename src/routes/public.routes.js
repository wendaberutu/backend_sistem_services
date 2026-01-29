const router = require("express").Router();
const c = require("../controllers/public.controller");

router.get("/track/:uid", c.track);

module.exports = router;
