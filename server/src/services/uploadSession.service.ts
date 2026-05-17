import { IDocument } from '../models/document.model';
import { IMatchResult } from '../models/matchResult.model';
import UploadSessionModel from '../models/uploadSession.model';

const toDocumentSnapshot = (document: IDocument | null) => {
  if (!document) {
    return null;
  }

  return {
    documentType: document.documentType,
    poNumber: document.poNumber,
    documentNumber: document.documentNumber,
    documentDate: document.documentDate,
    vendorName: document.vendorName,
    items: document.items.map((item) => ({
      itemCode: item.itemCode,
      description: item.description,
      quantity: item.quantity,
    })),
  };
};

export const createUploadSessionSnapshot = async (input: {
  po: IDocument | null;
  grn: IDocument | null;
  invoice: IDocument | null;
  matchResult: IMatchResult;
}) => {
  const { po, grn, invoice, matchResult } = input;
  const poNumber = po?.poNumber || grn?.poNumber || invoice?.poNumber || matchResult.poNumber;

  return UploadSessionModel.create({
    poNumber,
    title: `${poNumber} - ${new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    documents: {
      po: toDocumentSnapshot(po),
      grn: toDocumentSnapshot(grn),
      invoice: toDocumentSnapshot(invoice),
    },
    matchResult: {
      status: matchResult.status,
      mismatchReasons: matchResult.mismatchReasons,
      itemResults: matchResult.itemResults,
      lastMatchedAt: matchResult.lastMatchedAt,
    },
  });
};

export const listUploadSessions = async (page: number, limit: number) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 20);
  const skip = (safePage - 1) * safeLimit;

  const [sessions, total] = await Promise.all([
    UploadSessionModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    UploadSessionModel.countDocuments(),
  ]);

  return {
    sessions,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

export const getUploadSessionById = async (id: string) => UploadSessionModel.findById(id).lean();
