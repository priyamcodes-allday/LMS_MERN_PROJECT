const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

router.get("/courses", protect, studentController.browseCourses);

router.post("/courses/:id/buy", protect, studentController.buyCourse);

router.get("/dashboard", protect, authorizeRoles("student"), studentController.getDashboard);
router.get("/my-courses", protect, authorizeRoles("student"), studentController.getMyCourses);

module.exports = router;