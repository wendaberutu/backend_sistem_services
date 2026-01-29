const Job = require("../models/serviceJob.model");

exports.track = async (req, res) => {
  const job = await Job.findByUID(req.params.uid);
  if (!job) return res.status(404).json({ message: "Tidak ditemukan" });
  res.json(job);
};
