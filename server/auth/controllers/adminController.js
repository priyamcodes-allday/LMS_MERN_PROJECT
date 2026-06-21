const bcrypt = require("bcryptjs");
const User = require("../models/userSchema");
const Course = require("../models/courseSchema");
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
      const pendingCourses = await Course.countDocuments({ status: "pending" });

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalCourses,
          pendingTeachers,
          pendingCourses,
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

  // POST /api/admin/users/create  (admin creates a student or teacher directly)
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
        isEmailVerified: true, // admin-created users skip email verification
        isApproved: true,
      });

      res.status(201).json({ success: true, message: "User created.", user });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/users/:id
  async deleteUser(req, res, next) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return next(new ApiError(404, "User not found."));
      res.status(200).json({ success: true, message: "User deleted." });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/users/:id/role  (change someone's role)
  async changeUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-password");
      if (!user) return next(new ApiError(404, "User not found."));
      res.status(200).json({ success: true, message: "Role updated.", user });
    } catch (error) {
      next(error);
    }
  }

  // ─── TEACHER APPROVAL ───────────────────────
  async getPendingTeachers(req, res, next) {
    try {
      const profiles = await TeacherProfile.aggregate([
        { $match: { status: "pending" } },
        {
          $lookup: {
            from: "users", // actual MongoDB collection name (lowercase, plural)
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" }, // converts user array (from lookup) into a single object
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

  // PUT /api/admin/teachers/:id/approve
  async approveTeacher(req, res, next) {
    try {
      const updatedProfile = await TeacherProfile.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { new: true }
      );

      if (!updatedProfile)
        return next(new ApiError(404, "Teacher profile not found."));

      // Use aggregation to join user details instead of populate
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

      // Approve the user account too
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

  // PUT /api/admin/teachers/:id/reject
  async rejectTeacher(req, res, next) {
    try {
      const { reason } = req.body;

      const profile = await TeacherProfile.findByIdAndUpdate(
        req.params.id,
        { status: "rejected", rejectionReason: reason },
        { new: true }
      ).populate("user");

      if (!profile)
        return next(new ApiError(404, "Teacher profile not found."));

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

  // ─── COURSE MANAGEMENT ──────────────────────
  async getAllCourses(req, res, next) {
    try {
      const courses = await Course.aggregate([
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
            status: 1,
            category: 1,
            level: 1,
            enrolledStudents: 1,
            createdAt: 1,
            "teacher._id": 1,
            "teacher.name": 1,
            "teacher.email": 1,
          },
        },
      ]);

      res.status(200).json({ success: true, count: courses.length, courses });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/courses/:id/approve
  async approveCourse(req, res, next) {
    try {
      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { new: true }
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

      await sendEmail({
        to: course.teacher.email,
        subject: "Course Approved - LMS Platform",
        html: courseApprovedTemplate(course.teacher.name, course.title),
      });

      res
        .status(200)
        .json({ success: true, message: "Course approved.", course });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/courses/:id/reject
  async rejectCourse(req, res, next) {
    try {
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { new: true }
      );
      if (!course) return next(new ApiError(404, "Course not found."));
      res.status(200).json({ success: true, message: "Course rejected." });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/courses/:id
  async deleteCourse(req, res, next) {
    try {
      const course = await Course.findByIdAndDelete(req.params.id);
      if (!course) return next(new ApiError(404, "Course not found."));
      res.status(200).json({ success: true, message: "Course deleted." });
    } catch (error) {
      next(error);
    }
  }

  // ─── ASSIGN STUDENT TO TEACHER ──────────────
  async assignStudentToTeacher(req, res, next) {
    try {
      const { studentId, courseId } = req.body;

      const student = await User.findById(studentId);
      if (!student || student.role !== "student") {
        return next(new ApiError(404, "Student not found."));
      }

      const course = await Course.findById(courseId);
      if (!course) return next(new ApiError(404, "Course not found."));

      // Check if already enrolled
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

      // Add to course's enrolledStudents list
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
