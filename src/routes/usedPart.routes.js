const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const { addUsedPart } = require("../controllers/usedParts.controller");

// Teknisi pakai sparepart
router.post(
  "/jobs/:id/parts",
  auth,
  role("technician", "verifier"),
  addUsedPart
);

module.exports = router;
