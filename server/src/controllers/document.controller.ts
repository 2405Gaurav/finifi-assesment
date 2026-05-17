import { Request, Response } from 'express';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { parseDocument } from '../services/gemini.service';
import { memoryStore } from '../services/memoryStore.service';
import fs from 'fs';

/**
 * Controller to handle document processing
 */
export const processDocuments = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || (!files.poFile && !files.grnFile && !files.invoiceFile)) {
      return res.status(400).json({ error: 'At least one file (poFile, grnFile, or invoiceFile) is required.' });
    }

    const results: any = {};

    // Helper to process a single file
    const processFile = async (type: 'po' | 'grn' | 'invoice', file: Express.Multer.File) => {
      const rawText = await extractTextFromPdf(file.path);
      const parsedData = await parseDocument(type, rawText);
      
      // Keep in memory
      memoryStore.set(`${type}_${Date.now()}`, {
        originalName: file.originalname,
        parsedData,
      });

      // Cleanup local file after processing
      fs.unlinkSync(file.path);

      return parsedData;
    };

    // Process files in parallel if they exist
    const processingPromises = [];

    if (files.poFile?.[0]) {
      processingPromises.push(
        processFile('po', files.poFile[0]).then(data => results.po = data)
      );
    }

    if (files.grnFile?.[0]) {
      processingPromises.push(
        processFile('grn', files.grnFile[0]).then(data => results.grn = data)
      );
    }

    if (files.invoiceFile?.[0]) {
      processingPromises.push(
        processFile('invoice', files.invoiceFile[0]).then(data => results.invoice = data)
      );
    }

    await Promise.all(processingPromises);

    res.json({
      success: true,
      data: results
    });

  } catch (error: any) {
    console.error('Document processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during document processing'
    });
  }
};
