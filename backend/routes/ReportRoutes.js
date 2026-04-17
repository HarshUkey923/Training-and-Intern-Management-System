import express from "express";
import { protect, authorize } from "../middleware/AuthMiddleware.js";
import {
  GetOverview,
  GetInternReports,
  GetProgramReports,
  IssueCertificate,
  GetCertificates,
} from "../controllers/ReportController.js";

const router = express.Router();

router.get("/overview",    protect(["HR"]), authorize("HR"), GetOverview);
router.get("/interns",     protect(["HR"]), authorize("HR"), GetInternReports);
router.get("/programs",    protect(["HR"]), authorize("HR"), GetProgramReports);
router.post("/certificate",  protect(["HR"]), authorize("HR"), IssueCertificate);
router.get("/certificates",  protect(["HR"]), authorize("HR"), GetCertificates);

export default router;
