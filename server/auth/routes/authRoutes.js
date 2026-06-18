const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { validate, registerSchema, loginSchema, resetPasswordSchema } = require("../validators/authValidator");

router.post("/register", validate(registerSchema), authController.register);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", protect, authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;