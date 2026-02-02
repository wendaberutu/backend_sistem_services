const db = require("../config/db");

/* ======================================================
   BASIC QUERY
====================================================== */

exports.findAll = async () => {
  const [rows] = await db.query(
    "SELECT * FROM service_jobs ORDER BY entry_date DESC"
  );
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM service_jobs WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0];
};

exports.findByUID = async (uid) => {
  const [rows] = await db.query(
    "SELECT * FROM service_jobs WHERE qr_code_uid = ? LIMIT 1",
    [uid]
  );
  return rows[0];
};

/* ======================================================
   LISTING BY ROLE
====================================================== */

// Teknisi: job kosong (belum di-assign)
exports.findAvailableJobs = async () => {
  const [rows] = await db.query(`
    SELECT *
    FROM service_jobs
    WHERE status = 'waiting'
      AND technician_id IS NULL
    ORDER BY entry_date ASC
  `);
  return rows;
};

// Teknisi: job miliknya
exports.findMyJobs = async (technicianId) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM service_jobs
    WHERE technician_id = ?
      AND status IN ('assigned','in_progress','rejected')
    ORDER BY entry_date DESC
    `,
    [technicianId]
  );
  return rows;
};

// Verifikator: job menunggu verifikasi
exports.findForVerification = async () => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM service_jobs
    WHERE status = 'pending_verification'
    ORDER BY start_date ASC
    `
  );
  return rows;
};

/* ======================================================
   CREATE
====================================================== */

exports.create = async (conn, data) => {
  const {
    id,
    qr_code_uid,
    item_name,
    item_description,
    reported_issue,
    admin_id,
  } = data;

  await conn.query(
    `
    INSERT INTO service_jobs
      (id, qr_code_uid, item_name, item_description, reported_issue, status, admin_id, entry_date)
    VALUES
      (?, ?, ?, ?, ?, 'waiting', ?, NOW())
    `,
    [id, qr_code_uid, item_name, item_description, reported_issue, admin_id]
  );
};

/* ======================================================
   ADMIN ACTION
====================================================== */

exports.assignTechnician = async (conn, jobId, technicianId) => {
  const [res] = await conn.query(
    `
    UPDATE service_jobs
    SET technician_id = ?, status = 'assigned'
    WHERE id = ?
      AND technician_id IS NULL
    `,
    [technicianId, jobId]
  );

  if (res.affectedRows === 0) {
    throw new Error("Job already assigned");
  }
};

/* ======================================================
   TECHNICIAN FLOW
====================================================== */

// Claim job (job harus masih kosong)
exports.claim = async (conn, jobId, technicianId) => {
  const [res] = await conn.query(
    `
    UPDATE service_jobs
    SET technician_id = ?, status = 'in_progress', start_date = NOW()
    WHERE id = ?
      AND technician_id IS NULL
      AND status = 'waiting'
    `,
    [technicianId, jobId]
  );

  if (res.affectedRows === 0) {
    throw new Error("Job already taken");
  }
};

exports.submitForVerification = async (conn, jobId) => {
  await conn.query(
    `
    UPDATE service_jobs
    SET status = 'pending_verification'
    WHERE id = ?
    `,
    [jobId]
  );
};

/* ======================================================
   VERIFICATION FLOW
====================================================== */

exports.approve = async (conn, jobId, verifierId) => {
  await conn.query(
    `
    UPDATE service_jobs
    SET status = 'completed',
        verifier_id = ?,
        completion_date = NOW()
    WHERE id = ?
    `,
    [verifierId, jobId]
  );
};

exports.reject = async (conn, jobId, verifierId) => {
  await conn.query(
    `
    UPDATE service_jobs
    SET status = 'rejected',
        verifier_id = ?
    WHERE id = ?
    `,
    [verifierId, jobId]
  );
};

exports.updateStatus = async (conn, jobId, status) => {
  await conn.query(
    `
    UPDATE service_jobs
    SET status = ?
    WHERE id = ?
    `,
    [status, jobId]
  );
};
