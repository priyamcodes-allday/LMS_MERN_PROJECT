const Course = require("../../course/models/Course");
const Enrollment = require("../models/enrollmentSchema");
const User = require("../models/userSchema");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const { courseEnrollmentTemplate } = require("../utils/emailTamplates");

class StudentController {

  async getDashboard(req, res, next) {
    try {
      const enrollments = await Enrollment.aggregate([
        { $match: { student: req.user._id } },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },
        {
          $lookup: {
            from: "users",
            localField: "course.teacher",
            foreignField: "_id",
            as: "course.teacher",
          },
        },
        {
          $unwind: {
            path: "$course.teacher",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            paymentStatus: 1,
            enrolledAt: 1,
            createdAt: 1,
            "course._id": 1,
            "course.title": 1,
            "course.thumbnail": 1,
            "course.price": 1,
            "course.teacher._id": 1,
            "course.teacher.name": 1,
          },
        },
      ]);

      const totalEnrolled = enrollments.length;

      const totalSpent = enrollments.reduce(
        (sum, e) =>
          e.paymentStatus === "completed" ? sum + e.course.price : sum,
        0
      );

      const teacherIds = new Set(
        enrollments
          .filter((e) => e.course.teacher)
          .map((e) => e.course.teacher._id.toString())
      );

      const recentCourse = enrollments[0] || null;

      res.status(200).json({
        success: true,
        stats: {
          totalEnrolled,
          totalSpent,
          totalTeachers: teacherIds.size,
        },
        recentCourse,
      });
    } catch (error) {
      next(error);
    }
  }

  async browseCourses(req, res, next) {
    try {
      const courses = await Course.aggregate([
        { $match: { status: "approved", isActive: true } },
        {
          $lookup: {
            from: "users",
            localField: "teacher",
            foreignField: "_id",
            as: "teacher",
          },
        },
        { $unwind: "$teacher" },
        {
          $project: {
            title: 1,
            description: 1,
            price: 1,
            thumbnail: 1,
            category: 1,
            "teacher._id": 1,
            "teacher.name": 1,
          },
        },
      ]);

      res.status(200).json({ success: true, courses });
    } catch (error) {
      next(error);
    }
  }

  async buyCourse(req, res, next) {
    try {
      const course = await Course.findOne({
        _id: req.params.id,
        status: "approved",
      });

      if (!course)
        return next(new ApiError(404, "Course not found or not available."));

      const alreadyEnrolled = await Enrollment.findOne({
        student: req.user._id,
        course: course._id,
      });
      if (alreadyEnrolled) {
        return next(
          new ApiError(400, "You are already enrolled in this course.")
        );
      }

      // Create enrollment record
      await Enrollment.create({
        student: req.user._id,
        course: course._id,
        paymentStatus: "completed",
      });

      // Add student to course
      course.enrolledStudents.push(req.user._id);
      await course.save();

      // If the user's role is still "user", promote them to "student"
      if (req.user.role === "user") {
        await User.findByIdAndUpdate(req.user._id, { role: "student" });
      }

      // Send confirmation email without blocking the enrollment result.
      try {
        await sendEmail({
          to: req.user.email,
          subject: `Enrollment Confirmed: ${course.title}`,
          html: courseEnrollmentTemplate(req.user.name, course.title),
        });
      } catch (emailError) {
        console.error("Enrollment email failed:", emailError.message);
      }

      res.status(200).json({
        success: true,
        message: `Successfully enrolled in "${course.title}". A confirmation email has been sent.`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyCourses(req, res, next) {
    try {
      const enrollments = await Enrollment.aggregate([
        { $match: { student: req.user._id } },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },
        {
          $lookup: {
            from: "users",
            localField: "course.teacher",
            foreignField: "_id",
            as: "course.teacher",
          },
        },
        {
          $unwind: {
            path: "$course.teacher",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            paymentStatus: 1,
            enrolledAt: 1,
            createdAt: 1,
            "course._id": 1,
            "course.title": 1,
            "course.description": 1,
            "course.price": 1,
            "course.thumbnail": 1,
            "course.lessons": 1,
            "course.status": 1,
            "course.teacher._id": 1,
            "course.teacher.name": 1,
            "course.teacher.email": 1,
          },
        },
      ]);

      res.status(200).json({ success: true, enrollments });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
