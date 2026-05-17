import { IDocument } from '../models/document.model';
import { MatchStatus, MismatchReason, IItemResult, ILinkedDocuments } from '../models/matchResult.model';

/**
 * Interface for the Matching Engine output
 */
export interface IMatchingResult {
  poNumber: string;
  linkedDocuments: ILinkedDocuments;
  status: MatchStatus;
  mismatchReasons: MismatchReason[];
  itemResults: IItemResult[];
  lastMatchedAt: Date;
}

/**
 * Pure Business Logic: Three-Way Matching Engine
 */
export const runMatchingEngine = (
  poNumber: string,
  po: IDocument | null,
  grns: IDocument[],
  invoices: IDocument[],
): IMatchingResult => {
  const mismatchReasons: MismatchReason[] = [];
  const itemResultsMap: Map<string, IItemResult> = new Map();
  const linkedDocuments: ILinkedDocuments = {
    po: po ? (po._id as any) : null,
    grns: grns.map((g) => g._id as any),
    invoices: invoices.map((i) => i._id as any),
  };

  // Rule 4: Invoice date must not be after PO date
  if (po && invoices.length > 0) {
    const poDate = po.documentDate ? new Date(po.documentDate) : null;
    if (poDate) {
      invoices.forEach((inv) => {
        const invDate = inv.documentDate ? new Date(inv.documentDate) : null;
        if (invDate && invDate > poDate) {
          if (!mismatchReasons.includes(MismatchReason.INVOICE_DATE_AFTER_PO_DATE)) {
            mismatchReasons.push(MismatchReason.INVOICE_DATE_AFTER_PO_DATE);
          }
        }
      });
    }
  }

  // Aggregate Items by itemCode
  const processItems = (doc: IDocument, type: 'po' | 'grn' | 'invoice') => {
    doc.items.forEach((item) => {
      let result = itemResultsMap.get(item.itemCode);
      if (!result) {
        result = {
          itemCode: item.itemCode,
          description: item.description,
          poQuantity: 0,
          totalGrnQuantity: 0,
          totalInvoiceQuantity: 0,
          status: MatchStatus.INSUFFICIENT_DOCUMENTS,
          reasons: [],
        };
        itemResultsMap.set(item.itemCode, result);
      }

      if (type === 'po') result.poQuantity += item.quantity;
      if (type === 'grn') result.totalGrnQuantity += item.quantity;
      if (type === 'invoice') result.totalInvoiceQuantity += item.quantity;
    });
  };

  if (po) processItems(po, 'po');
  grns.forEach((g) => processItems(g, 'grn'));
  invoices.forEach((i) => processItems(i, 'invoice'));

  // Validate Each Item
  const itemResults: IItemResult[] = Array.from(itemResultsMap.values());
  itemResults.forEach((item) => {
    const itemReasons: MismatchReason[] = [];

    // Rule 1: GRN quantity <= PO quantity
    if (po && item.totalGrnQuantity > item.poQuantity) {
      itemReasons.push(MismatchReason.GRN_QTY_EXCEEDS_PO_QTY);
    }

    // Rule 2: Invoice quantity <= total GRN quantity
    if (grns.length > 0 && item.totalInvoiceQuantity > item.totalGrnQuantity) {
      itemReasons.push(MismatchReason.INVOICE_QTY_EXCEEDS_GRN_QTY);
    }


    // Rule 3: Invoice quantity <= PO quantity
    if (po && item.totalInvoiceQuantity > item.poQuantity) {
      itemReasons.push(MismatchReason.INVOICE_QTY_EXCEEDS_PO_QTY);
    }

    // Item missing in PO check
    if (po && item.poQuantity === 0 && (item.totalGrnQuantity > 0 || item.totalInvoiceQuantity > 0)) {
      itemReasons.push(MismatchReason.ITEM_MISSING_IN_PO);
    }

    // Determine Item Status
    if (itemReasons.length > 0) {
      item.status = MatchStatus.MISMATCH;
      item.reasons = itemReasons;
      itemReasons.forEach((r) => {
        if (!mismatchReasons.includes(r)) mismatchReasons.push(r);
      });
    } else if (!po || grns.length === 0 || invoices.length === 0) {
      item.status = MatchStatus.PARTIALLY_MATCHED;
    } else {
      item.status = MatchStatus.MATCHED;
    }
  });

  // Determine Overall Status
  let overallStatus = MatchStatus.MATCHED;

  if (mismatchReasons.length > 0) {
    overallStatus = MatchStatus.MISMATCH;
  } else if (!po) {
    overallStatus = MatchStatus.INSUFFICIENT_DOCUMENTS;
  } else if (grns.length === 0 || invoices.length === 0) {
    overallStatus = MatchStatus.PARTIALLY_MATCHED;
  } else {
    // Check if all items are matched
    const allItemsMatched = itemResults.every((item) => item.status === MatchStatus.MATCHED);
    if (!allItemsMatched) {
      overallStatus = MatchStatus.PARTIALLY_MATCHED;
    }
  }

  return {
    poNumber,
    linkedDocuments,
    status: overallStatus,
    mismatchReasons,
    itemResults,
    lastMatchedAt: new Date(),
  };
};
