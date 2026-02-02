const db = require("../config/db");

/**
 * Create new service action (log aktivitas job)
 * Dipakai saat:
 * - Job dibuat (admin)
 * - Job di-claim teknisi
 * - Job selesai
 * - Job diverifikasi / ditolak
 */
exports.create = async (conn, data) => {
  const { job_id, user_id, action_note } = data;

  await conn.query(
    `
    INSERT INTO service_actions
      (job_id, user_id, action_note, created_at)
    VALUES
      (?, ?, ?, NOW())
    `,
    [job_id, user_id, action_note]
  );
};

/**
 * Ambil seluruh histori action berdasarkan job_id
 * Dipakai di:
 * - GET /api/jobs/:id
 */
exports.findByJobId = async (jobId) => {
  const [rows] = await db.query(
    `
    SELECT
      sa.id,
      sa.job_id,
      sa.action_note,
      sa.created_at,
      u.id AS user_id,
      u.name AS user_name
    FROM service_actions sa
    LEFT JOIN users u ON u.id = sa.user_id
    WHERE sa.job_id = ?
    ORDER BY sa.created_at ASC
    `,
    [jobId]
  );

  return rows;
};
