const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "student", "teacher", "admin"],
      default: "user",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    emailVerifyToken: String,
    emailVerifyExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    refreshToken: String,

    loginCount: {
      type: Number,
      default: 0,
    },
    lastLoginIp: {
      type: String,
      default: "",
    },
    lastLoginAt: {
      type: Date,
    },

    // Login OTP (2-step verification)
    loginOtp: String,
    loginOtpExpire: Date,
    loginOtpAttempts: {
      type: Number,
      default: 0,
    },
    lastLoginOtpSentAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
