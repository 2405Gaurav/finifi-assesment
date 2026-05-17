import express from 'express';
import { processDocuments, getDocumentById, uploadSingleDocument } from '../../controllers/document.controller';
import { documentUpload, upload } from '../../middlewares/upload.middleware';

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
 *     summary: Process PO, GRN, and Invoice PDFs concurrently
 *     description: Uploads three PDF files, extracts text, parses with Gemini 2.5 Flash, normalizes, and persists to MongoDB.
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
 *               grnFile:
 *                 type: string
 *                 format: binary
 *               invoiceFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request
 */
router.post('/process', documentUpload, processDocuments);

/**
 * @swagger
 * /documents/upload:
 *   post:
 *     summary: Upload a single document by type
 *     description: Uploads a single PDF file (po, grn, or invoice), parses it, and triggers match recalculation.
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - documentType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *                 enum: [po, grn, invoice]
 *     responses:
 *       201:
 *         description: Document uploaded and processed successfully
 *       400:
 *         description: Invalid input
 */
router.post('/upload', upload.single('file'), uploadSingleDocument);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get a parsed document by ID
 *     description: Returns the stored parsed document data for a specific document ID.
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The document ID
 *     responses:
 *       200:
 *         description: Document data
 *       404:
 *         description: Document not found
 */
router.get('/:id', getDocumentById);

export default router;
