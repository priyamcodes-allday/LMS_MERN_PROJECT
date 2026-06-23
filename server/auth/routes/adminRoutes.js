const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

router.use(protect, authorizeRoles("admin"));

router.get("/dashboard", adminController.getDashboard);

router.get("/users", adminController.getAllUsers);
router.post("/users/create", adminController.createUser);
router.delete("/users/:id", adminController.deleteUser);
router.put("/users/:id/role", adminController.changeUserRole);

router.get("/teachers/pending", adminController.getPendingTeachers);
router.put("/teachers/:id/approve", adminController.approveTeacher);
router.put("/teachers/:id/reject", adminController.rejectTeacher);

router.get("/courses", adminController.getAllCourses);
router.get("/courses/:id", adminController.getCourseById);
router.put("/courses/:id/approve", adminController.approveCourse);
router.put("/courses/:id/reject", adminController.rejectCourse);
router.put("/courses/:id/toggle-active", adminController.toggleCourseActive);
router.delete("/courses/:id", adminController.deleteCourse);

router.post("/assign", adminController.assignStudentToTeacher);

module.exports = router;