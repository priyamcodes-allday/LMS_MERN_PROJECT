// const Course = require("../../course/models/Course");
// const Enrollment = require("../models/enrollmentSchema");
// const ApiError = require("../utils/apiError");

// class TeacherController {
//   // GET /api/teacher/dashboard
//   async getDashboard(req, res, next) {
//     try {
//       const courses = await Course.find({ teacher: req.user._id });

//       const totalCourses = courses.length;
//       const draftCourses = courses.filter((c) => c.status === "draft").length;
//       const pendingCourses = courses.filter(
//         (c) => c.status === "pending"
//       ).length;
//       const approvedCourses = courses.filter(
//         (c) => c.status === "approved"
//       ).length;
//       const rejectedCourses = courses.filter(
//         (c) => c.status === "rejected"
//       ).length;
//       const inactiveCourses = courses.filter((c) => !c.isActive).length;

//       // Count total enrollments across all of this teacher's courses
//       const courseIds = courses.map((c) => c._id);
//       const totalEnrollments = await Enrollment.countDocuments({
//         course: { $in: courseIds },
//       });

//       res.status(200).json({
//         success: true,
//         stats: {
//           totalCourses,
//           draftCourses,
//           pendingCourses,
//           approvedCourses,
//           rejectedCourses,
//           inactiveCourses,
//           totalEnrollments,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // POST /api/teacher/courses
//   // Creates a course as "draft" by default. Teacher submits it for review separately
//   // via submitForApproval(), matching the schema's draft -> pending -> approved flow.
//   async createCourse(req, res, next) {
//     try {
//       const {
//         title,
//         description,
//         price,
//         category,
//         thumbnail,
//         thumbnailPublicId,
//       } = req.body;

//       const course = await Course.create({
//         title,
//         description,
//         price,
//         category,
//         thumbnail,
//         thumbnailPublicId,
//         teacher: req.user._id,
//         status: "draft", // matches schema default - not submitted for approval yet
//       });

//       res.status(201).json({
//         success: true,
//         message:
//           "Course created as draft. Add lessons, then submit for approval.",
//         course,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // PUT /api/teacher/courses/:id/submit
//   // Moves a course from "draft" (or "rejected") to "pending" so admin can review it.
//   // Separated from createCourse/updateCourse since submitting for approval is its
//   // own deliberate action, not something that should happen on every edit.
//   async submitForApproval(req, res, next) {
//     try {
//       const course = await Course.findOne({
//         _id: req.params.id,
//         teacher: req.user._id,
//       });

//       if (!course) return next(new ApiError(404, "Course not found."));

//       if (course.status === "approved") {
//         return next(new ApiError(400, "This course is already approved."));
//       }

//       if (!course.lessons || course.lessons.length === 0) {
//         return next(
//           new ApiError(
//             400,
//             "Add at least one lesson before submitting for approval."
//           )
//         );
//       }

//       course.status = "pending";
//       await course.save();

//       res.status(200).json({
//         success: true,
//         message: "Course submitted for admin approval.",
//         course,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // GET /api/teacher/courses
//   // Supports optional ?status=draft|pending|approved|rejected filter
//   async getMyCourses(req, res, next) {
//     try {
//       const { status } = req.query;

//       const filter = { teacher: req.user._id };
//       if (status) filter.status = status;

//       const courses = await Course.aggregate([
//         { $match: filter },
//         {
//           $lookup: {
//             from: "categories",
//             localField: "category",
//             foreignField: "_id",
//             as: "category",
//           },
//         },
//         { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
//         {
//           $project: {
//             title: 1,
//             description: 1,
//             price: 1,
//             thumbnail: 1,
//             status: 1,
//             isActive: 1,
//             category: 1,
//             enrolledStudents: 1,
//             createdAt: 1,
//             // Send lesson count here, not full lesson content - keeps list view light
//             lessonCount: { $size: { $ifNull: ["$lessons", []] } },
//           },
//         },
//       ]);

