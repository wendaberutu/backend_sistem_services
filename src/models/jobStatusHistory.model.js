exports.add = async (conn, jobId, oldStatus, newStatus, changedBy, note) => {
  await conn.query(
    `
    INSERT INTO job_status_histories
      (job_id, old_status, new_status, changed_by, note, changed_at)
    VALUES
      (?, ?, ?, ?, ?, NOW())
    `,
    [jobId, oldStatus, newStatus, changedBy, note || null]
  );
};
