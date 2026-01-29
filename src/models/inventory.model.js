const db = require("../config/db");

exports.findAll = async () => {
  const [rows] = await db.query(`
    SELECT 
      i.id,
      i.name,
      i.stock,
      c.id AS category_id,
      c.name AS category_name
    FROM sparepart_inventory i
    JOIN sparepart_categories c ON c.id = i.category_id
    ORDER BY i.name
  `);
  return rows;
};

exports.createOrIncrease = async ({ name, category_id, stock }) => {
  await db.query(`
    INSERT INTO sparepart_inventory (name, category_id, stock)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      stock = stock + VALUES(stock)
  `, [name, category_id, stock]);
};

exports.decreaseStock = async (id, qty = 1) => {
  await db.query(`
    UPDATE sparepart_inventory
    SET stock = stock - ?
    WHERE id = ? AND stock >= ?
  `, [qty, id, qty]);
};
