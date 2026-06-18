const ApiError = require("../utils/apiError");

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Only [${roles.join(", ")}] can access this.`)
      );
    }
    next();
  };
};

module.exports = { authorizeRoles };