import express from "express";
import multer from "multer";
import path from "path";
import { protect, authorize } from "../middleware/AuthMiddleware.js";
import {
  SubmitTask,
  GetMySubmissions,
  GetSubmissionsForMentor,
  ReviewSubmission,
  GetAllSubmissions,
} from "../controllers/SubmissionController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|zip|png|jpg|jpeg/;
    allowed.test(path.extname(file.originalname).toLowerCase().replace(".", ""))
      ? cb(null, true) : cb(new Error("File type not allowed."));
  },
});

router.post("/",    protect(["Intern"]), authorize("Intern"), upload.single("file"), SubmitTask);
router.get("/my",   protect(["Intern"]), authorize("Intern"), GetMySubmissions);
router.get("/mentor",               protect(["Mentor"]), authorize("Mentor"), GetSubmissionsForMentor);
router.put("/:submissionId/review", protect(["Mentor"]), authorize("Mentor"), ReviewSubmission);
router.get("/all",  protect(["HR", "Mentor"]), authorize("HR", "Mentor"), GetAllSubmissions);

export default router;
