const Wishlist = require("../models/Wishlist");
const Course = require("../models/Course");
const User = require("../../auth/models/userSchema");

class WishlistController {
  // Add to wishlist
  async addToWishlist(req, res) {
    try {
      const { student, course } = req.body;

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

      let wishlist = await Wishlist.findOne({ student });

      if (!wishlist) {
        wishlist = await Wishlist.create({
          student,
          courses: [course],
        });

        return res.status(201).json({
          success: true,
          message: "Course added to wishlist",
          data: wishlist,
        });
      }

      const alreadyExists = wishlist.courses.some(
        (courseId) => courseId.toString() === course,
      );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: "Course already in wishlist",
        });
      }

      wishlist.courses.push(course);

      await wishlist.save();

      res.status(200).json({
        success: true,
        message: "Course added to wishlist",
        data: wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get wishlist
  async getWishlist(req, res) {
    try {
      const { studentId } = req.params;

      const wishlist = await Wishlist.findOne({
        student: studentId,
      }).populate({
        path: "courses",
        select: "title description price thumbnail",
      });

      res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Remove Wishlist
  async removeFromWishlist(req, res) {
    try {
      const { student, course } = req.body;

      const wishlist = await Wishlist.findOne({ student });

      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message: "Wishlist not found",
        });
      }

      const exists = wishlist.courses.some((id) => id.toString() === course);

      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "Course not in wishlist",
        });
      }

      wishlist.courses = wishlist.courses.filter(
        (id) => id.toString() !== course,
      );

      await wishlist.save();

      res.status(200).json({
        success: true,
        message: "Removed from wishlist",
        data: wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new WishlistController();
