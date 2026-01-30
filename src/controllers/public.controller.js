const service = require("../services/jobs.services");

exports.track = async (req, res, next) => {
  try {
    const job = await service.trackPublic(req.params.uid);
    if (!job) return res.status(404).json({ success: false, message: "Not found" });
    res.json(job);
  } catch (e) {
    next(e);
  }
};
