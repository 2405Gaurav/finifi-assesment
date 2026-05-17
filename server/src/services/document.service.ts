import DocumentModel, { DocumentType, ProcessingStatus, IDocument } from '../models/document.model';
import { recalculateMatchState } from './recalculation.service';

/**
 * Interface for the input to saveParsedDocument
 */
interface SaveParsedDocumentInput {
  documentType: 'po' | 'grn' | 'invoice';
  rawExtractedText: string;
  parsedData: any;
  file: Express.Multer.File;
}

/**
 * Safely parse a date string, returning undefined if invalid
 */
const parseSafeDate = (dateStr: any): Date | undefined => {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
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
      poNumber = parsedData.poNumber;
      documentNumber = parsedData.poNumber;
      documentDate = parseSafeDate(parsedData.poDate);
      items = (parsedData.items || []).map((item: any) => ({
        itemCode: item.itemCode,
        description: item.description,
        quantity: item.quantity,
      }));
      break;

    case 'grn':
      poNumber = parsedData.poNumber;
      documentNumber = parsedData.grnNumber;
      documentDate = parseSafeDate(parsedData.grnDate);
      // Normalize GRN receivedQuantity -> quantity
      items = (parsedData.items || []).map((item: any) => ({
        itemCode: item.itemCode,
        description: item.description,
        quantity: item.receivedQuantity || item.quantity,
      }));
      break;

    case 'invoice':
      poNumber = parsedData.poNumber;
      documentNumber = parsedData.invoiceNumber;
      documentDate = parseSafeDate(parsedData.invoiceDate);
      items = (parsedData.items || []).map((item: any) => ({
        itemCode: item.itemCode,
        description: item.description,
        quantity: item.quantity,
      }));
      break;
  }

  // 2. Validation
  if (!poNumber) {
    console.error(`[Parsing Error] ${documentType} is missing poNumber. Parsed Data:`, JSON.stringify(parsedData, null, 2));
    throw new Error(`Invalid ${documentType}: poNumber is missing in parsed data.`);
  }
  if (!items || items.length === 0) {
    throw new Error(`Invalid ${documentType}: items array is missing or empty.`);
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
