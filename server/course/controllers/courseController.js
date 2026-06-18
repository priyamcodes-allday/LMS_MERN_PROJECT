const Course = require("../models/Course");

class CourseController {
  async createCourse(req, res) {
    try {
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
}

module.exports = new CourseController();
