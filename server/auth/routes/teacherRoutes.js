const express = require("express");
const router = express.Router();

const teacherController = require("../controllers/teacherController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

router.use(protect, authorizeRoles("teacher", "admin"));

router.get("/dashboard", teacherController.getDashboard);

// router.post("/courses", teacherController.createCourse);
router.get("/courses", teacherController.getMyCourses);
// router.get("/courses/:id", teacherController.getCourseById);
// router.put("/courses/:id", teacherController.updateCourse);
router.put("/courses/:id/submit", teacherController.submitForApproval);

// router.post("/courses/:id/lessons", teacherController.addLesson);
// router.put("/courses/:id/lessons/:lessonId", teacherController.updateLesson);
// router.delete("/courses/:id/lessons/:lessonId", teacherController.deleteLesson);

router.get("/students", teacherController.getMyStudents);

module.exports = router;