//       res.status(200).json({ success: true, count: courses.length, courses });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // GET /api/teacher/courses/:id  (full detail, including lessons, for editing)
//   async getCourseById(req, res, next) {
//     try {
//       const course = await Course.findOne({
//         _id: req.params.id,
//         teacher: req.user._id,
//       }).populate("category", "name");
//       // populate() is fine here since this is a single-document fetch by the
//       // owning teacher, not a list aggregation - low overhead either way

//       if (!course) return next(new ApiError(404, "Course not found."));

//       res.status(200).json({ success: true, course });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // PUT /api/teacher/courses/:id
//   async updateCourse(req, res, next) {
//     try {
//       const course = await Course.findOne({
//         _id: req.params.id,
//         teacher: req.user._id, // teacher can only update their own course
//       });

//       if (!course) return next(new ApiError(404, "Course not found."));

//       const {
//         title,
//         description,
//         price,
//         category,
//         thumbnail,
//         thumbnailPublicId,
//       } = req.body;

//       course.title = title || course.title;
//       course.description = description || course.description;
//       course.price = price ?? course.price;
//       course.category = category || course.category;
//       course.thumbnail = thumbnail || course.thumbnail;
//       course.thumbnailPublicId = thumbnailPublicId || course.thumbnailPublicId;

//       // Only force re-approval if the course was already live (approved).
//       // Editing a draft should stay a draft - it hasn't been reviewed yet either way.
//       if (course.status === "approved") {
//         course.status = "pending";
//       }

//       await course.save();

//       res.status(200).json({
//         success: true,
//         message:
//           course.status === "pending"
//             ? "Course updated. Awaiting admin re-approval."
//             : "Course updated.",
//         course,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // ─── LESSON MANAGEMENT ──────────────────────
//   // Lessons live as an embedded array inside the course document, so they're
//   // managed through the parent course rather than a separate collection/model.

//   // POST /api/teacher/courses/:id/lessons
//   async addLesson(req, res, next) {
//     try {
//       const course = await Course.findOne({
//         _id: req.params.id,
//         teacher: req.user._id,
//       });

//       if (!course) return next(new ApiError(404, "Course not found."));

//       const { title, videoUrl, resources, duration, order } = req.body;

//       course.lessons.push({
//         title,
//         videoUrl,
//         resources,
//         duration,
//         order: order ?? course.lessons.length + 1,
//       });

//       await course.save();

//       res.status(201).json({
//         success: true,
//         message: "Lesson added.",
//         lessons: course.lessons,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // PUT /api/teacher/courses/:id/lessons/:lessonId
//   async updateLesson(req, res, next) {
//     try {
//       const course = await Course.findOne({
//         _id: req.params.id,
//         teacher: req.user._id,
//       });

//       if (!course) return next(new ApiError(404, "Course not found."));

//       const lesson = course.lessons.id(req.params.lessonId);
//       if (!lesson) return next(new ApiError(404, "Lesson not found."));

//       const { title, videoUrl, resources, duration, order } = req.body;

//       lesson.title = title || lesson.title;
//       lesson.videoUrl = videoUrl || lesson.videoUrl;
//       lesson.resources = resources || lesson.resources;
//       lesson.duration = duration ?? lesson.duration;
//       lesson.order = order ?? lesson.order;

//       await course.save();

//       res.status(200).json({
//         success: true,
//         message: "Lesson updated.",
//         lessons: course.lessons,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // DELETE /api/teacher/courses/:id/lessons/:lessonId
//   async deleteLesson(req, res, next) {
//     try {
//       const course = await Course.findOne({
//         _id: req.params.id,
//         teacher: req.user._id,
//       });

//       if (!course) return next(new ApiError(404, "Course not found."));

//       const lesson = course.lessons.id(req.params.lessonId);
//       if (!lesson) return next(new ApiError(404, "Lesson not found."));

//       lesson.deleteOne(); // removes this subdocument from the lessons array
//       await course.save();

//       res.status(200).json({
//         success: true,
//         message: "Lesson deleted.",
//         lessons: course.lessons,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   // ─── STUDENTS ────────────────────────────────
//   // GET /api/teacher/students
//   async getMyStudents(req, res, next) {
//     try {
//       const courses = await Course.find({ teacher: req.user._id }).select(
//         "_id title"
//       );
//       const courseIds = courses.map((c) => c._id);

