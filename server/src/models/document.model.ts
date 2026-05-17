import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Enums for Document Type and Processing Status
 */
export enum DocumentType {
  PO = 'po',
  GRN = 'grn',
  INVOICE = 'invoice',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

/**
 * Interface for Items within a Document
 */
export interface IDocumentItem {
  itemCode: string;
  description: string;
  quantity: number;
}

/**
 * Interface for the Document Mongoose Document
 */
export interface IDocument extends Document {
  documentType: DocumentType;
  poNumber: string;
  documentNumber: string;
  documentDate?: Date;
  vendorName?: string;
  items: IDocumentItem[];
  rawExtractedText: string;
  parsedJson: Record<string, any>;
  originalFileName: string;
  filePath: string;
  processingStatus: ProcessingStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema definition for Document
 */
const documentSchema: Schema<IDocument> = new Schema(
  {
    documentType: {
      type: String,
      enum: Object.values(DocumentType),
      required: true,
      index: true,
    },
    poNumber: {
      type: String,
      required: true,
      index: true,
    },
    documentNumber: {
      type: String,
      required: true,
    },
    documentDate: {
      type: Date,
    },
    vendorName: {
      type: String,
    },
    items: [
      {
        itemCode: { type: String, required: true },
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    rawExtractedText: {
      type: String,
      required: true,
    },
    parsedJson: {
      type: Schema.Types.Mixed,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    processingStatus: {
      type: String,
      enum: Object.values(ProcessingStatus),
      default: ProcessingStatus.PENDING,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
// Single field indexes are already defined in the schema (documentType, poNumber)
// Compound index on poNumber + documentType
documentSchema.index({ poNumber: 1, documentType: 1 });

/**
 * Document Model
 */
const DocumentModel: Model<IDocument> = mongoose.model<IDocument>('Document', documentSchema);

export default DocumentModel;
