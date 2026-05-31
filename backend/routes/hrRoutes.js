import express from "express";
import { protect, authorize } from "../middleware/AuthMiddleware.js";
import {
    CreateProgram, GetPrograms, FindProgramById, DeleteProgram,
    GetInterns, GetInternByProgram, AddIntern, DeleteIntern,
    AssignInternToProgram, RemoveInternFromProgram,
    AddMentor, GetMentors, GetMentorById, DeleteMentor,
    AssignMentor, RemoveMentorFromProgram,
    AddHR, ApproveCertificate,
} from "../controllers/hrController.js";

const router = express.Router();

// ─── Programs ─────────────────────────────────────────────────────────────────
router.post("/program",              protect(["HR"]), authorize("HR"), CreateProgram);
router.get("/program",               protect(["HR"]), authorize("HR"), GetPrograms);
router.get("/findprogram/:id",       protect(["HR"]), authorize("HR"), FindProgramById);
router.delete("/delete-program/:id", protect(["HR"]), authorize("HR"), DeleteProgram);

// ─── Interns ──────────────────────────────────────────────────────────────────
router.get("/intern",                protect(["HR"]), authorize("HR"), GetInterns);
router.post("/intern",               protect(["HR"]), authorize("HR"), AddIntern);
router.delete("/delete-intern/:id",         protect(["HR"]), authorize("HR"), DeleteIntern);
router.get("/get-interns/:id",       protect(["HR"]), authorize("HR"), GetInternByProgram);
router.put("/assign-program",        protect(["HR"]), authorize("HR"), AssignInternToProgram);
router.put("/remove-intern",         protect(["HR"]), authorize("HR"), RemoveInternFromProgram);

// ─── Mentors ──────────────────────────────────────────────────────────────────
router.get("/mentor",                protect(["HR"]), authorize("HR"), GetMentors);
router.post("/add-mentor",           protect(["HR"]), authorize("HR"), AddMentor);
router.delete("/delete-mentor/:id",         protect(["HR"]), authorize("HR"), DeleteMentor);
router.get("/get-mentor/:id",        protect(["HR"]), authorize("HR"), GetMentorById);
router.put("/assign-mentor",         protect(["HR"]), authorize("HR"), AssignMentor);
router.put("/remove-mentor",         protect(["HR"]), authorize("HR"), RemoveMentorFromProgram);

// ─── HR accounts — only existing HR can create new HR ─────────────────────────
router.post("/add-hr",               protect(["HR"]), authorize("HR"), AddHR);

// ─── Certificate ──────────────────────────────────────────────────────────────
router.put("/certificate/:id",       protect(["HR"]), authorize("HR"), ApproveCertificate);

export default router;