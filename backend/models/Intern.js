import mongoose from "mongoose";

const Intern = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    name: {
      type: String,
      required: true
    },

    gender: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },


    college: {
      type: String,
      required: true
    },

    department: {
      type: String
    },

    skills: {
      type: [String],
      default: []
    },

    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program"
    },

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor"        // fixed: was "User"
    },

    status: {
      type: String,
      enum: ["Active", "Completed", "Dropped"],
      default: "Active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Intern", Intern);
