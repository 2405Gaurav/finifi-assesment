import { Request, Response, NextFunction } from 'express';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { parseDocument } from '../services/gemini.service';
import { saveParsedDocument } from '../services/document.service';
import { recalculateMatchState } from '../services/recalculation.service';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import fs from 'fs';
import DocumentModel from '../models/document.model';
import mongoose from 'mongoose';

/**
 * Controller to handle document processing with MongoDB persistence
 * Flow: upload PDFs -> extract text -> Gemini parse -> normalize -> MongoDB save -> return saved docs
 */
export const processDocuments = async (req: Request, res: Response, next: NextFunction) => {
  const persistedFilePaths = new Set<string>();

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

    const cleanupFile = (file: Express.Multer.File) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    };

    const processFile = async (type: 'po' | 'grn' | 'invoice', file: Express.Multer.File) => {
      try {
        const rawText = await extractTextFromPdf(file.path);
        if (!rawText.trim()) {
          throw new ApiError(httpStatus.BAD_REQUEST, `The uploaded ${type.toUpperCase()} PDF does not contain extractable text.`);
        }

        const parsedData = await parseDocument(type, rawText);

        const savedDocument = await saveParsedDocument({
          documentType: type,
          rawExtractedText: rawText,
          parsedData,
          file,
          triggerRecalculation: false,
        });

        persistedFilePaths.add(file.path);
        return savedDocument;
      } catch (error) {
        cleanupFile(file);
        throw error;
      }
    };

    const [poResult, grnResult, invoiceResult] = await Promise.allSettled([
      processFile('po', files.poFile[0]),
      processFile('grn', files.grnFile[0]),
      processFile('invoice', files.invoiceFile[0]),
    ]);

    if (poResult.status === 'fulfilled') results.po = poResult.value;
    if (grnResult.status === 'fulfilled') results.grn = grnResult.value;
    if (invoiceResult.status === 'fulfilled') results.invoice = invoiceResult.value;

    const successfulDocuments = [results.po, results.grn, results.invoice].filter(Boolean);
    const poNumbersToRecalculate = Array.from(
      new Set(successfulDocuments.map((document: any) => String(document.poNumber).trim()).filter(Boolean)),
    );

    await Promise.all(poNumbersToRecalculate.map((poNumber) => recalculateMatchState(poNumber)));

    const rejectedResult = [poResult, grnResult, invoiceResult].find((result) => result.status === 'rejected');
    if (rejectedResult?.status === 'rejected') {
      throw rejectedResult.reason;
    }

    // Return structured response with MongoDB documents
    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files) {
      Object.values(files).flat().forEach((file) => {
        if (!persistedFilePaths.has(file.path) && fs.existsSync(file.path)) {
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
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid document ID format');
    }
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
  const file = req.file;
  let shouldCleanupFile = true;

  try {
    const normalizedDocumentType = String(req.body.documentType || '').trim().toLowerCase();

    if (!file) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    }

    if (!['po', 'grn', 'invoice'].includes(normalizedDocumentType)) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid documentType. Must be po, grn, or invoice');
    }

    const rawText = await extractTextFromPdf(file.path);
    if (!rawText.trim()) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `The uploaded ${normalizedDocumentType.toUpperCase()} PDF does not contain extractable text.`,
      );
    }

    const parsedData = await parseDocument(normalizedDocumentType as any, rawText);

    const savedDocument = await saveParsedDocument({
      documentType: normalizedDocumentType as any,
      rawExtractedText: rawText,
      parsedData,
      file,
    });
    shouldCleanupFile = false;

    res.status(httpStatus.CREATED).json({
      success: true,
      data: savedDocument,
    });
  } catch (error) {
    next(error);
  } finally {
    if (shouldCleanupFile && file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};
