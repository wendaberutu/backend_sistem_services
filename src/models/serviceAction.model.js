exports.add = async (conn, jobId, userId, note) => {
  await conn.query(
    `
    INSERT INTO service_actions (job_id, user_id, action_note, created_at)
    VALUES (?, ?, ?, NOW())
    `,
    [jobId, userId, note]
  );
};

exports.findByJob = async (jobId, db) => {
  const [rows] = await db.query(
    `
    SELECT a.*, u.name
    FROM service_actions a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE a.job_id = ?
    ORDER BY a.created_at ASC
    `,
    [jobId]
  );
  return rows;
};
