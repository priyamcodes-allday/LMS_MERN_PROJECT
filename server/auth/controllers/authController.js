const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/userSchema");
const TeacherProfile = require("../models/teacherProfileSchema");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const { generateAccessToken, generateRefreshToken } = require("../utils/genrateToken");
const {
  verifyEmailTemplate,
  resetPasswordTemplate,
  teacherApprovedTemplate,
} = require("../utils/emailTamplates");
const jwt = require("jsonwebtoken");

class AuthController {
  // ─────────────────────────────────────────────
  // REGISTER
  // POST /api/auth/register
  // ─────────────────────────────────────────────
  async register(req, res, next) {
    try {
      const { name, email, password, role, qualification, specialization, experience, bio, linkedIn } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new ApiError(400, "Email is already registered."));
      }

      // Hash password manually (we don't use pre-save hooks)
      const hashedPassword = await bcrypt.hash(password, 12);

      // Teachers start as unapproved; everyone else is approved
      const isApproved = role === "teacher" ? false : true;

      // Create email verification token using crypto
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        isApproved,
        emailVerifyToken: hashedToken,
        emailVerifyExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      // If registering as teacher, save professional profile
      if (role === "teacher") {
        await TeacherProfile.create({
          user: user._id,
          qualification,
          specialization,
          experience,
          bio,
          linkedIn,
        });
      }

      // Send verification email
      const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;
      await sendEmail({
        to: email,
        subject: "Verify Your Email - LMS Platform",
        html: verifyEmailTemplate(name, verifyUrl),
      });

      res.status(201).json({
        success: true,
        message:
          role === "teacher"
            ? "Registration successful! Your teacher application is under review. Please verify your email."
            : "Registration successful! Please verify your email.",
      });
    } catch (error) {
      next(error);
    }
  }

  // ─────────────────────────────────────────────
  // VERIFY EMAIL
  // GET /api/auth/verify-email/:token
  // ─────────────────────────────────────────────
  async verifyEmail(req, res, next) {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await User.findOne({
        emailVerifyToken: hashedToken,
        emailVerifyExpire: { $gt: Date.now() },
      });

      if (!user) {
        return next(new ApiError(400, "Invalid or expired verification link."));
      }

      user.isEmailVerified = true;
      user.emailVerifyToken = undefined;
      user.emailVerifyExpire = undefined;
      await user.save();

      res.status(200).json({ success: true, message: "Email verified successfully! You can now login." });
    } catch (error) {
      next(error);
    }
  }

  // ─────────────────────────────────────────────
  // LOGIN
  // POST /api/auth/login
  // ─────────────────────────────────────────────
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ApiError(401, "Invalid email or password."));
      }

      if (!user.isEmailVerified) {
        return next(new ApiError(401, "Please verify your email before logging in."));
      }

      // Compare entered password with hashed password
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return next(new ApiError(401, "Invalid email or password."));
      }

      // Teacher must be approved by admin before logging in
      if (user.role === "teacher" && !user.isApproved) {
        return next(new ApiError(403, "Your teacher account is pending admin approval."));
      }

      // Generate tokens
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token in DB
      user.refreshToken = refreshToken;
      await user.save();

      // Send tokens as secure HTTP-only cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: "Logged in successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─────────────────────────────────────────────
  // REFRESH ACCESS TOKEN
  // POST /api/auth/refresh-token
  // ─────────────────────────────────────────────
  async refreshToken(req, res, next) {
    try {
      const token = req.cookies.refreshToken;

      if (!token) {
        return next(new ApiError(401, "No refresh token. Please login again."));
      }

      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== token) {
        return next(new ApiError(401, "Invalid refresh token. Please login again."));
      }

      const newAccessToken = generateAccessToken(user._id, user.role);

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json({ success: true, message: "Access token refreshed." });
    } catch (error) {
      next(new ApiError(401, "Invalid or expired refresh token."));
    }
  }

  // ─────────────────────────────────────────────
  // LOGOUT
  // POST /api/auth/logout
  // ─────────────────────────────────────────────
  async logout(req, res, next) {
    try {
      // Clear refresh token from DB
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
      next(error);
    }
  }

  // ─────────────────────────────────────────────
  // FORGOT PASSWORD
  // POST /api/auth/forgot-password
  // ─────────────────────────────────────────────
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // We send success even if user not found (security best practice)
        return res.status(200).json({
          success: true,
          message: "If this email exists, a reset link has been sent.",
        });
      }

      // Generate reset token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
      await sendEmail({
        to: email,
        subject: "Password Reset Request - LMS Platform",
        html: resetPasswordTemplate(user.name, resetUrl),
      });

      res.status(200).json({
        success: true,
        message: "If this email exists, a reset link has been sent.",
      });
    } catch (error) {
      next(error);
    }
  }

  // ─────────────────────────────────────────────
  // RESET PASSWORD
  // POST /api/auth/reset-password/:token
  // ─────────────────────────────────────────────
  async resetPassword(req, res, next) {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return next(new ApiError(400, "Invalid or expired reset link."));
      }

      user.password = await bcrypt.hash(req.body.password, 12);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(200).json({ success: true, message: "Password reset successfully. Please login." });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();