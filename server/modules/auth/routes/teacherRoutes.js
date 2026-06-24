const express = require("express");
const router = express.Router();
const multer = require("multer");

const teacherDashboardController = require("../controllers/teacherController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const upload = multer({ dest: "uploads/" });

router.use(protect, authorizeRoles("teacher"));

router.get("/dashboard", teacherDashboardController.getDashboard);

router.post("/courses", teacherDashboardController.createCourse);
router.get("/courses", teacherDashboardController.getAllCourses);
router.get("/courses/search", teacherDashboardController.searchCourses);
router.get("/courses/filter", teacherDashboardController.filterCourses);
router.get("/courses/:id", teacherDashboardController.getCourseById);
router.put("/courses/:id", teacherDashboardController.updateCourse);
router.put("/courses/:id/submit", teacherDashboardController.submitForApproval);
router.delete("/courses/:id", teacherDashboardController.deleteCourse);

router.post("/courses/:id/lessons", teacherDashboardController.addLesson);
router.get("/courses/:id/lessons", teacherDashboardController.getCourseLessons);
router.put(
  "/courses/:id/lessons/:lessonId",
  teacherDashboardController.updateLesson
);
router.delete(
  "/courses/:id/lessons/:lessonId",
  teacherDashboardController.deleteLesson
);

router.put(
  "/courses/:id/thumbnail",
  upload.single("thumbnail"),
  teacherDashboardController.uploadThumbnail
);

router.get("/students", teacherDashboardController.getMyStudents);

module.exports = router;
