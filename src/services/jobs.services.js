const db = require("../config/db");
const Job = require("../models/serviceJob.model");
const Action = require("../models/serviceAction.model");
const StatusHistory = require("../models/jobStatusHistory.model");
const UsedPart = require("../models/usedPart.model");
const Verification = require("../models/verificationLog.model");

const FLOW = {
  waiting: ["assigned", "in_progress"],
  assigned: ["in_progress"],
  in_progress: ["pending_verification"],
  pending_verification: ["completed", "rejected"],
  rejected: ["in_progress"],
  completed: [],
};

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

function assertTransition(oldStatus, newStatus) {
  const allowed = FLOW[oldStatus] || [];
  if (!allowed.includes(newStatus)) throw httpError(400, "Status transition invalid");
}

exports.getAllJobs = async () => {
  return await Job.findAll();
};

exports.getJobsForTechnician = async (technicianId) => {
  return await Job.findForTechnician(technicianId);
};

exports.createJob = async (data) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await Job.create(conn, data);
    await Action.add(conn, data.id, data.admin_id, "Barang diterima admin");
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

exports.assignJob = async (jobId, adminId, technicianId, note) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const job = await Job.findById(jobId);
    if (!job) throw httpError(404, "Job not found");
    if (job.status !== "waiting") throw httpError(400, "Only waiting job can be assigned");

    await StatusHistory.add(conn, jobId, job.status, "assigned", adminId, note || "Assigned by admin");
    await Job.assignTechnician(conn, jobId, technicianId);
    await Action.add(conn, jobId, adminId, `Job ditugaskan ke teknisi ID=${technicianId}`);

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

exports.claimJob = async (jobId, technicianId) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const job = await Job.findById(jobId);
    if (!job) throw httpError(404, "Job not found");
    if (job.status !== "waiting") throw httpError(400, "Only waiting job can be claimed");
    if (job.technician_id !== null) throw httpError(400, "Job already assigned, cannot be claimed");

    await StatusHistory.add(conn, jobId, job.status, "in_progress", technicianId, "Claim by technician");
    await Job.claim(conn, jobId, technicianId);
    await Action.add(conn, jobId, technicianId, "Pekerjaan dimulai oleh teknisi");

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

exports.updateStatus = async (jobId, newStatus, changedBy, note) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const job = await Job.findById(jobId);
    if (!job) throw httpError(404, "Job not found");

    assertTransition(job.status, newStatus);

    if (newStatus === "in_progress" && job.status === "assigned") {
      if (job.technician_id !== changedBy) throw httpError(403, "Not your assigned job");
      await Job.claim(conn, jobId, changedBy);
    } else if (newStatus === "pending_verification") {
      if (job.technician_id !== changedBy) throw httpError(403, "Only assigned technician can submit");
      await Job.updateStatus(conn, jobId, "pending_verification");
    } else {
      await Job.updateStatus(conn, jobId, newStatus);
    }

    await StatusHistory.add(conn, jobId, job.status, newStatus, changedBy, note || null);
    await Action.add(conn, jobId, changedBy, `Update status: ${job.status} → ${newStatus}`);

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

exports.getActions = async (jobId) => {
  return await Action.findByJob(jobId, db);
};

exports.addAction = async (jobId, userId, note) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const job = await Job.findById(jobId);
    if (!job) throw httpError(404, "Job not found");

    await Action.add(conn, jobId, userId, note);

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

exports.usePart = async (jobId, technicianId, sparepartId, qty) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const job = await Job.findById(jobId);
    if (!job) throw httpError(404, "Job not found");
    if (job.technician_id !== technicianId) throw httpError(403, "Not your job");
    if (!["in_progress", "rejected"].includes(job.status)) throw httpError(400, "Job not in working state");

    const q = Number(qty || 1);
    if (!Number.isFinite(q) || q <= 0) throw httpError(400, "Qty invalid");

    const [invRows] = await conn.query(
      "SELECT id, name, stock FROM sparepart_inventory WHERE id = ? FOR UPDATE",
      [sparepartId]
    );
    const part = invRows[0];
    if (!part) throw httpError(404, "Sparepart not found");
    if (part.stock < q) throw httpError(400, "Stock not enough");

    await conn.query(
      "UPDATE sparepart_inventory SET stock = stock - ? WHERE id = ?",
      [q, sparepartId]
    );

    await UsedPart.add(conn, jobId, sparepartId, q, technicianId);
    await Action.add(conn, jobId, technicianId, `Menggunakan sparepart: ${part.name} (qty=${q})`);

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

exports.verifyJob = async (jobId, verifierId, result, notes) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const job = await Job.findById(jobId);
    if (!job) throw httpError(404, "Job not found");
    if (job.status !== "pending_verification") throw httpError(400, "Job not pending verification");

    if (result !== "approved" && result !== "rejected") throw httpError(400, "Result invalid");

    if (result === "approved") {
      await Verification.add(conn, jobId, verifierId, "approved", notes || null);
      await StatusHistory.add(conn, jobId, job.status, "completed", verifierId, notes || null);
      await Job.setVerifierAndComplete(conn, jobId, verifierId);
      await Action.add(conn, jobId, verifierId, "VERIFIKASI LOLOS: Barang siap diserahkan");
    } else {
      if (!notes) throw httpError(400, "Notes required for rejection");
      await Verification.add(conn, jobId, verifierId, "rejected", notes);
      await StatusHistory.add(conn, jobId, job.status, "rejected", verifierId, notes);
      await Job.setVerifierAndReject(conn, jobId, verifierId);
      await Action.add(conn, jobId, verifierId, `DITOLAK QC: ${notes}`);
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

exports.trackPublic = async (uid) => {
  const job = await Job.findByUID(uid);
  if (!job) return null;
  return job;
};
