const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollmentController");

router.post("/", enrollmentController.enrollCourse);
router.get("/student/:studentId", enrollmentController.getStudentCourses);

module.exports = router;
