const db = require("../config/db");

exports.findAll = async () => {
  const [rows] = await db.query(
    "SELECT * FROM service_jobs ORDER BY entry_date DESC"
  );
  return rows;
};

exports.findByUID = async (uid) => {
  const [rows] = await db.query(
    "SELECT * FROM service_jobs WHERE qr_code_uid = ?",
    [uid]
  );
  return rows[0];
};

exports.create = async (data) => {
  const {
    id,
    qr_code_uid,
    item_name,
    item_description,
    reported_issue,
    admin_id,
  } = data;

  await db.query(
    `INSERT INTO service_jobs
     (id, qr_code_uid, item_name, item_description, reported_issue, status, admin_id, entry_date)
     VALUES (?, ?, ?, ?, ?, 'waiting', ?, NOW())`,
    [id, qr_code_uid, item_name, item_description, reported_issue, admin_id]
  );
};

exports.updateStatus = async (id, status, techId, verifierId) => {
  await db.query(
    `UPDATE service_jobs
     SET status = ?, technician_id = ?, verifier_id = ?
     WHERE id = ?`,
    [status, techId, verifierId, id]
  );
};
