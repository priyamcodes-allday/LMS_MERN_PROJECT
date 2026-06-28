const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const Course = require("../models/Course");
const User = require("../../auth/models/userSchema");
const Enrollment = require("../../auth/models/enrollmentSchema");

class ProgressController {
  async completeLesson(req, res) {
    try {
      const { student, course, lessonId } = req.body;

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

      const courseExists = await Course.findById(course);

      if (!courseExists) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const enrolled = await Enrollment.findOne({
        student,
        course,
      });

      if (!enrolled) {
        return res.status(400).json({
          success: false,
          message: "Student not enrolled",
        });
      }

      const lessonExists = courseExists.lessons.id(lessonId);

      if (!lessonExists) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      let progress = await Progress.findOne({
        student,
        course,
      });

      if (!progress) {
        progress = await Progress.create({
          student,
          course,
          completedLessons: [],
        });
      }

      const alreadyCompleted = progress.completedLessons.some(
        (id) => id.toString() === lessonId,
      );

      if (alreadyCompleted) {
        return res.status(400).json({
          success: false,
          message: "Lesson already completed",
        });
      }

      progress.completedLessons.push(lessonId);

      const totalLessons = courseExists.lessons.length;

      progress.progressPercentage =
        (progress.completedLessons.length / totalLessons) * 100;

      await progress.save();

      res.status(200).json({
        success: true,
        message: "Lesson completed",
        progress: progress.progressPercentage,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProgress(req, res) {
    try {
      const { studentId, courseId } = req.params;

      const progressData = await Progress.aggregate([
        {
          // 1. Find the specific progress document matching student and course
          $match: {
            student: new mongoose.Types.ObjectId(studentId),
            course: new mongoose.Types.ObjectId(courseId),
          },
        },
        {
          // 2. Join with the courses collection to get all course details (including lessons array)
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        {
          // Flatten the courseDetails array to an object
          $unwind: {
            path: "$courseDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          // 3. Perform all shapes, projections, and filtrations here
          $project: {
            _id: 0, // Exclude the progress document ID if you don't need it
            student: "$student",

            // Re-create the structure of your populated course (selecting only 'title')
            course: {
              _id: "$courseDetails._id",
              title: "$courseDetails.title",
            },

            progressPercentage: "$progressPercentage",

            // Replace your JS .filter() and .some() logic with a MongoDB $filter operator
            completedLessons: {
              $filter: {
                input: "$courseDetails.lessons", // The array of all lessons inside the course
                as: "lesson",
                cond: {
                  // Condition: check if the current lesson's _id exists in the progress.completedLessons array
                  $in: ["$$lesson._id", "$completedLessons"],
                },
              },
            },
          },
        },
      ]);

      // Since aggregate returns an array, check if we found a matching progress record
      if (!progressData || progressData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Progress not found",
        });
      }

      res.status(200).json({
        success: true,
        data: progressData[0], // Return the single constructed object
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ProgressController();
