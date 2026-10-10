import express from 'express';
import multer from 'multer';
import { getDemoData, analyzeUpload } from '../controllers/briefController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/demo/:system', getDemoData);
router.post('/analyze', upload.fields([
  { name: 'metro', maxCount: 1 },
  { name: 'brts', maxCount: 1 },
  { name: 'amts', maxCount: 1 }
]), analyzeUpload);

export default router;
