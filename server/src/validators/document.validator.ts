import { z } from 'zod';

/**
 * Common reusable validation schemas
 */
export const commonSchemas = {
  poNumber: z.string().trim().min(1, 'PO Number is required'),
  pagination: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
};

/**
 * Match API Validators
 */
export const matchValidators = {
  getMatch: z.object({
    params: z.object({
      poNumber: commonSchemas.poNumber,
    }),
  }),
};

/**
 * Document API Validators
 * Note: Multer handles file presence, but we can validate other body fields if any
 */
export const documentValidators = {
  processDocuments: z.object({
    body: z.object({}), // Currently only multipart files are expected
  }),
};
