import express from 'express';
import { protect, authorize } from '../middleware/AuthMiddleware.js';
import { CreateProgram, GetPrograms, GetInternProgram, UpdateProgram } from '../controllers/ProgramController.js';

const router = express.Router();

router.post('/', protect, authorize('HR'), CreateProgram);
router.get('/', protect, authorize(['HR', 'Mentor', 'Intern']), GetPrograms);
router.get('/program-intern', protect, authorize('Intern'), GetInternProgram);
router.put('/:programId', protect, authorize('HR'), UpdateProgram);

export default router;
