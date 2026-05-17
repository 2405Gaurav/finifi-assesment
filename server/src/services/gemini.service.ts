import { GoogleGenerativeAI } from '@google/generative-ai';
import httpStatus from 'http-status';
import { config } from '../config/config';
import ApiError from '../utils/ApiError';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

const stringifyGeminiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return 'Unknown Gemini error';
  }
};

/**
 * Generic document parser using Gemini 2.5 Flash
 * @param documentType 'po' | 'grn' | 'invoice'
 * @param rawText Extracted text from PDF
 * @returns Parsed structured JSON
 */
export const parseDocument = async (
  documentType: 'po' | 'grn' | 'invoice',
  rawText: string,
  retries = 3,
): Promise<any> => {
  if (!config.gemini.apiKey) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      'AI is resting in a funny way right now. Gemini key is missing or not configured. It seems the brain is unplugged!',
      true,
      '',
      'Gemini API key is not configured in the environment variables.',
    );
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompts = {
    po: `Extract the following details from this Purchase Order text into a strict JSON format:
        - poNumber (string, MANDATORY. Look for "PO Number", "P.O. No", "Order #", "Purchase Order #", or similar identifiers)
        - poDate (string)
        - vendorName (string)
        - items (array of { itemCode: string, description: string, quantity: number })
        
        Text: ${rawText}`,
    grn: `Extract the following details from this Goods Receipt Note (GRN) text into a strict JSON format:
        - grnNumber (string)
        - poNumber (string, MANDATORY. Look for "PO Number", "P.O. No", "Order #", "Purchase Order #", or similar. It identifies the original PO this GRN belongs to)
        - grnDate (string)
        - items (array of { itemCode: string, description: string, receivedQuantity: number })
        
        Text: ${rawText}`,
    invoice: `Extract the following details from this Invoice text into a strict JSON format:
        - invoiceNumber (string)
        - poNumber (string, MANDATORY. Look for "PO Number", "P.O. No", "Reference", "Order #", "Purchase Order #", or "Ref:". It refers to the original PO being invoiced)
        - invoiceDate (string)
        - items (array of { itemCode: string, description: string, quantity: number })
        
        Text: ${rawText}`,
  };

  const basePrompt = `
    You are a high-precision procurement document parser.
    Your goal is to extract structured data with 100% accuracy.
    
    CRITICAL INSTRUCTIONS:
    1. Return ONLY valid JSON.
    2. Do NOT include markdown formatting like \`\`\`json.
    3. Do NOT include any explanations, preambles, or extra text.
    4. If a field is not found, use null or an empty array for items.
    5. Pay special attention to finding the PO Number in ALL documents as it is used for three-way matching.
    
    DOCUMENT-SPECIFIC REQUIREMENTS:
    ${prompts[documentType]}
  `;

  try {
    const aiPromise = model.generateContent(basePrompt);
    
    // Add a 60-second timeout for the AI call
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API call timed out for ${documentType}`)), 60000)
    );

    const result = (await Promise.race([aiPromise, timeoutPromise])) as any;
    const response = await result.response;
    const text = response.text().trim();

    // Clean potential markdown blocks if AI ignored instructions
    const jsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');

    try {
      return JSON.parse(jsonString);
    } catch {
      if (retries > 0) {
        console.warn(`Gemini JSON parse failed, retrying... (${retries} left)`);
        return parseDocument(documentType, rawText, retries - 1);
      }
      throw new Error(`Failed to parse Gemini response as JSON: ${jsonString}`);
    }
  } catch (error: any) {
    const detailedError = stringifyGeminiError(error);
    console.error(`Error calling Gemini API for ${documentType}:`, error);

    const friendlyMessage = detailedError.includes('429')
      ? 'AI is resting in a funny way right now. Gemini is feeling overwhelmed (Rate Limited) and needs a quick nap. Please try again in a few seconds.'
      : 'AI is resting in a funny way right now. Gemini is responding with an error. It might be having a mid-life crisis!';

    const statusCode = detailedError.includes('429')
      ? httpStatus.TOO_MANY_REQUESTS
      : httpStatus.BAD_GATEWAY;

    throw new ApiError(statusCode, friendlyMessage, true, '', detailedError);
  }
};
