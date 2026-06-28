const mongoose = require("mongoose");
const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../../auth/models/userSchema");
const cloudinary = require("../../../config/cloudinary");

class CourseController {
  // Create Course
  async createCourse(req, res) {
    try {
      // Category Check
      const { category } = req.body;

      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Instructor Check
      const { teacher } = req.body;

      const teacherExists = await User.findOne({
        _id: teacher,
        role: "teacher",
      });

      if (!teacherExists) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      //Create Course
      const course = await Course.create(req.body);

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get All Courses
  async getAllCourses(req, res) {
    try {
      const courses = await Course.aggregate([
        {
          $match: {
            isActive: true,
            status: "approved",
          },
        },
        {
          // 1. Join with the categories collection
          $lookup: {
            from: "categories", // MongoDB collection name for categories
            localField: "category", // Reference field in Course schema
            foreignField: "_id", // Target field in Category schema
            as: "category",
          },
        },
        {
          // Flatten the category array into a single object
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          // 2. Join with the users collection for the teacher
          $lookup: {
            from: "users", // MongoDB collection name for userSchema
            localField: "teacher", // Reference field in Course schema
            foreignField: "_id", // Target field in User schema
            as: "teacher",
          },
        },
        {
          // Flatten the teacher array into a single object
          $unwind: {
            path: "$teacher",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          // 3. Project the root course fields along with specific joined fields
          $project: {
            // Include everything from the course document except the raw fields we overrode
            _id: 1,
            title: 1,
            description: 1,
            price: 1,
            thumbnail: 1,
            status: 1,
            duration: 1,
            lessons: 1,
            createdAt: 1,
            updatedAt: 1,

            // Select specific category fields
            "category._id": 1,
            "category.name": 1,

            // Select specific teacher fields (Excluding sensitive data like passwords)
            "teacher._id": 1,
            "teacher.name": 1,
            "teacher.email": 1,
            "teacher.role": 1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get Course By ID
  async getCourseById(req, res) {
    try {
      const course = await Course.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id),
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
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
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
        {
          $unwind: {
            path: "$teacher",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            price: 1,
            thumbnail: 1,
            previewVideo: 1,
            status: 1,
            lessons: 1,
            createdAt: 1,
            updatedAt: 1,

            category: {
              _id: "$category._id",
              name: "$category.name",
              description: "$category.description",
            },

            teacher: {
              _id: "$teacher._id",
              name: "$teacher.name",
              email: "$teacher.email",
              role: "$teacher.role",
              avatar: "$teacher.avatar",
            },
          },
        },
      ]);

      if (!course.length) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      res.status(200).json({
        success: true,
        data: course[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update Course
  async updateCourse(req, res) {
    try {
      const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        data: course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete Course
  async deleteCourse(req, res) {
    try {
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        {
          isActive: false,
        },
        {
          new: true,
        },
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Course deactivated successfully",
        data: course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Search Course
  async searchCourses(req, res) {
    try {
      const { keyword } = req.query;

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: "Keyword is required",
        });
      }

      const courses = await Course.find({
        isActive: true,
        title: {
          $regex: keyword,
          $options: "i",
        },
      });

      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Filter Course
  async filterCourses(req, res) {
    try {
      const { category, minPrice, maxPrice } = req.query;

      const filter = {
        isActive: true,
      };

      if (category) {
        filter.category = category;
      }

      if (minPrice || maxPrice) {
        filter.price = {};

        if (minPrice) {
          filter.price.$gte = Number(minPrice);
        }

        if (maxPrice) {
          filter.price.$lte = Number(maxPrice);
        }
      }

      const courses = await Course.find(filter);

      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Add Lesson
  async addLesson(req, res) {
    try {
      const { courseId } = req.params;

      const course = await Course.findOne({
        _id: courseId,
        isActive: true,
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const { title, videoUrl, resources, duration, order } = req.body;

      const lessonExists = course.lessons.some(
        (lesson) => lesson.order === order,
      );

      if (lessonExists) {
        return res.status(400).json({
          success: false,
          message: "Lesson order already exists",
        });
      }

      course.lessons.push({
        title,
        videoUrl,
        resources,
        duration,
        order,
      });

      await course.save();

      res.status(201).json({
        success: true,
        message: "Lesson added successfully",
        data: course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get All Lessons
  async getCourseLessons(req, res) {
    try {
      const { courseId } = req.params;

      const course = await Course.findOne({
        _id: courseId,
        isActive: true,
      }).select("title lessons");

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const lessons = [...course.lessons].sort((a, b) => a.order - b.order);

      res.status(200).json({
        success: true,
        course: course.title,
        count: lessons.length,
        data: lessons,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update lesson
  async updateLesson(req, res) {
    try {
      const { courseId, lessonId } = req.params;

      const course = await Course.findOne({
        _id: courseId,
        isActive: true,
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const lesson = course.lessons.id(lessonId);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      Object.assign(lesson, req.body);

      await course.save();

      res.status(200).json({
        success: true,
        message: "Lesson updated successfully",
        data: lesson,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete lesson
  async deleteLesson(req, res) {
    try {
      const { courseId, lessonId } = req.params;

      const course = await Course.findOne({
        _id: courseId,
        isActive: true,
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const lesson = course.lessons.id(lessonId);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      lesson.deleteOne();

      await course.save();

      res.status(200).json({
        success: true,
        message: "Lesson deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //Thumbnail Upload
  async uploadThumbnail(req, res) {
    try {
      const { courseId } = req.params;

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an image",
        });
      }

      if (course.thumbnailPublicId) {
        await cloudinary.uploader.destroy(course.thumbnailPublicId);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "lms/courses",
      });

      course.thumbnail = result.secure_url;
      course.thumbnailPublicId = result.public_id;

      await course.save();

      res.status(200).json({
        success: true,
        message: "Thumbnail uploaded successfully",
        thumbnail: course.thumbnail,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CourseController();
