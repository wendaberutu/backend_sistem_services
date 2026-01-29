const db = require("../config/db");

exports.findByJob = async (jobId) => {
  const [rows] = await db.query(
    "SELECT * FROM service_actions WHERE job_id = ? ORDER BY created_at DESC",
    [jobId]
  );
  return rows;
};

exports.create = async (jobId, userId, note) => {
  await db.query(
    `INSERT INTO service_actions
     (job_id, user_id, action_note, created_at)
     VALUES (?, ?, ?, NOW())`,
    [jobId, userId, note]
  );
};
