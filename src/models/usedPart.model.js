const db = require("../config/db");

exports.add = async (conn, data) => {
  const { job_id, sparepart_id, qty, used_by } = data;

  // 1. Kurangi stok sparepart
  const [res] = await conn.query(
    `
    UPDATE sparepart_inventory
    SET stock = stock - ?
    WHERE id = ? AND stock >= ?
    `,
    [qty, sparepart_id, qty]
  );

  if (res.affectedRows === 0) {
    throw new Error("Insufficient stock");
  }

  // 2. Catat pemakaian sparepart
  await conn.query(
    `
    INSERT INTO service_used_parts
      (job_id, sparepart_id, qty, used_by, used_at)
    VALUES
      (?, ?, ?, ?, NOW())
    `,
    [job_id, sparepart_id, qty, used_by]
  );
};

exports.findByJobId = async (jobId) => {
  const [rows] = await db.query(
    `
    SELECT
      sup.id,
      sup.qty,
      sup.used_at,
      u.name AS used_by_name,
      si.name AS sparepart_name
    FROM service_used_parts sup
    JOIN sparepart_inventory si ON si.id = sup.sparepart_id
    JOIN users u ON u.id = sup.used_by
    WHERE sup.job_id = ?
    ORDER BY sup.used_at ASC
    `,
    [jobId]
  );
  return rows;
};
