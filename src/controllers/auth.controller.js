const authService = require("../services/auth.services");

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      const err = new Error("Username and password required");
      err.status = 400;
      throw err;
    }

    const result = await authService.login(username, password);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
};

exports.me = async (req, res) => {
  res.json({
    id: req.user.id,
    roles: req.user.roles,
  });
};
