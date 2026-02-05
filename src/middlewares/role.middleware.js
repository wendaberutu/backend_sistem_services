module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({
        success: false,
        message: "No role info",
      });
    }

    const hasRole = req.user.roles.some(r =>
      allowedRoles.includes(r)
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};
