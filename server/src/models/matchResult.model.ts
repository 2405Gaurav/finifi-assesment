import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Enum for Overall Matching Status
 */
export enum MatchStatus {
  MATCHED = 'matched',
  PARTIALLY_MATCHED = 'partially_matched',
  MISMATCH = 'mismatch',
  INSUFFICIENT_DOCUMENTS = 'insufficient_documents',
}

/**
 * Interface for Linked Documents (Refs to Document collection)
 */
export interface ILinkedDocuments {
  po: Types.ObjectId;
  grns: Types.ObjectId[];
  invoices: Types.ObjectId[];
}

/**
 * Interface for Individual Item Matching Results
 */
export interface IItemResult {
  itemCode: string;
  description: string;
  poQuantity: number;
  totalGrnQuantity: number;
  totalInvoiceQuantity: number;
  status: string;
  reasons: string[];
}

/**
 * Interface for the MatchResult Mongoose Document
 */
export interface IMatchResult extends Document {
  poNumber: string;
  linkedDocuments: ILinkedDocuments;
  status: MatchStatus;
  mismatchReasons: string[];
  itemResults: IItemResult[];
  lastMatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema definition for MatchResult
 */
const matchResultSchema: Schema<IMatchResult> = new Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    linkedDocuments: {
      po: {
        type: Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
      },
      grns: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Document',
        },
      ],
      invoices: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Document',
        },
      ],
    },
    status: {
      type: String,
      enum: Object.values(MatchStatus),
      required: true,
      index: true,
    },
    mismatchReasons: [
      {
        type: String,
      },
    ],
    itemResults: [
      {
        itemCode: { type: String, required: true },
        description: { type: String, required: true },
        poQuantity: { type: Number, required: true },
        totalGrnQuantity: { type: Number, required: true },
        totalInvoiceQuantity: { type: Number, required: true },
        status: { type: String, required: true },
        reasons: [{ type: String }],
      },
    ],
    lastMatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * MatchResult Model
 */
const MatchResultModel: Model<IMatchResult> = mongoose.model<IMatchResult>(
  'MatchResult',
  matchResultSchema,
);

export default MatchResultModel;
