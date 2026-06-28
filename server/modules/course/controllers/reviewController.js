const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../../auth/models/userSchema");
const Course = require("../models/Course");
const Enrollment = require("../../auth/models/enrollmentSchema");

class ReviewController {
  async createReview(req, res) {
    try {
      const { student, course, rating, review } = req.body;

      // Check Student
      const studentExists = await User.findOne({
        _id: student,
        role: "student",
      });

      if (!studentExists) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Check Course
      const courseExists = await Course.findById(course);

      if (!courseExists) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Check Enrollment
      const enrolled = await Enrollment.findOne({
        student,
        course,
      });

      if (!enrolled) {
        return res.status(400).json({
          success: false,
          message: "Student is not enrolled in this course",
        });
      }

      // Prevent Duplicate Review
      const alreadyReviewed = await Review.findOne({
        student,
        course,
      });

      if (alreadyReviewed) {
        return res.status(400).json({
          success: false,
          message: "Review already submitted",
        });
      }

      // Create Review
      const newReview = await Review.create({
        student,
        course,
        rating,
        review,
      });

      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: newReview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCourseReviews(req, res) {
    try {
      const { courseId } = req.params;

      const reviews = await Review.aggregate([
        {
          $match: {
            course: new mongoose.Types.ObjectId(courseId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "student",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,

            student: {
              _id: "$student._id",
              name: "$student.name",
              email: "$student.email",
            },

            rating: 1,
            review: 1,
            createdAt: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCourseReviewStats(req, res) {
    try {
      const { courseId } = req.params;

      const stats = await Review.aggregate([
        {
          $match: {
            course: new mongoose.Types.ObjectId(courseId),
          },
        },
        {
          $group: {
            _id: "$course",

            averageRating: {
              $avg: "$rating",
            },

            totalReviews: {
              $sum: 1,
            },

            highestRating: {
              $max: "$rating",
            },

            lowestRating: {
              $min: "$rating",
            },
          },
        },
        {
          $project: {
            _id: 0,
            averageRating: {
              $round: ["$averageRating", 2],
            },
            totalReviews: 1,
            highestRating: 1,
            lowestRating: 1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: stats[0] || {
          averageRating: 0,
          totalReviews: 0,
          highestRating: 0,
          lowestRating: 0,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ReviewController();
