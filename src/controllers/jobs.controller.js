const Job = require("../models/serviceJob.model");
const ServiceAction = require("../models/serviceAction.model");
const db = require("../config/db");
const { parse } = require("dotenv");

/* ======================================================
  Fungsi akses tanggal 
====================================================== */

function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

async function generateJobId(conn) {
  const today = getToday();

  const [rows] = await conn.query(
    `
    SELECT id
    FROM service_jobs
    WHERE id LIKE ?
    ORDER BY id DESC
    LIMIT 1
    FOR UPDATE
    `,
    [`SRV-${today}-%`]
  );

  const seq = rows.length
    ? parseInt(rows[0].id.split("-").pop(), 10) + 1
    : 1;

  return `SRV-${today}-${String(seq).padStart(4, "0")}`;
}

/* ======================================================
   ADMIN
====================================================== */

// GET /api/jobs
exports.getAllJobs = async (req, res) => {
  const jobs = await Job.findAll();
  res.json({ success: true, data: jobs });
};

// POST /api/jobs
exports.createJob = async (req, res) => {
  const {
    item_name,
    item_description,
    reported_issue,
    technician_id, // OPTIONAL
  } = req.body;

  const adminId = req.user.id;

  if (!item_name || !reported_issue) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const jobId = await generateJobId(conn);
    const uid = `UID-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    // ⬇️ CREATE JOB (status ditentukan di MODEL)
    await Job.create(conn, {
      id: jobId,
      qr_code_uid: uid,
      item_name,
      item_description,
      reported_issue,
      admin_id: adminId,
      technician_id: technician_id || null,
    });

    // ⬇️ LOG ADMIN CREATE
    await ServiceAction.create(conn, {
      job_id: jobId,
      user_id: adminId,
      action_note: technician_id
        ? `Barang didaftarkan & langsung di-assign ke teknisi ID ${technician_id}`
        : "Barang diterima & didaftarkan oleh admin",
    });

    await conn.commit();

    res.status(201).json({
      success: true,
      data: await Job.findById(jobId),
    });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};


/* ======================================================
   SHARED
====================================================== */

// GET /api/jobs/:id
exports.getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const actions = await ServiceAction.findByJobId(job.id);

  res.json({
    success: true,
    data: {
      ...job,
      actions,
    },
  });
};

/* ======================================================
   TECHNICIAN
====================================================== */

// GET /api/jobs/available/list
exports.getAvailableJobs = async (req, res) => {
  const jobs = await Job.findAvailableJobs();
  res.json({ success: true, data: jobs });
};

// GET /api/jobs/me/list
exports.getMyJobs = async (req, res) => {
  const jobs = await Job.findMyJobs(req.user.id);
  res.json({ success: true, data: jobs });
};

// PATCH /api/jobs/:id/claim
exports.claimJob = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await Job.claim(conn, req.params.id, req.user.id);

    await ServiceAction.create(conn, {
      job_id: req.params.id,
      user_id: req.user.id,
      action_note: "Pekerjaan diambil oleh teknisi",
    });

    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

// PATCH /api/jobs/:id/start
exports.startJob = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await Job.updateStatus(conn, req.params.id, "in_progress");

    await ServiceAction.create(conn, {
      job_id: req.params.id,
      user_id: req.user.id,
      action_note: "Pekerjaan dimulai",
    });

    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

// PATCH /api/jobs/:id/submit
exports.submitJob = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await Job.submitForVerification(conn, req.params.id);

    await ServiceAction.create(conn, {
      job_id: req.params.id,
      user_id: req.user.id,
      action_note: "Pekerjaan selesai, dikirim ke verifikasi",
    });

    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

/* ======================================================
   VERIFIER
====================================================== */

// GET /api/jobs/verify/list
exports.getVerificationJobs = async (req, res) => {
  const jobs = await Job.findForVerification();
  res.json({ success: true, data: jobs });
};

// PATCH /api/jobs/:id/verify
exports.verifyJob = async (req, res) => {
  const { status, note } = req.body;
  const conn = await db.getConnection();

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    await conn.beginTransaction();

    if (status === "approved") {
      await Job.approve(conn, req.params.id, req.user.id);
    } else {
      await Job.reject(conn, req.params.id, req.user.id);
    }

    await ServiceAction.create(conn, {
      job_id: req.params.id,
      user_id: req.user.id,
      action_note:
        status === "approved"
          ? "VERIFIKASI LOLOS"
          : `DITOLAK: ${note || "-"}`,
    });

    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};
