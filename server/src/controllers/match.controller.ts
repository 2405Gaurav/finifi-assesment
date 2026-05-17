import { Request, Response, NextFunction } from 'express';
import MatchResultModel from '../models/matchResult.model';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

/**
 * Controller to handle fetching match results
 */
export const getMatchByPoNumber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const poNumber = String(req.params.poNumber || '').trim();
    if (!poNumber) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'PO number is required');
    }

    const documentSelection =
      'documentType poNumber documentNumber documentDate vendorName items processingStatus createdAt updatedAt';
    const matchResult = await MatchResultModel.findOne({ poNumber })
      .populate({ path: 'linkedDocuments.po', select: documentSelection })
      .populate({ path: 'linkedDocuments.grns', select: documentSelection })
      .populate({ path: 'linkedDocuments.invoices', select: documentSelection });

    if (!matchResult) {
      throw new ApiError(httpStatus.NOT_FOUND, `No match result found for PO Number: ${poNumber}`);
    }

    res.json({
      success: true,
      data: matchResult,
    });
  } catch (error) {
    next(error);
  }
};
