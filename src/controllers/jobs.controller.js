const service = require("../services/jobs.services");

exports.getAll = async (req, res, next) => {
  try {
    res.json(await service.getAllJobs());
  } catch (e) {
    next(e);
  }
};

exports.getForTechnician = async (req, res, next) => {
  try {
    res.json(await service.getJobsForTechnician(req.params.techId));
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    await service.createJob(req.body);
    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
};

exports.assign = async (req, res, next) => {
  try {
    await service.assignJob(
      req.params.id,
      req.body.admin_id,
      req.body.technician_id,
      req.body.note
    );
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

exports.claim = async (req, res, next) => {
  try {
    await service.claimJob(req.params.id, req.body.technician_id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    await service.updateStatus(
      req.params.id,
      req.body.status,
      req.body.changed_by,
      req.body.note
    );
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

exports.actions = async (req, res, next) => {
  try {
    res.json(await service.getActions(req.params.id));
  } catch (e) {
    next(e);
  }
};

exports.addAction = async (req, res, next) => {
  try {
    await service.addAction(req.params.id, req.body.user_id, req.body.note);
    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
};

exports.usePart = async (req, res, next) => {
  try {
    await service.usePart(
      req.params.id,
      req.body.technician_id,
      req.body.sparepart_id,
      req.body.qty
    );
    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
};

exports.verify = async (req, res, next) => {
  try {
    await service.verifyJob(
      req.params.id,
      req.body.verifier_id,
      req.body.result,
      req.body.notes
    );
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};
