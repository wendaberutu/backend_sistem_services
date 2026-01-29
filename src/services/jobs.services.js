const Job = require("../models/serviceJob.model");
const Action = require("../models/serviceAction.model");

exports.getAllJobs = async () => Job.findAll();

exports.createJob = async (data) => {
  await Job.create(data);
};

exports.updateStatus = async (id, status, extra) => {
  await Job.updateStatus(
    id,
    status,
    extra.technician_id || null,
    extra.verifier_id || null
  );
};

exports.getActions = async (jobId) => Action.findByJob(jobId);

exports.addAction = async (jobId, userId, note) => {
  await Action.create(jobId, userId, note);
};
