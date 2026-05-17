import mongoose, { Schema, Document, Model } from 'mongoose';
import { MatchStatus, MismatchReason } from './matchResult.model';

interface IStoredItem {
  itemCode: string;
  description: string;
  quantity: number;
}

export interface IStoredDocumentSnapshot {
  documentType: 'po' | 'grn' | 'invoice';
  poNumber: string;
  documentNumber: string;
  documentDate?: Date;
  vendorName?: string;
  items: IStoredItem[];
}

export interface IStoredItemResult {
  itemCode: string;
  description: string;
  poQuantity: number;
  totalGrnQuantity: number;
  totalInvoiceQuantity: number;
  status: MatchStatus;
  reasons: MismatchReason[];
}

export interface IUploadSession extends Document {
  poNumber: string;
  title: string;
  documents: {
    po: IStoredDocumentSnapshot | null;
    grn: IStoredDocumentSnapshot | null;
    invoice: IStoredDocumentSnapshot | null;
  };
  matchResult: {
    status: MatchStatus;
    mismatchReasons: MismatchReason[];
    itemResults: IStoredItemResult[];
    lastMatchedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IStoredItem>(
  {
    itemCode: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const documentSnapshotSchema = new Schema<IStoredDocumentSnapshot>(
  {
    documentType: { type: String, enum: ['po', 'grn', 'invoice'], required: true },
    poNumber: { type: String, required: true },
    documentNumber: { type: String, required: true },
    documentDate: { type: Date },
    vendorName: { type: String },
    items: { type: [itemSchema], default: [] },
  },
  { _id: false },
);

const itemResultSchema = new Schema<IStoredItemResult>(
  {
    itemCode: { type: String, required: true },
    description: { type: String, required: true },
    poQuantity: { type: Number, required: true },
    totalGrnQuantity: { type: Number, required: true },
    totalInvoiceQuantity: { type: Number, required: true },
    status: { type: String, enum: Object.values(MatchStatus), required: true },
    reasons: [{ type: String, enum: Object.values(MismatchReason) }],
  },
  { _id: false },
);

const uploadSessionSchema = new Schema<IUploadSession>(
  {
    poNumber: { type: String, required: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    documents: {
      po: { type: documentSnapshotSchema, default: null },
      grn: { type: documentSnapshotSchema, default: null },
      invoice: { type: documentSnapshotSchema, default: null },
    },
    matchResult: {
      status: { type: String, enum: Object.values(MatchStatus), required: true },
      mismatchReasons: [{ type: String, enum: Object.values(MismatchReason) }],
      itemResults: { type: [itemResultSchema], default: [] },
      lastMatchedAt: { type: Date, required: true },
    },
  },
  {
    timestamps: true,
  },
);

uploadSessionSchema.index({ createdAt: -1 });

const UploadSessionModel: Model<IUploadSession> = mongoose.model<IUploadSession>(
  'UploadSession',
  uploadSessionSchema,
);

export default UploadSessionModel;
