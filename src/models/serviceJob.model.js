const db = require("../config/db");

exports.findAll = async () => {
  const [rows] = await db.query(
    "SELECT * FROM service_jobs ORDER BY entry_date DESC"
  );
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await db.query("SELECT * FROM service_jobs WHERE id = ?", [id]);
  return rows[0];
};

exports.findByUID = async (uid) => {
  const [rows] = await db.query(
    "SELECT * FROM service_jobs WHERE qr_code_uid = ?",
    [uid]
  );
  return rows[0];
};

exports.findForTechnician = async (technicianId) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM service_jobs
    WHERE
      (status = 'waiting' AND technician_id IS NULL)
      OR
      (technician_id = ? AND status IN ('assigned','in_progress','rejected','waiting'))
    ORDER BY entry_date DESC
    `,
    [technicianId]
  );
  return rows;
};

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

exports.assignTechnician = async (conn, jobId, technicianId) => {
  await conn.query(
    `
    UPDATE service_jobs
    SET technician_id = ?, status = 'assigned'
    WHERE id = ?
    `,
    [technicianId, jobId]
  );
};

exports.claim = async (conn, jobId, technicianId) => {
  await conn.query(
    `
    UPDATE service_jobs
    SET technician_id = ?, status = 'in_progress', start_date = NOW()
    WHERE id = ?
    `,
    [technicianId, jobId]
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

exports.setVerifierAndComplete = async (conn, jobId, verifierId) => {
  await conn.query(
    `
    UPDATE service_jobs
    SET status = 'completed', verifier_id = ?, completion_date = NOW()
    WHERE id = ?
    `,
    [verifierId, jobId]
  );
};

exports.setVerifierAndReject = async (conn, jobId, verifierId) => {
  await conn.query(
    `
    UPDATE service_jobs
    SET status = 'rejected', verifier_id = ?
    WHERE id = ?
    `,
    [verifierId, jobId]
  );
};
