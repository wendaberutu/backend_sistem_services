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
        res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: true,       
      sameSite: "None", 
      maxAge: 1000 * 60 * 60 * 8,
    });

    res.json({
      success: true,
      user: result.user,
    });
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

exports.logout = (req, res) => {
  res.clearCookie("access_token");
  res.json({ success: true });
};