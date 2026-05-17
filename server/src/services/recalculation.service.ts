import DocumentModel, { DocumentType } from '../models/document.model';
import MatchResultModel from '../models/matchResult.model';
import { runMatchingEngine } from './matching.service';

/**
 * Service to orchestrate the recalculation of matching state
 */
export const recalculateMatchState = async (poNumber: string) => {
  // 1. Fetch all documents for this poNumber
  const allDocs = await DocumentModel.find({ poNumber });

  // 2. Separate into types
  const poDocuments = allDocs
    .filter((doc) => doc.documentType === DocumentType.PO)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const po = poDocuments[0] || null;
  const grns = allDocs.filter((doc) => doc.documentType === DocumentType.GRN);
  const invoices = allDocs.filter((doc) => doc.documentType === DocumentType.INVOICE);

  // 3. Call Matching Engine
  const matchState = runMatchingEngine(poNumber, po, grns, invoices, {
    hasDuplicatePo: poDocuments.length > 1,
  });

  // 4. Upsert MatchResult
  const updatedMatchResult = await MatchResultModel.findOneAndUpdate(
    { poNumber },
    matchState,
    { upsert: true, returnDocument: 'after' },
  );

  return updatedMatchResult;
};
