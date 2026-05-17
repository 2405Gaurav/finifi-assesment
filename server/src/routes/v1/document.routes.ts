import express from 'express';
import { processDocuments } from '../../controllers/document.controller';
import { documentUpload } from '../../middlewares/upload.middleware';


const router = express.Router();

router.post('/process', documentUpload, processDocuments);

export default router;
