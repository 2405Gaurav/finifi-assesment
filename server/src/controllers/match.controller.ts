import { Request, Response } from 'express';
import MatchResultModel from '../models/matchResult.model';

/**
 * Controller to handle fetching match results
 */
export const getMatchByPoNumber = async (req: Request, res: Response) => {
  try {
    const { poNumber } = req.params;

    // Manual validation removed as it's now handled by Zod middleware

    const matchResult = await MatchResultModel.findOne({ poNumber });

    if (!matchResult) {
      return res.status(404).json({
        success: false,
        error: `No match result found for PO Number: ${poNumber}`,
      });
    }

    res.json({
      success: true,
      data: matchResult,
    });
  } catch (error: any) {
    console.error('Error fetching match result:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching match result',
    });
  }
};
