const Inventory = require("../models/inventory.model");

exports.getAll = async (req, res) => {
  const data = await Inventory.findAll();
  res.json(data);
};

exports.create = async (req, res) => {
  const { name, category_id, stock } = req.body;

  if (!name || !category_id || !stock) {
    return res.status(400).json({ message: "data is incomplete" });
  }

  await Inventory.createOrIncrease({
    name,
    category_id,
    stock: Number(stock)
  });

  res.status(201).json({
    message: "Sparepart successfully added/updated"
  });
};

exports.use = async (req, res) => {
  const { sparepart_id, qty } = req.body;

  if (!sparepart_id) {
    return res.status(400).json({ message: "sparepart_id is required" });
  }

  const affected = await Inventory.decreaseStock(
    sparepart_id,
    qty || 1
  );

  if (affected === 0) {
    return res.status(400).json({ message: "Stock is insufficient" });
  }

  res.json({ message: "Sparepart used, stock decreased" });
};
