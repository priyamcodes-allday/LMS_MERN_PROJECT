const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// All admin routes require login + admin role
router.use(protect, authorizeRoles("admin"));

router.get("/dashboard", adminController.getDashboard);

// User management
router.get("/users", adminController.getAllUsers);
router.post("/users/create", adminController.createUser);
router.delete("/users/:id", adminController.deleteUser);
router.put("/users/:id/role", adminController.changeUserRole);

// Teacher approval
router.get("/teachers/pending", adminController.getPendingTeachers);
router.put("/teachers/:id/approve", adminController.approveTeacher);
router.put("/teachers/:id/reject", adminController.rejectTeacher);

// Course management
router.get("/courses", adminController.getAllCourses);
router.put("/courses/:id/approve", adminController.approveCourse);
router.put("/courses/:id/reject", adminController.rejectCourse);
router.delete("/courses/:id", adminController.deleteCourse);

// Assign student to course/teacher
router.post("/assign", adminController.assignStudentToTeacher);

module.exports = router;