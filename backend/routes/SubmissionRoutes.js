import express from "express";
import { protect, authorize } from "../middleware/AuthMiddleware.js";
import { upload } from "../config/cloudinary.js";
import {
  SubmitTask,
  GetMySubmissions,
  GetSubmissionsForMentor,
  ReviewSubmission,
  GetAllSubmissions,
} from "../controllers/SubmissionController.js";

const router = express.Router();

router.post("/",    protect(["Intern"]), authorize("Intern"), upload.single("file"), SubmitTask);
router.get("/my",   protect(["Intern"]), authorize("Intern"), GetMySubmissions);

router.get("/mentor",               protect(["Mentor"]), authorize("Mentor"), GetSubmissionsForMentor);
router.put("/:submissionId/review", protect(["Mentor"]), authorize("Mentor"), ReviewSubmission);

router.get("/all", protect(["HR", "Admin"]), authorize("HR", "Admin"), GetAllSubmissions);

export default router;
