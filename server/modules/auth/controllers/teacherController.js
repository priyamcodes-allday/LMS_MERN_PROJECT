const mongoose = require("mongoose");
const fs = require("fs");
const Course = require("../../course/models/Course");
const Category = require("../../course/models/Category");
const Enrollment = require("../models/enrollmentSchema");
const ApiError = require("../utils/apiError");
const cloudinary = require("../../../config/cloudinary");

const removeTempFile = (filePath) => {
  if (!filePath) return;
  fs.promises.unlink(filePath).catch(() => {});
};

const ensureCloudinaryConfigured = () => {
  if (
    !cloudinary.config().cloud_name ||
    !cloudinary.config().api_key ||
    !cloudinary.config().api_secret
  ) {
    throw new ApiError(500, "Cloudinary is not configured on the server.");
  }
};

class TeacherDashboardController {
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


  async createCourse(req, res, next) {
    try {
      const { title, description, price, category } = req.body;

      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return next(new ApiError(404, "Category not found."));
      }

      const course = await Course.create({
        title,
        description,
        price,
        category,
        teacher: req.user._id, 
        status: "draft",
      });

      res.status(201).json({
        success: true,
        message: "Course created as draft.",
        course,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCourses(req, res, next) {
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
            lessonCount: { $size: { $ifNull: ["$lessons", []] } },
          },
        },
      ]);

      res.status(200).json({ success: true, count: courses.length, courses });
    } catch (error) {
      next(error);
    }
  }

  async searchCourses(req, res, next) {
    try {
      const { keyword } = req.query;

      if (!keyword) {
        return next(new ApiError(400, "Keyword is required."));
      }

      const courses = await Course.find({
        teacher: req.user._id,
        title: { $regex: keyword, $options: "i" },
      });

      res.status(200).json({ success: true, count: courses.length, courses });
    } catch (error) {
      next(error);
    }
  }

  async filterCourses(req, res, next) {
    try {
      const { category, minPrice, maxPrice, status } = req.query;

      const filter = { teacher: req.user._id };

      if (category) filter.category = category;
      if (status) filter.status = status;

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const courses = await Course.find(filter);

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
            _id: new mongoose.Types.ObjectId(req.params.id),
            teacher: req.user._id,
          },
        },
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
            lessons: 1,
            enrolledStudents: 1,
            createdAt: 1,
            "category._id": 1,
            "category.name": 1,
            "category.description": 1,
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

  async updateCourse(req, res, next) {
    try {
      const course = await Course.findOne({
        _id: req.params.id,
        teacher: req.user._id, 
      });

      if (!course) return next(new ApiError(404, "Course not found."));

      const { title, description, price, category } = req.body;

      if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          return next(new ApiError(404, "Category not found."));
        }
        course.category = category;
      }

      course.title = title || course.title;
      course.description = description || course.description;
      course.price = price ?? course.price;

      if (course.status === "approved") {
        course.status = "pending";
      }

      await course.save();

      res.status(200).json({
        success: true,
        message:
          course.status === "pending"
            ? "Course updated. Awaiting admin re-approval."
            : "Course updated.",
        course,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitForApproval(req, res, next) {
    try {
      const course = await Course.findOne({
        _id: req.params.id,
        teacher: req.user._id,
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

  async deleteCourse(req, res, next) {
    try {
      const course = await Course.findOneAndUpdate(
        { _id: req.params.id, teacher: req.user._id },
        { isActive: false },
        { returnDocument: "after" }
      );

      if (!course) return next(new ApiError(404, "Course not found."));

      res.status(200).json({
        success: true,
        message: "Course deactivated.",
        course,
      });
    } catch (error) {
      next(error);
    }
  }

  async addLesson(req, res, next) {
    try {
      const course = await Course.findOne({
        _id: req.params.id,
        teacher: req.user._id,
      });

      if (!course) return next(new ApiError(404, "Course not found."));

      const { title, resources, duration, order } = req.body;

      let videoUrl = "";
      let videoPublicId = "";
      if(req.file){
        ensureCloudinaryConfigured();
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "lms/videos",
            resource_type: "video",
          })
          videoUrl = result.secure_url;
          videoPublicId = result.public_id;
        } finally {
          removeTempFile(req.file.path);
        }
      }

      const orderToUse = order ? Number(order) : course.lessons.length + 1;
      const durationToUse = duration ? Number(duration) : 0;

      const orderTaken = course.lessons.some((l) => l.order === orderToUse);
      if (orderTaken) {
        return next(new ApiError(400, "Lesson order already exists."));
      }

      course.lessons.push({
        title,
        videoUrl,
        videoPublicId,
        resources,
        duration: durationToUse,
        order: orderToUse,
      });

      await course.save();

      res.status(201).json({
        success: true,
        message: "Lesson added.",
        lessons: course.lessons,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCourseLessons(req, res, next) {
    try {
      const course = await Course.findOne({
        _id: req.params.id,
        teacher: req.user._id,
      }).select("title lessons");

      if (!course) return next(new ApiError(404, "Course not found."));

      const lessons = [...course.lessons].sort((a, b) => a.order - b.order);

      res.status(200).json({
        success: true,
        course: course.title,
        count: lessons.length,
        lessons,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLesson(req, res, next) {
    try {
      const course = await Course.findOne({
        _id: req.params.id,
        teacher: req.user._id,
      });

      if (!course) return next(new ApiError(404, "Course not found."));

      const lesson = course.lessons.id(req.params.lessonId);
      if (!lesson) return next(new ApiError(404, "Lesson not found."));

      const { title, videoUrl, resources, duration, order } = req.body;

      lesson.title = title || lesson.title;
      lesson.videoUrl = videoUrl || lesson.videoUrl;
      lesson.resources = resources || lesson.resources;
      lesson.duration = duration ?? lesson.duration;
      lesson.order = order ?? lesson.order;

      await course.save();

      res.status(200).json({
        success: true,
        message: "Lesson updated.",
        lesson,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLesson(req, res, next) {
    try {
      const course = await Course.findOne({
        _id: req.params.id,
        teacher: req.user._id,
      });

      if (!course) return next(new ApiError(404, "Course not found."));

      const lesson = course.lessons.id(req.params.lessonId);
      if (!lesson) return next(new ApiError(404, "Lesson not found."));

      lesson.deleteOne();
      await course.save();

      res.status(200).json({
        success: true,
        message: "Lesson deleted.",
        lessons: course.lessons,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadThumbnail(req, res, next) {
    try {
      const course = await Course.findOne({
        _id: req.params.id,
        teacher: req.user._id,
      });

      if (!course) return next(new ApiError(404, "Course not found."));

      if (!req.file) {
        return next(new ApiError(400, "Please upload an image."));
      }

      ensureCloudinaryConfigured();

      if (course.thumbnailPublicId) {
        await cloudinary.uploader.destroy(course.thumbnailPublicId);
      }

      let result;
      try {
        result = await cloudinary.uploader.upload(req.file.path, {
          folder: "lms/courses",
          resource_type: "image",
        });
      } finally {
        removeTempFile(req.file.path);
      }

      course.thumbnail = result.secure_url;
      course.thumbnailPublicId = result.public_id;

      await course.save();

      res.status(200).json({
        success: true,
        message: "Thumbnail uploaded successfully.",
        thumbnail: course.thumbnail,
      });
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

module.exports = new TeacherDashboardController();
