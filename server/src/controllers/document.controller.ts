import { Request, Response } from 'express';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { parseDocument } from '../services/gemini.service';
import { saveParsedDocument } from '../services/document.service';
import fs from 'fs';

/**
 * Controller to handle document processing with MongoDB persistence
 * Flow: upload PDFs -> extract text -> Gemini parse -> normalize -> MongoDB save -> return saved docs
 */
export const processDocuments = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Step 1: Validate all files exist
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
     * Helper to process a single file: Extract -> Gemini Parse -> Normalize & Save
     */
    const processFile = async (type: 'po' | 'grn' | 'invoice', file: Express.Multer.File) => {
      // 1. Extract text from PDF
      const rawText = await extractTextFromPdf(file.path);

      // 2. Parse using Gemini service
      const parsedData = await parseDocument(type, rawText);

      // 3. Normalize and Save to MongoDB
      const savedDocument = await saveParsedDocument({
        documentType: type,
        rawExtractedText: rawText,
        parsedData,
        file,
      });

      // Cleanup local temporary file is handled in the controller or service?
      // User requirement didn't specify cleanup but it's good practice.
      // However, the service needs the filePath for the DB record.
      // In a real prod app, we'd upload to S3 and keep that URL.
      // For now, we'll keep them or delete after save if preferred.
      // The prompt says "Save PO... return saved MongoDB documents".
      
      return savedDocument;
    };

    // Concurrent processing of the 3 documents
    await Promise.all([
      processFile('po', files.poFile[0]).then((doc) => (results.po = doc)),
      processFile('grn', files.grnFile[0]).then((doc) => (results.grn = doc)),
      processFile('invoice', files.invoiceFile[0]).then((doc) => (results.invoice = doc)),
    ]);

    // Return structured response with MongoDB documents
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
