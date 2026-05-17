class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: unknown;

  constructor(statusCode: number, message: string, isOperational = true, stack = '', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
