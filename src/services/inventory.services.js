const Inventory = require("../models/inventory.model");
const UsedPart = require("../models/usedPart.model");

exports.getInventory = async () => Inventory.findAll();

exports.addItem = async (data) => Inventory.create(data);

exports.usePart = async (jobId, sparepartId) => {
  await Inventory.decreaseStock(sparepartId);
  await UsedPart.create(jobId, sparepartId);
};
