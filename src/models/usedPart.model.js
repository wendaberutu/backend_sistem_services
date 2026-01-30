exports.add = async (conn, jobId, sparepartId, qty, usedBy) => {
  await conn.query(
    `
    INSERT INTO service_used_parts (job_id, sparepart_id, qty, used_by, used_at)
    VALUES (?, ?, ?, ?, NOW())
    `,
    [jobId, sparepartId, qty, usedBy || null]
  );
};
