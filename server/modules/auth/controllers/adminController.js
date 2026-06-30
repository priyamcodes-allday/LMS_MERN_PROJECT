const bcrypt = require("bcryptjs");
const User = require("../models/userSchema");
const Course = require("../../course/models/Course");
const TeacherProfile = require("../models/teacherProfileSchema");
const Enrollment = require("../models/enrollmentSchema");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const {
  teacherApprovedTemplate,
  teacherRejectedTemplate,
  courseApprovedTemplate,
} = require("../utils/emailTamplates");

class AdminController {
  // ─── DASHBOARD ──────────────────────────────

  async getDashboard(req, res, next) {
    try {
      const totalUsers = await User.countDocuments({ role: "user" });
      const totalStudents = await User.countDocuments({ role: "student" });
      const totalTeachers = await User.countDocuments({ role: "teacher" });
      const totalCourses = await Course.countDocuments();

      const pendingTeachers = await TeacherProfile.countDocuments({
        status: "pending",
      });

      // Course statuses now include "draft" in addition to pending/approved/rejected
      const draftCourses = await Course.countDocuments({ status: "draft" });
      const pendingCourses = await Course.countDocuments({ status: "pending" });
      const approvedCourses = await Course.countDocuments({
        status: "approved",
      });
      const rejectedCourses = await Course.countDocuments({
        status: "rejected",
      });

      // Track inactive (soft-disabled) courses separately from rejected ones
      const inactiveCourses = await Course.countDocuments({ isActive: false });

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalCourses,
          pendingTeachers,
          draftCourses,
          pendingCourses,
          approvedCourses,
          rejectedCourses,
          inactiveCourses,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── USER MANAGEMENT ────────────────────────
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find().select("-password -refreshToken");
      res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
      next(error);
    }
  }

