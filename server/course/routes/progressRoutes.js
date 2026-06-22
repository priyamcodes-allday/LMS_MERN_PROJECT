const express = require("express");
const router = express.Router();

const progressController = require("../controllers/progressController");

router.post("/complete-lesson", progressController.completeLesson);
router.get("/:studentId/:courseId", progressController.getProgress);

module.exports = router;
