import express from "express";
import { protect, authorize } from "../middleware/AuthMiddleware.js";
import { upload, saveToGridFS } from "../config/GridFS.js";
import { CreateTask, GetTasksByIntern, GetTasksByMentor, UpdateTaskStatus } from "../controllers/TaskController.js";

const router = express.Router();

router.post("/mentor", protect(["Mentor"]), authorize("Mentor"), upload.single("file"), saveToGridFS, CreateTask);
router.get("/mentor",  protect(["Mentor"]), authorize("Mentor"), GetTasksByMentor);

router.get("/intern",         protect(["Intern"]), authorize("Intern"), GetTasksByIntern);
router.put("/:taskId/status", protect(["Intern"]), authorize("Intern"), UpdateTaskStatus);

export default router;