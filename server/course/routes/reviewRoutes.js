const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");

router.post("/", reviewController.createReview);
router.get("/course/:courseId", reviewController.getCourseReviews);
router.get("/course/:courseId/stats", reviewController.getCourseReviewStats);

module.exports = router;
