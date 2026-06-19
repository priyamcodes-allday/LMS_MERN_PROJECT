const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "completed",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Enrollment", enrollmentSchema);
 