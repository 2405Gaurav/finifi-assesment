import { Request, Response } from 'express';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { parseDocument } from '../services/gemini.service';
import { memoryStore } from '../services/memoryStore.service';
import fs from 'fs';

/**
 * Controller to handle document processing for Milestone 1
 * Flow: upload PDFs -> extract text -> send to Gemini -> parse JSON -> store in memory -> return response
 */
export const processDocuments = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Step 1: Validate all files exist as per requirements
    if (!files || !files.poFile?.[0] || !files.grnFile?.[0] || !files.invoiceFile?.[0]) {
      return res.status(400).json({
        success: false,
        error: 'Missing required files. Please provide poFile, grnFile, and invoiceFile.',
      });
    }

    const results: any = {
      po: null,
      grn: null,
      invoice: null,
    };

    /**
     * Helper to process a single file: Extract -> Parse -> Store -> Cleanup
     */
    const processFile = async (type: 'po' | 'grn' | 'invoice', file: Express.Multer.File) => {
      // Step 2: Extract text from PDF
      const rawText = await extractTextFromPdf(file.path);

      // Step 3: Parse using Gemini service
      const parsedData = await parseDocument(type, rawText);

      // Step 4: Store in memory
      memoryStore.addDocument({
        type,
        originalName: file.originalname,
        data: parsedData,
      });

      // Cleanup local temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return parsedData;
    };

    // Use Promise.all for concurrent processing of the 3 documents
    await Promise.all([
      processFile('po', files.poFile[0]).then((data) => (results.po = data)),
      processFile('grn', files.grnFile[0]).then((data) => (results.grn = data)),
      processFile('invoice', files.invoiceFile[0]).then((data) => (results.invoice = data)),
    ]);

    // Step 5: Return structured JSON response
    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Document processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during document processing',
    });
  }
};
