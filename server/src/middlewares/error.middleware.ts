import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { config } from '../config/config';
import ApiError from '../utils/ApiError';
import multer from 'multer';

export const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      error = new ApiError(httpStatus.BAD_REQUEST, 'File too large. Maximum allowed size is 10MB.');
    } else {
      error = new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  } else if (error?.name === 'CastError') {
    error = new ApiError(httpStatus.BAD_REQUEST, 'Invalid resource identifier.');
  }

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || (httpStatus as any)[statusCode] || httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

export const errorHandler = (err: ApiError, req: Request, res: Response, _next: NextFunction) => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR] as string;
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).send(response);
};
