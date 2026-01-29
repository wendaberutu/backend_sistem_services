const service = require("../services/jobs.services");

exports.getAll = async (req, res) => {
  res.json(await service.getAllJobs());
};

exports.create = async (req, res) => {
  await service.createJob(req.body);
  res.status(201).json({ success: true });
};

exports.updateStatus = async (req, res) => {
  await service.updateStatus(req.params.id, req.body.status, req.body);
  res.json({ success: true });
};

exports.actions = async (req, res) => {
  res.json(await service.getActions(req.params.id));
};

exports.addAction = async (req, res) => {
  await service.addAction(req.params.id, req.body.user_id, req.body.note);
  res.status(201).json({ success: true });
};
