const bcrypt = require("bcryptjs");
const User = require("../models/userSchema");
const ApiError = require("../utils/apiError");

class UserController {
  async getProfile(req, res, next) {
    try {
      res.status(200).json({ success: true, user: req.user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name, avatar } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { name, avatar },
        { new: true, runValidators: true }
      ).select("-password -refreshToken");

      res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select("+password");

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return next(new ApiError(400, "Current password is incorrect."));
      }

      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();

      res.status(200).json({ success: true, message: "Password changed successfully." });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();