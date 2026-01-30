exports.add = async (conn, jobId, verifierId, status, notes) => {
  await conn.query(
    `
    INSERT INTO verification_logs (job_id, verifier_id, status, notes, created_at)
    VALUES (?, ?, ?, ?, NOW())
    `,
    [jobId, verifierId, status, notes || null]
  );
};
