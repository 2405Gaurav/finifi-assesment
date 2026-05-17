import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { getUploadSessionById, listUploadSessions } from '../services/uploadSession.service';

export const getUploadSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 5);
    const result = await listUploadSessions(page, limit);

    res.json({
      success: true,
      data: result.sessions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getUploadSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id || '');

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid session ID format');
    }

    const session = await getUploadSessionById(id);

    if (!session) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Upload session not found');
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};
