const Category = require("../models/category.model");

exports.getAll = async (req, res) => {
  const data = await Category.findAll();
  res.json(data);
};

exports.create = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "name required" });

  const id = await Category.create(name);
  res.status(201).json({ id, name });
};

exports.remove = async (req, res) => {
  await Category.remove(req.params.id);
  res.json({ message: "deleted" });
};
