export type DocumentType = 'po' | 'grn' | 'invoice';

export interface DocumentItem {
  itemCode: string;
  description: string;
  quantity: number;
}

export interface DocumentData {
  _id: string;
  documentType: DocumentType;
  poNumber: string;
  documentNumber: string;
  documentDate: string;
  vendorName?: string;
  items: DocumentItem[];
  processingStatus: 'pending' | 'processed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export type MatchStatus = 'matched' | 'partially_matched' | 'mismatch' | 'insufficient_documents';

export type MismatchReason = 
  | 'grn_qty_exceeds_po_qty'
  | 'invoice_qty_exceeds_po_qty'
  | 'invoice_qty_exceeds_grn_qty'
  | 'invoice_date_after_po_date'
  | 'duplicate_po'
  | 'item_missing_in_po';

export interface ItemResult {
  itemCode: string;
  description: string;
  poQuantity: number;
  totalGrnQuantity: number;
  totalInvoiceQuantity: number;
  status: MatchStatus;
  reasons: MismatchReason[];
}

export interface MatchResult {
  poNumber: string;
  linkedDocuments: {
    po: DocumentData | null;
    grns: DocumentData[];
    invoices: DocumentData[];
  };
  status: MatchStatus;
  mismatchReasons: MismatchReason[];
  itemResults: ItemResult[];
  lastMatchedAt: string;
}

export interface ProcessDocumentsResponse {
  success: boolean;
  data: {
    po: DocumentData;
    grn: DocumentData;
    invoice: DocumentData;
  };
}

export interface MatchResultResponse {
  success: boolean;
  data: MatchResult;
}
