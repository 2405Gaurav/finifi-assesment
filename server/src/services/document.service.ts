import DocumentModel, { DocumentType, ProcessingStatus, IDocument } from '../models/document.model';
import { recalculateMatchState } from './recalculation.service';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

/**
 * Interface for the input to saveParsedDocument
 */
interface SaveParsedDocumentInput {
  documentType: 'po' | 'grn' | 'invoice';
  rawExtractedText: string;
  parsedData: any;
  file: Express.Multer.File;
}

interface NormalizedItem {
  itemCode: string;
  description: string;
  quantity: number;
}

/**
 * Safely parse a date string, returning undefined if invalid
 */
const parseSafeDate = (dateStr: any): Date | undefined => {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
};

const parseQuantity = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeItems = (
  items: unknown,
  quantityKey: 'quantity' | 'receivedQuantity',
): NormalizedItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item: any) => {
      const itemCode = String(item?.itemCode ?? item?.sku ?? '').trim();
      const description = String(item?.description ?? itemCode).trim();
      const quantity = parseQuantity(item?.[quantityKey] ?? item?.quantity ?? item?.receivedQuantity);

      if (!itemCode || !description || quantity === null) {
        return null;
      }

      return {
        itemCode,
        description,
        quantity,
      };
    })
    .filter((item): item is NormalizedItem => item !== null);
};

/**
 * Service to handle document persistence and normalization
 */
export const saveParsedDocument = async (input: SaveParsedDocumentInput): Promise<IDocument> => {
  const { documentType, rawExtractedText, parsedData, file } = input;

  // 1. Normalize based on document type
  let poNumber = '';
  let documentNumber = '';
  let documentDate: Date | undefined;
  let items: any[] = [];

  switch (documentType) {
    case 'po':
      poNumber = String(parsedData.poNumber || '').trim();
      documentNumber = String(parsedData.poNumber || '').trim();
      documentDate = parseSafeDate(parsedData.poDate);
      items = normalizeItems(parsedData.items, 'quantity');
      break;

    case 'grn':
      poNumber = String(parsedData.poNumber || '').trim();
      documentNumber = String(parsedData.grnNumber || '').trim();
      documentDate = parseSafeDate(parsedData.grnDate);
      items = normalizeItems(parsedData.items, 'receivedQuantity');
      break;

    case 'invoice':
      poNumber = String(parsedData.poNumber || '').trim();
      documentNumber = String(parsedData.invoiceNumber || '').trim();
      documentDate = parseSafeDate(parsedData.invoiceDate);
      items = normalizeItems(parsedData.items, 'quantity');
      break;
  }

  // 2. Validation
  if (!poNumber) {
    console.error(`[Parsing Error] ${documentType} is missing poNumber. Parsed Data:`, JSON.stringify(parsedData, null, 2));
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid ${documentType}: poNumber is missing in parsed data.`);
  }
  if (!documentNumber) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid ${documentType}: document number is missing in parsed data.`);
  }
  if (!items || items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid ${documentType}: items array is missing, empty, or invalid.`);
  }

  // 3. Create MongoDB document
  const document = await DocumentModel.create({
    documentType: documentType as DocumentType,
    poNumber,
    documentNumber,
    documentDate,
    vendorName: parsedData.vendorName,
    items,
    rawExtractedText,
    parsedJson: parsedData,
    originalFileName: file.originalname,
    filePath: file.path,
    processingStatus: ProcessingStatus.PROCESSED,
  });

  // 4. Trigger recalculation
  await recalculateMatchState(poNumber);

  return document;
};
