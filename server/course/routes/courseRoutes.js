const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const upload = require("../middlewares/upload");

router.post("/", courseController.createCourse);
router.get("/", courseController.getAllCourses);
router.get("/search", courseController.searchCourses);
router.get("/filter", courseController.filterCourses);
router.get("/:id", courseController.getCourseById);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);
router.post("/:courseId/lessons", courseController.addLesson);
router.get("/:courseId/lessons", courseController.getCourseLessons);
router.put("/:courseId/lessons/:lessonId", courseController.updateLesson);
router.delete("/:courseId/lessons/:lessonId", courseController.deleteLesson);
router.patch(
  "/:courseId/thumbnail",
  upload.single("thumbnail"),
  courseController.uploadThumbnail,
);

module.exports = router;
