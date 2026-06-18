require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns"); // By Priyam
dns.setServers(["1.1.1.1"]);

const connectDB = async () => {
  try {
    // console.log(process.env.MONGODB_URL);
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

module.exports = connectDB;
