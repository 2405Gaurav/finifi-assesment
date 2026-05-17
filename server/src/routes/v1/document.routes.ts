import express from 'express';
import { processDocuments } from '../../controllers/document.controller';
import { documentUpload } from '../../middlewares/upload.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document processing and management
 */

/**
 * @swagger
 * /documents/process:
 *   post:
 *     summary: Process PO, GRN, and Invoice PDFs
 *     description: Uploads three PDF files, extracts text using pdf-parse, parses data with Gemini 1.5 Flash, normalizes the data, and persists it to MongoDB.
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               poFile:
 *                 type: string
 *                 format: binary
 *                 description: Purchase Order PDF file
 *               grnFile:
 *                 type: string
 *                 format: binary
 *                 description: Goods Receipt Note PDF file
 *               invoiceFile:
 *                 type: string
 *                 format: binary
 *                 description: Invoice PDF file
 *     responses:
 *       200:
 *         description: Successfully processed and saved documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     po: { $ref: '#/components/schemas/Document' }
 *                     grn: { $ref: '#/components/schemas/Document' }
 *                     invoice: { $ref: '#/components/schemas/Document' }
 *       400:
 *         description: Missing required files or invalid input
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Internal server error during processing
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/process', documentUpload, processDocuments);

export default router;
