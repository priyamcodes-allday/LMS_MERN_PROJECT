// Ye tab use hoga jab koi student "Become Instructor" ke liye apply karega.

const mongoose = require("mongoose");

const instructorRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    experience: {
      type: String,
      required: true,
      trim: true,
    },

    expertise: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("InstructorRequest", instructorRequestSchema);
