import Submission from "../models/Submission.js";
import Task from "../models/Task.js";
import Intern from "../models/Intern.js";
import Mentor from "../models/Mentor.js";
import User from "../models/User.js";
import { streamFile } from "../config/gridfs.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInternFromUser = async (userId) => {
  let intern = await Intern.findOne({ userId });
  if (!intern) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    intern = await Intern.findOne({ email: user.email });
  }
  if (!intern) throw new Error("Intern profile not found");
  if (!intern.userId) { intern.userId = userId; await intern.save(); }
  return intern;
};

const getMentorFromUser = async (userId) => {
  let mentor = await Mentor.findOne({ userId });
  if (!mentor) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    mentor = await Mentor.findOne({ email: user.email });
  }
  if (!mentor) throw new Error("Mentor profile not found");
  if (!mentor.userId) { mentor.userId = userId; await mentor.save(); }
  return mentor;
};

const errMsg = (e) => {
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  if (e?.message) return e.message;
  try { return JSON.stringify(e); } catch { return "Unknown error"; }
};

// ─── Intern: Submit a task ────────────────────────────────────────────────────
export const SubmitTask = async (req, res) => {
  try {
    const { taskId, note } = req.body;
    if (!taskId) return res.status(400).json({ message: "taskId is required." });

    const intern = await getInternFromUser(req.user.id);

    const task = await Task.findOne({ _id: taskId, internId: intern._id });
    if (!task) return res.status(404).json({ message: "Task not found or not assigned to you." });

    const existing = await Submission.findOne({ taskId, internId: intern._id });
    if (existing) return res.status(400).json({ message: "You have already submitted this task." });

    // req.file is populated by saveToGridFS middleware
    const fileId     = req.file ? req.file.id.toString()   : null;
    const fileName   = req.file ? req.file.filename         : null;
    const fileBucket = req.file ? req.file.bucketName       : null;
    // original name for display — stored in GridFS metadata and passed through
    const fileOriginalName = req.file ? req.file.originalname : null;

    const submission = await Submission.create({
      taskId,
      internId: intern._id,
      note: note || "",
      fileId,
      fileName,
      fileBucket,
      fileOriginalName,
      // fileUrl is the API route to stream the file — works on any device/server
      fileUrl: fileId
        ? `/api/submissions/file/${fileId}?bucket=${fileBucket}`
        : null,
    });

    await Task.findByIdAndUpdate(taskId, { status: "Submitted" });
    res.status(201).json({ message: "Task submitted successfully.", submission });
  } catch (error) {
    console.error("[SubmitTask] ERROR:", error);
    res.status(500).json({ message: errMsg(error) });
  }
};

// ─── Stream file from GridFS ──────────────────────────────────────────────────
export const ServeFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const bucket = req.query.bucket || "submissions";
    await streamFile(fileId, bucket, res);
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};

// ─── Intern: Get my submissions ───────────────────────────────────────────────
export const GetMySubmissions = async (req, res) => {
  try {
    const intern = await getInternFromUser(req.user.id);
    const submissions = await Submission.find({ internId: intern._id })
      .populate("taskId", "title description status dueDate")
      .sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};

// ─── Mentor: Get submissions for their tasks ──────────────────────────────────
export const GetSubmissionsForMentor = async (req, res) => {
  try {
    const mentor = await getMentorFromUser(req.user.id);
    const mentorTasks = await Task.find({ mentorId: mentor._id }).select("_id");
    const taskIds = mentorTasks.map((t) => t._id);
    const submissions = await Submission.find({ taskId: { $in: taskIds } })
      .populate("taskId", "title description status")
      .populate("internId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};

// ─── Mentor: Review a submission ──────────────────────────────────────────────
export const ReviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { feedback, rating } = req.body;
    const mentor = await getMentorFromUser(req.user.id);

    const submission = await Submission.findById(submissionId).populate("taskId");
    if (!submission) return res.status(404).json({ message: "Submission not found." });

    if (submission.taskId.mentorId.toString() !== mentor._id.toString())
      return res.status(403).json({ message: "Not authorized to review this submission." });

    submission.feedback = feedback;
    submission.rating   = rating;
    submission.status   = "Reviewed";
    await submission.save();

    await Task.findByIdAndUpdate(submission.taskId._id, { status: "Reviewed" });
    res.status(200).json({ message: "Reviewed successfully.", submission });
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};

// ─── HR/Admin: Get all submissions ───────────────────────────────────────────
export const GetAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("taskId", "title description status")
      .populate("internId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: errMsg(error) });
  }
};