//       // Aggregation instead of populate() to stay consistent with the rest
//       // of the codebase's read pattern
//       const enrollments = await Enrollment.aggregate([
//         { $match: { course: { $in: courseIds } } },
//         {
//           $lookup: {
//             from: "users",
//             localField: "student",
//             foreignField: "_id",
//             as: "student",
//           },
//         },
//         { $unwind: "$student" },
//         {
//           $lookup: {
//             from: "courses",
//             localField: "course",
//             foreignField: "_id",
//             as: "course",
//           },
//         },
//         { $unwind: "$course" },
//         {
//           $project: {
//             "student._id": 1,
//             "student.name": 1,
//             "student.email": 1,
//             "course._id": 1,
//             "course.title": 1,
//             enrolledAt: 1,
//             paymentStatus: 1,
//           },
//         },
//       ]);

//       res
//         .status(200)
//         .json({ success: true, count: enrollments.length, enrollments });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// module.exports = new TeacherController();

const Course = require("../../course/models/Course");
const Enrollment = require("../models/enrollmentSchema");
const ApiError = require("../utils/apiError");



class TeacherController {
  // GET /api/teacher/dashboard
  async getDashboard(req, res, next) {
    try {
      const courses = await Course.find({ teacher: req.user._id });

      const totalCourses = courses.length;
      const draftCourses = courses.filter((c) => c.status === "draft").length;
      const pendingCourses = courses.filter(
        (c) => c.status === "pending"
      ).length;
      const approvedCourses = courses.filter(
        (c) => c.status === "approved"
      ).length;
      const rejectedCourses = courses.filter(
        (c) => c.status === "rejected"
      ).length;
      const inactiveCourses = courses.filter((c) => !c.isActive).length;

      // Count total enrollments across all of this teacher's courses
      const courseIds = courses.map((c) => c._id);
      const totalEnrollments = await Enrollment.countDocuments({
        course: { $in: courseIds },
      });

      res.status(200).json({
        success: true,
        stats: {
          totalCourses,
          draftCourses,
          pendingCourses,
          approvedCourses,
          rejectedCourses,
          inactiveCourses,
          totalEnrollments,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  
  async submitForApproval(req, res, next) {
    try {
      const course = await Course.findOne({
        _id: req.params.id,
        teacher: req.user._id, // teacher can only submit their own course
      });

      if (!course) return next(new ApiError(404, "Course not found."));

      if (course.status === "approved") {
        return next(new ApiError(400, "This course is already approved."));
      }

      if (!course.lessons || course.lessons.length === 0) {
        return next(
          new ApiError(
            400,
            "Add at least one lesson before submitting for approval."
          )
        );
      }

      course.status = "pending";
      await course.save();

      res.status(200).json({
        success: true,
        message: "Course submitted for admin approval.",
        course,
      });
    } catch (error) {
      next(error);
    }
  }


  async getMyCourses(req, res, next) {
    try {
      const { status } = req.query;

      const filter = { teacher: req.user._id };
      if (status) filter.status = status;

      const courses = await Course.aggregate([
        { $match: filter },
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
            createdAt: 1,
            // Send lesson count here, not full lesson content - keeps list view light
            lessonCount: { $size: { $ifNull: ["$lessons", []] } },
          },
        },
      ]);

      res.status(200).json({ success: true, count: courses.length, courses });
    } catch (error) {
      next(error);
    }
  }


  async getMyStudents(req, res, next) {
    try {
      const courses = await Course.find({ teacher: req.user._id }).select(
        "_id title"
      );
      const courseIds = courses.map((c) => c._id);

     
      const enrollments = await Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        {
          $lookup: {
            from: "users",
            localField: "student",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: "$student" },
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
          $project: {
            "student._id": 1,
            "student.name": 1,
            "student.email": 1,
            "course._id": 1,
            "course.title": 1,
            enrolledAt: 1,
            paymentStatus: 1,
          },
        },
      ]);

      res
        .status(200)
        .json({ success: true, count: enrollments.length, enrollments });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeacherController();
