const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (username, password) => {
  if (!username || !password) {
    const err = new Error("Username dan password wajib diisi");
    err.status = 400;
    throw err;
  }

  const [users] = await db.query(
    "SELECT id, name, password FROM users WHERE name = ? LIMIT 1",
    [username]
  );

  const user = users[0];

  
  if (!user) {
    const err = new Error("Username atau password salah");
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Username atau password salah");
    err.status = 401;
    throw err;
  }

  const [roles] = await db.query(
    `
    SELECT r.name_role
    FROM roles r
    JOIN user_roles ur ON ur.role_id = r.id
    WHERE ur.user_id = ?
    `,
    [user.id]
  );

  const roleNames = roles.map(r => r.name_role);

  const token = jwt.sign(
    {
      id: user.id,
      roles: roleNames,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      roles: roleNames,
    },
  };
};
