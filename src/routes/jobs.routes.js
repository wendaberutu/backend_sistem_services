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
| JOB LISTING
|--------------------------------------------------------------------------
*/

// Admin: lihat semua job
router.get("/", auth, role("admin"), getAllJobs);

// Admin: buat job baru
router.post("/", auth, role("admin"), createJob);

// Semua role: lihat detail job
router.get("/:id", auth, getJobById);

/*
|--------------------------------------------------------------------------
| TEKNISI FLOW
|--------------------------------------------------------------------------
*/

// Teknisi: job yang di-assign ke dia
router.get("/me/list", auth, role("technician"), getMyJobs);

// Teknisi: job yang masih kosong
router.get("/available/list", auth, role("technician"), getAvailableJobs);

// Teknisi: ambil job kosong
router.patch("/:id/claim", auth, role("technician"), claimJob);

// Teknisi: mulai pekerjaan
router.patch("/:id/start", auth, role("technician"), startJob);

// Teknisi: submit ke verifikasi
router.patch("/:id/submit", auth, role("technician"), submitJob);

/*
|--------------------------------------------------------------------------
| VERIFICATION FLOW
|--------------------------------------------------------------------------
*/

// Verifikator: list job pending verifikasi
router.get("/verify/list", auth, role("verifier"), getVerificationJobs);

// Verifikator: approve / reject
router.patch("/:id/verify", auth, role("verifier"), verifyJob);

module.exports = router;
