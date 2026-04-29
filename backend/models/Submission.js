import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    internId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String, // path stored by multer, e.g. "uploads/filename.pdf"
      default: null,
    },
    feedback: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    status: {
      type: String,
      enum: ["Submitted", "Reviewed"],
      default: "Submitted",
    },
    fileOriginalName: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Submission", SubmissionSchema);
