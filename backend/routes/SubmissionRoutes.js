import express from "express";
import { protect, authorize } from "../middleware/AuthMiddleware.js";
import { upload, saveToGridFS } from "../config/gridfs.js";
import {
  SubmitTask,
  GetMySubmissions,
  GetSubmissionsForMentor,
  ReviewSubmission,
  GetAllSubmissions,
  ServeFile,
} from "../controllers/SubmissionController.js";

const router = express.Router();

router.post("/",    protect(["Intern"]), authorize("Intern"), upload.single("file"), saveToGridFS, SubmitTask);
router.get("/my",   protect(["Intern"]), authorize("Intern"), GetMySubmissions);

router.get("/mentor",               protect(["Mentor"]), authorize("Mentor"), GetSubmissionsForMentor);
router.put("/:submissionId/review", protect(["Mentor"]), authorize("Mentor"), ReviewSubmission);

router.get("/all",  protect(["HR", "Admin"]), authorize("HR", "Admin"), GetAllSubmissions);

// ─── File serving route — streams file from GridFS ────────────────────────────
// GET /api/submissions/file/:fileId?bucket=submissions
router.get("/file/:fileId", protect(["Intern", "Mentor", "HR"]), authorize("Intern", "Mentor", "HR"), ServeFile);

export default router;