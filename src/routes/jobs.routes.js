const express = require("express");
const router = express.Router();

const {
  getAllJobs,
  getJobById,
  createJob,
  claimJob,
  startJob,
  submitJob,
  verifyJob,
  getAvailableJobs,
  getMyJobs,
  getVerificationJobs,
} = require("../controllers/jobs.controller");

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

// Admin: lihat semua job
router.get("/", auth, role("admin"), getAllJobs);

// Admin: buat job (boleh assign / tidak)
router.post("/", auth, role("admin"), createJob);

/*
|--------------------------------------------------------------------------
| TEKNISI
|--------------------------------------------------------------------------

// Job yang di-assign ke teknisi
*/
router.get("/me/list", auth, role("technician", "verifier"), getMyJobs);

// Job yang masih kosong (waiting)
router.get("/available/list", auth, role("technician", "verifier"), getAvailableJobs);

// Ambil job kosong
router.patch("/:id/claim", auth, role("technician", "verifier"), claimJob);

// Mulai pekerjaan
router.patch("/:id/start", auth, role("technician", "verifier"), startJob);

// Submit ke verifikasi
router.patch("/:id/submit", auth, role("technician", "verifier"), submitJob);

/*
|--------------------------------------------------------------------------
| VERIFIKATOR
|--------------------------------------------------------------------------
*/
// List job pending verifikasi
router.get("/verify/list", auth, role("verifier"), getVerificationJobs);

// Approve / Reject
router.patch("/:id/verify", auth, role("verifier"), verifyJob);

/*
|--------------------------------------------------------------------------
| SHARED (PALING BAWAH)
|--------------------------------------------------------------------------
*/

// Detail job (SEMUA ROLE)
router.get("/:id", auth, getJobById);

module.exports = router;
