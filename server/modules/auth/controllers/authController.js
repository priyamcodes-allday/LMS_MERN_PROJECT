const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/userSchema");
const TeacherProfile = require("../models/teacherProfileSchema");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/genrateToken");
const {
  verifyEmailTemplate,
  resetPasswordTemplate,
  loginOtpTemplate,
} = require("../utils/emailTamplates");
const jwt = require("jsonwebtoken");
// const clientIP=require('../middlewares/clientIP');
const getClientIp = require("../middlewares/clientIP");

class AuthController {
  // REGISTER
  async register(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        role,
        qualification,
        specialization,
        experience,
        bio,
        linkedIn,
      } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new ApiError(400, "Email is already registered."));
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const isApproved = role === "teacher" ? false : true;

      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        isApproved,
        isEmailVerified: process.env.SKIP_EMAIL_VERIFICATION === "true",
        emailVerifyToken: hashedToken,
        emailVerifyExpire: Date.now() + 24 * 60 * 60 * 1000,
      });

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
        ...(process.env.NODE_ENV !== "production" && { verifyToken: rawToken }), // testing only
      });
    } catch (error) {
      next(error);
    }
  }

  // VERIFY EMAIL

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

      res.status(200).json({
        success: true,
        message: "Email verified successfully! You can now login.",
      });
    } catch (error) {
      next(error);
    }
  }

  // LOGIN - STEP 1 (validate credentials, send OTP)
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ApiError(401, "Invalid email or password."));
      }

      if (!user.isEmailVerified) {
        return next(
          new ApiError(401, "Please verify your email before logging in."),
        );
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return next(new ApiError(401, "Invalid email or password."));
      }

      if (user.role === "teacher" && !user.isApproved) {
        return next(
          new ApiError(403, "Your teacher account is pending admin approval."),
        );
      }

      // Resend cooldown: 30 seconds between OTP requests
      if (
        user.lastLoginOtpSentAt &&
        Date.now() - user.lastLoginOtpSentAt.getTime() < 30 * 1000
      ) {
        return next(
          new ApiError(429, "Please wait before requesting another OTP."),
        );
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

      user.loginOtp = hashedOtp;
      user.loginOtpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
      user.loginOtpAttempts = 0;
      user.lastLoginOtpSentAt = new Date();
      await user.save();

      await sendEmail({
        to: user.email,
        subject: "Your Login OTP - LMS Platform",
        html: loginOtpTemplate(user.name, otp),
      });

      res.status(200).json({
        success: true,
        message:
          "OTP sent to your registered email. Please verify to continue login.",
        email: user.email,
      });
    } catch (error) {
      next(error);
    }
  }

  // LOGIN - STEP 2 (verify OTP, issue tokens, track login activity)
  async verifyLoginOtp(req, res, next) {
    try {
      const { email, otp } = req.body;

      const user = await User.findOne({ email });

      if (!user || !user.loginOtp || !user.loginOtpExpire) {
        return next(
          new ApiError(400, "No OTP request found. Please login again."),
        );
      }

      if (user.loginOtpExpire < Date.now()) {
        user.loginOtp = undefined;
        user.loginOtpExpire = undefined;
        await user.save();
        return next(new ApiError(400, "OTP has expired. Please login again."));
      }

      if (user.loginOtpAttempts >= 5) {
        user.loginOtp = undefined;
        user.loginOtpExpire = undefined;
        await user.save();
        return next(
          new ApiError(429, "Too many incorrect attempts. Please login again."),
        );
      }

      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

      if (hashedOtp !== user.loginOtp) {
        user.loginOtpAttempts += 1;
        await user.save();
        return next(new ApiError(401, "Invalid OTP."));
      }

      user.loginOtp = undefined;
      user.loginOtpExpire = undefined;
      user.loginOtpAttempts = 0;

      // Track login activity (merged from collaborator's change)
      user.loginCount += 1;
      user.lastLoginIp = getClientIp(req);
      user.lastLoginAt = new Date();

      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);
      user.refreshToken = refreshToken;
      await user.save();

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Logged in successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          loginCount: user.loginCount,
          loginIP: user.lastLoginIp,
        },
        ...(process.env.NODE_ENV !== "production" && {
          accessToken,
          refreshToken,
        }),
      });
    } catch (error) {
      next(error);
    }
  }

  // RESEND LOGIN OTP
  async resendLoginOtp(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return next(new ApiError(404, "User not found."));
      }

      if (
        user.lastLoginOtpSentAt &&
        Date.now() - user.lastLoginOtpSentAt.getTime() < 30 * 1000
      ) {
        return next(
          new ApiError(429, "Please wait before requesting another OTP."),
        );
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

      user.loginOtp = hashedOtp;
      user.loginOtpExpire = Date.now() + 5 * 60 * 1000;
      user.loginOtpAttempts = 0;
      user.lastLoginOtpSentAt = new Date();
      await user.save();

      await sendEmail({
        to: user.email,
        subject: "Your Login OTP - LMS Platform",
        html: loginOtpTemplate(user.name, otp),
      });

      res.status(200).json({
        success: true,
        message: "A new OTP has been sent to your email.",
        ...(process.env.NODE_ENV !== "production" && { otp }),
      });
    } catch (error) {
      next(error);
    }
  }

  // REFRESH ACCESS TOKEN

  async refreshToken(req, res, next) {
    try {
      const token = req.cookies.refreshToken;

      if (!token) {
        return next(new ApiError(401, "No refresh token. Please login again."));
      }

      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== token) {
        return next(
          new ApiError(401, "Invalid refresh token. Please login again."),
        );
      }

      const newAccessToken = generateAccessToken(user._id, user.role);

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res
        .status(200)
        .json({ success: true, message: "Access token refreshed." });
    } catch (error) {
      next(new ApiError(401, "Invalid or expired refresh token."));
    }
  }

  // LOGOUT

  async logout(req, res, next) {
    try {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res
        .status(200)
        .json({ success: true, message: "Logged out successfully." });
    } catch (error) {
      next(error);
    }
  }

  // FORGOT PASSWORD

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(200).json({
          success: true,
          message: "If this email exists, a reset link has been sent.",
        });
      }

      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

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
        ...(process.env.NODE_ENV !== "production" && { resetToken: rawToken }), // ← testing only
      });
    } catch (error) {
      next(error);
    }
  }

  // RESET PASSWORD

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

      res.status(200).json({
        success: true,
        message: "Password reset successfully. Please login.",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
