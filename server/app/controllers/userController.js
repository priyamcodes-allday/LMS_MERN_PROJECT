const User = require("../models/userSchema");

class UserController {

  // Register User
  register = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists"
        });
      }

      const user = await User.create({
        name,
        email,
        password
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };


  // Login User
  login = async (req, res) => {
    try {

      const { email, password } = req.body;


      const user = await User.findOne({
        email,
        password
      });


      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password"
        });
      }


      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: user
      });


    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  };

}


module.exports = new UserController();