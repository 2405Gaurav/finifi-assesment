import { Request, Response, NextFunction } from 'express';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { parseDocument } from '../services/gemini.service';
import { saveParsedDocument } from '../services/document.service';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import fs from 'fs';
import DocumentModel from '../models/document.model';

/**
 * Controller to handle document processing with MongoDB persistence
 * Flow: upload PDFs -> extract text -> Gemini parse -> normalize -> MongoDB save -> return saved docs
 */
export const processDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Step 1: Validate all files exist
    if (!files || !files.poFile?.[0] || !files.grnFile?.[0] || !files.invoiceFile?.[0]) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required files. Please provide poFile, grnFile, and invoiceFile.');
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

      // Cleanup local temporary file after successful save
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
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
  } catch (error) {
    // Cleanup any files that were uploaded but not processed due to error
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files) {
      Object.values(files).flat().forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};

/**
 * Get a parsed document by ID
 */
export const getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const document = await DocumentModel.findById(id);

    if (!document) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload a single document by type
 */
export const uploadSingleDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    }

    if (!['po', 'grn', 'invoice'].includes(documentType)) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid documentType. Must be po, grn, or invoice');
    }

    // 1. Extract text from PDF
    const rawText = await extractTextFromPdf(file.path);

    // 2. Parse using Gemini service
    const parsedData = await parseDocument(documentType as any, rawText);

    // 3. Normalize and Save to MongoDB
    const savedDocument = await saveParsedDocument({
      documentType: documentType as any,
      rawExtractedText: rawText,
      parsedData,
      file,
    });

    // 4. Cleanup local temporary file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      data: savedDocument,
    });
  } catch (error) {
    // Cleanup if file exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
