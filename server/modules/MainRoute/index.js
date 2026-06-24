const express = require("express");
const router = express.Router();

const courseRoutes = require("../course/routes/courseRoutes"); // By Priyam
const categoryRoutes = require("../course/routes/categoryRoutes"); // By Priyam
const enrollmentRoutes = require("../course/routes/enrollmentRoutes"); // By Priyam
const cartRoutes = require("../course/routes/cartRoutes"); // By Priyam
const progressRoutes = require("../course/routes/progressRoutes"); // By Priyam
const wishlistRoutes = require("../course/routes/wishlistRoutes"); // By Priyam
const reviewRoutes = require("../course/routes/reviewRoutes"); // By Priyam
const authRoutes = require("../auth/routes/authRoutes"); //by ranit
const userRoutes = require("../auth/routes/userRoutes"); //By ranit
const adminRoutes = require("../auth/routes/adminRoutes"); //By ranit
const teacherRoutes = require("../auth/routes/teacherRoutes"); //by ranit

router.use("/api/auth", authRoutes); //By ranit
router.use("/api/user", userRoutes); //By ranit
router.use("/api/admin", adminRoutes); //By ranit
router.use("/api/teacher", teacherRoutes); //by ranit
router.use("/api/v1/courses", courseRoutes); // By Priyam
router.use("/api/v1/categories", categoryRoutes); // By Priyam
router.use("/api/v1/enrollments", enrollmentRoutes); // By Priyam
router.use("/api/v1/cart", cartRoutes); // By Priyam
router.use("/api/v1/wishlist", wishlistRoutes); // By Priyam
router.use("/api/v1/progress", progressRoutes); // By Priyam
router.use("/api/v1/reviews", reviewRoutes); // By Priyam

module.exports = router;
