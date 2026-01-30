const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT u.id, u.name, GROUP_CONCAT(r.name_role) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      GROUP BY u.id
      `
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, password, role_ids } = req.body;
    if (!name || !password || !Array.isArray(role_ids)) {
      const err = new Error("Invalid payload");
      err.status = 400;
      throw err;
    }

    const hash = await bcrypt.hash(password, 10);

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        "INSERT INTO users (name, password) VALUES (?, ?)",
        [name, hash]
      );

      for (const roleId of role_ids) {
        await conn.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [result.insertId, roleId]
        );
      }

      await conn.commit();
      res.status(201).json({ success: true });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
};
