const db = require("../config/db");

exports.findAll = async () => {
  const [rows] = await db.query(
    "SELECT id, name FROM sparepart_categories ORDER BY name"
  );
  return rows;
};

exports.create = async (name) => {
  const [result] = await db.query(
    "INSERT INTO sparepart_categories (name) VALUES (?)",
    [name]
  );
  return result.insertId;
};

exports.remove = async (id) => {
  await db.query(
    "DELETE FROM sparepart_categories WHERE id = ?",
    [id]
  );
};
