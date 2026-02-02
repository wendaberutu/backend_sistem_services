const UsedPart = require("../models/usedPart.model");
const ServiceAction = require("../models/serviceAction.model");
const db = require("../config/db");

exports.addUsedPart = async (req, res) => {
  const { sparepart_id, qty } = req.body;
  const jobId = req.params.id;
  const userId = req.user.id;

  if (!sparepart_id || !qty) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await UsedPart.add(conn, {
      job_id: jobId,
      sparepart_id,
      qty,
      used_by: userId,
    });

    await ServiceAction.create(conn, {
      job_id: jobId,
      user_id: userId,
      action_note: `Menggunakan sparepart ID ${sparepart_id} sebanyak ${qty}`,
    });

    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};
