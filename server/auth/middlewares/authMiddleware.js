const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const ApiError = require("../utils/apiError");

const protect = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ApiError(401, "Not authorized. Please login."));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!req.user) {
      return next(new ApiError(401, "User not found. Please login again."));
    }

    if (req.user.role === "teacher" && !req.user.isApproved) {
      return next(new ApiError(403, "Your teacher account is pending admin approval."));
    }

    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token. Please login again."));
  }
};

module.exports = { protect };