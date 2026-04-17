import express from 'express';
import { protect, authorize } from '../middleware/AuthMiddleware.js';
import { CreateProgram, GetPrograms, GetInternProgram, UpdateProgram } from '../controllers/ProgramController.js';

const router = express.Router();

router.post('/',               protect(["HR"]),                          authorize("HR"),             CreateProgram);
router.get('/',                protect(["HR", "Mentor", "Intern"]),      authorize("HR", "Mentor", "Intern"), GetPrograms);
router.get('/program-intern',  protect(["Intern"]),                      authorize("Intern"),          GetInternProgram);
router.put('/:programId',      protect(["HR"]),                          authorize("HR"),              UpdateProgram);

export default router;
