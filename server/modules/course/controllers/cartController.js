const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Course = require("../models/Course");
const User = require("../../auth/models/userSchema");

class CartController {
  // Add to Cart
  async addToCart(req, res) {
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

      let cart = await Cart.findOne({ student });

      // First course in cart
      if (!cart) {
        cart = await Cart.create({
          student,
          courses: [course],
        });

        return res.status(201).json({
          success: true,
          message: "Course added to cart",
          data: cart,
        });
      }

      // Duplicate check
      const alreadyInCart = cart.courses.some(
        (courseId) => courseId.toString() === course,
      );

      if (alreadyInCart) {
        return res.status(400).json({
          success: false,
          message: "Course already in cart",
        });
      }

      cart.courses.push(course);

      await cart.save();

      res.status(200).json({
        success: true,
        message: "Course added to cart",
        data: cart,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get Cart
  async getCart(req, res) {
    try {
      const cart = await Cart.aggregate([
        {
          // 1. Find the specific student's cart (Cast string to ObjectId)
          $match: {
            student: new mongoose.Types.ObjectId(req.params.studentId),
          },
        },
        {
          // 2. Join the courses array with the courses collection
          $lookup: {
            from: "courses", // MongoDB collection name for courses
            localField: "courses", // The array of course ObjectIds in your Cart schema
            foreignField: "_id", // The matching ID field in the Course schema
            as: "courses", // Replaces the ID array with the populated array of objects
          },
        },
        {
          // 3. Project the cart fields and select specific fields from the courses array
          $project: {
            _id: 1,
            student: 1,
            createdAt: 1,
            updatedAt: 1,
            // If you have fields like totalItems or totalPrice in Cart, list them here:
            // totalPrice: 1,

            // Map through the joined courses array to pick only specific fields (like .populate select)
            courses: {
              $map: {
                input: "$courses",
                as: "course",
                in: {
                  _id: "$$course._id",
                  title: "$$course.title",
                  description: "$$course.description",
                  price: "$$course.price",
                  thumbnail: "$$course.thumbnail",
                },
              },
            },
          },
        },
      ]);

      // Since Cart.findOne returns a single object or null, and aggregate returns an array:
      // We grab the first element, or send null if no cart exists yet.
      res.status(200).json({
        success: true,
        data: cart.length > 0 ? cart[0] : null,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //Remove from cart
  async removeFromCart(req, res) {
    try {
      const { student, course } = req.body;

      const cart = await Cart.findOne({ student });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      const courseExistsInCart = cart.courses.some(
        (courseId) => courseId.toString() === course,
      );

      if (!courseExistsInCart) {
        return res.status(404).json({
          success: false,
          message: "Course not found in cart",
        });
      }

      cart.courses = cart.courses.filter(
        (courseId) => courseId.toString() !== course,
      );

      await cart.save();

      res.status(200).json({
        success: true,
        message: "Course removed from cart",
        data: cart,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CartController();
