const db = require("../config/db");

exports.create = async (jobId, sparepartId) => {
  await db.query(
    `INSERT INTO service_used_parts
     (job_id, sparepart_id, used_at)
     VALUES (?, ?, NOW())`,
    [jobId, sparepartId]
  );
};
