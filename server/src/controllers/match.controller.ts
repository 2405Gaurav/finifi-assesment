import { Request, Response, NextFunction } from 'express';
import MatchResultModel from '../models/matchResult.model';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

/**
 * Controller to handle fetching match results
 */
export const getMatchByPoNumber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { poNumber } = req.params;

    const matchResult = await MatchResultModel.findOne({ poNumber });

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