  // (admin creates a student or teacher directly)
  async createUser(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) return next(new ApiError(400, "Email already exists."));

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        isEmailVerified: true, // admin-created users
        isApproved: true,
      });

      res.status(201).json({ success: true, message: "User created.", user });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return next(new ApiError(404, "User not found."));
      res.status(200).json({ success: true, message: "User deleted." });
    } catch (error) {
      next(error);
    }
  }

  // (change someone's role)
  async changeUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { returnDocument: "after" }
      ).select("-password");
      if (!user) return next(new ApiError(404, "User not found."));
      res.status(200).json({ success: true, message: "Role updated.", user });
    } catch (error) {
      next(error);
    }
  }

  // TEACHER APPROVAL

  async getPendingTeachers(req, res, next) {
    try {
      const profiles = await TeacherProfile.aggregate([
        { $match: { status: "pending" } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            qualification: 1,
            specialization: 1,
            experience: 1,
            bio: 1,
            linkedIn: 1,
            status: 1,
            createdAt: 1,
            "user._id": 1,
            "user.name": 1,
            "user.email": 1,
            "user.createdAt": 1,
          },
        },
      ]);

      res.status(200).json({ success: true, count: profiles.length, profiles });
    } catch (error) {
      next(error);
    }
  }

  async approveTeacher(req, res, next) {
    try {
      const updatedProfile = await TeacherProfile.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { returnDocument: "after" }
      );

      if (!updatedProfile)
        return next(new ApiError(404, "Teacher profile not found."));

      const result = await TeacherProfile.aggregate([
        { $match: { _id: updatedProfile._id } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ]);

      const profile = result[0];

      await User.findByIdAndUpdate(profile.user._id, { isApproved: true });

      await sendEmail({
        to: profile.user.email,
        subject: "Teacher Account Approved - LMS Platform",
        html: teacherApprovedTemplate(profile.user.name),
      });

      res
        .status(200)
        .json({ success: true, message: "Teacher approved and notified." });
    } catch (error) {
      next(error);
    }
  }

  async rejectTeacher(req, res, next) {
    try {
      const { reason } = req.body;

      const updatedProfile = await TeacherProfile.findByIdAndUpdate(
        req.params.id,
        { status: "rejected", rejectionReason: reason },
        { returnDocument: "after" }
      );

      if (!updatedProfile)
        return next(new ApiError(404, "Teacher profile not found."));

      const result = await TeacherProfile.aggregate([
        { $match: { _id: updatedProfile._id } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ]);

      const profile = result[0];

      await sendEmail({
        to: profile.user.email,
        subject: "Teacher Application Update - LMS Platform",
        html: teacherRejectedTemplate(profile.user.name, reason),
      });

      res
        .status(200)
        .json({ success: true, message: "Teacher rejected and notified." });
    } catch (error) {
      next(error);
    }
  }

  // COURSE MANAGEMENT
  async getAllCourses(req, res, next) {
    try {
      const { status } = req.query;

      const matchStage = {};
      if (status) {
        matchStage.status = status;
      }

      const pipeline = [];

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      pipeline.push(
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
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            description: 1,
            price: 1,
            thumbnail: 1,
            status: 1,
            isActive: 1,
            category: 1,
            enrolledStudents: 1,

            lessonCount: { $size: { $ifNull: ["$lessons", []] } },
            createdAt: 1,
            "teacher._id": 1,
            "teacher.name": 1,
            "teacher.email": 1,
          },
        }
      );

      const courses = await Course.aggregate(pipeline);

      res.status(200).json({ success: true, count: courses.length, courses });
    } catch (error) {
      next(error);
    }
  }

  async getCourseById(req, res, next) {
    try {
      const result = await Course.aggregate([
        {
          $match: {
            _id: new (require("mongoose").Types.ObjectId)(req.params.id),
          },
        },
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
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            description: 1,
            price: 1,
            thumbnail: 1,
            status: 1,
            isActive: 1,
            category: 1,
            lessons: 1,
            enrolledStudents: 1,
            createdAt: 1,
            "teacher._id": 1,
            "teacher.name": 1,
            "teacher.email": 1,
          },
        },
      ]);

      const course = result[0];
      if (!course) return next(new ApiError(404, "Course not found."));

      res.status(200).json({ success: true, course });
    } catch (error) {
      next(error);
    }
  }

  async approveCourse(req, res, next) {
    try {
      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { returnDocument: "after" }
      );

      if (!updatedCourse) return next(new ApiError(404, "Course not found."));

      const result = await Course.aggregate([
        { $match: { _id: updatedCourse._id } },
        {
          $lookup: {
            from: "users",
            localField: "teacher",
            foreignField: "_id",
            as: "teacher",
          },
        },
        { $unwind: "$teacher" },
      ]);

      const course = result[0];

      try {
        await sendEmail({
          to: course.teacher.email,
          subject: "Course Approved - LMS Platform",
          html: courseApprovedTemplate(course.teacher.name, course.title),
        });
      } catch (emailError) {
        console.error("Course approval email failed:", emailError.message);
      }

      res
        .status(200)
        .json({ success: true, message: "Course approved.", course });
    } catch (error) {
      next(error);
    }
  }

  async rejectCourse(req, res, next) {
    try {
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { returnDocument: "after" }
      );
      if (!course) return next(new ApiError(404, "Course not found."));
      res.status(200).json({ success: true, message: "Course rejected." });
    } catch (error) {
      next(error);
    }
  }

  async toggleCourseActive(req, res, next) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) return next(new ApiError(404, "Course not found."));

      course.isActive = !course.isActive;
      await course.save();

      res.status(200).json({
        success: true,
        message: `Course ${course.isActive ? "activated" : "deactivated"}.`,
        course,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req, res, next) {
    try {
      const course = await Course.findByIdAndDelete(req.params.id);
      if (!course) return next(new ApiError(404, "Course not found."));

      // Clean up dangling enrollment records pointing at the deleted course
      await Enrollment.deleteMany({ course: req.params.id });

      res.status(200).json({ success: true, message: "Course deleted." });
    } catch (error) {
      next(error);
    }
  }

  async assignStudentToTeacher(req, res, next) {
    try {
      const { studentId, courseId } = req.body;

      const student = await User.findById(studentId);
      if (!student || student.role !== "student") {
        return next(new ApiError(404, "Student not found."));
      }

      const course = await Course.findById(courseId);
      if (!course) return next(new ApiError(404, "Course not found."));

      const alreadyEnrolled = await Enrollment.findOne({
        student: studentId,
        course: courseId,
      });
      if (alreadyEnrolled) {
        return next(
          new ApiError(400, "Student is already enrolled in this course.")
        );
      }

      await Enrollment.create({ student: studentId, course: courseId });

      course.enrolledStudents.push(studentId);
      await course.save();

      res
        .status(200)
        .json({ success: true, message: "Student assigned to course." });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
