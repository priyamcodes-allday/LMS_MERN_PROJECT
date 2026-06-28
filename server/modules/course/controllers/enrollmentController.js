const mongoose = require("mongoose");
const Enrollment = require("../../auth/models/enrollmentSchema");
const Course = require("../models/Course");
const User = require("../../auth/models/userSchema");

class EnrollmentController {
  // Enroll for course
  async enrollCourse(req, res) {
    try {
      const { student, course } = req.body;

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
      const courseExists = await Course.findOne({
        _id: course,
        isActive: true,
      });

      if (!courseExists) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Prevent Duplicate Enrollment
      const alreadyEnrolled = await Enrollment.findOne({
        student,
        course,
      });

      if (alreadyEnrolled) {
        return res.status(400).json({
          success: false,
          message: "Already enrolled",
        });
      }

      const enrollment = await Enrollment.create({
        student,
        course,
      });

      res.status(201).json({
        success: true,
        message: "Enrollment successful",
        data: enrollment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get Enrolled Courses
  async getStudentCourses(req, res) {
    try {
      const enrollments = await Enrollment.aggregate([
        {
          // 1. Filter enrollments by studentId (Must cast string to ObjectId)
          $match: {
            student: new mongoose.Types.ObjectId(req.params.studentId),
          },
        },
        {
          // 2. Join with the courses collection
          $lookup: {
            from: "courses", // MongoDB collection name for courses
            localField: "course", // Reference field in Enrollment schema
            foreignField: "_id",
            as: "course",
          },
        },
        {
          // Flatten the course array into an object
          $unwind: {
            path: "$course",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          // 3. Join with the users collection for student details
          $lookup: {
            from: "users", // MongoDB collection name for users
            localField: "student", // Reference field in Enrollment schema
            foreignField: "_id",
            as: "student",
          },
        },
        {
          // Flatten the student array into an object
          $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          // 4. Project fields matching your original select statements
          $project: {
            _id: 1,
            enrolledAt: 1, // Include any other enrollment schema fields you need
            status: 1, // Enrollment status (if applicable)

            // Select specific course fields
            "course._id": 1,
            "course.title": 1,
            "course.description": 1,
            "course.price": 1,
            "course.thumbnail": 1,
            "course.status": 1,

            // Select specific student fields
            "student._id": 1,
            "student.name": 1,
            "student.email": 1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new EnrollmentController();
