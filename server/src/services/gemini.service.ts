import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompts = {
    po: `Extract the following details from this Purchase Order text into a strict JSON format:
        - poNumber (string)
        - poDate (string)
        - vendorName (string)
        - items (array of { itemCode: string, description: string, quantity: number })
        
        Text: ${rawText}`,
    grn: `Extract the following details from this Goods Receipt Note (GRN) text into a strict JSON format:
        - grnNumber (string)
        - poNumber (string)
        - grnDate (string)
        - items (array of { itemCode: string, description: string, receivedQuantity: number })
        
        Text: ${rawText}`,
    invoice: `Extract the following details from this Invoice text into a strict JSON format:
        - invoiceNumber (string)
        - poNumber (string)
        - invoiceDate (string)
        - items (array of { itemCode: string, description: string, quantity: number })
        
        Text: ${rawText}`,
  };

  const basePrompt = `
    You are a professional document parser.
    Return ONLY valid JSON.
    Do NOT include markdown formatting like \`\`\`json.
    Do NOT include any explanations or extra text.
    If a field is not found, use null or an empty array for items.
    
    ${prompts[documentType]}
  `;

  try {
    const result = await model.generateContent(basePrompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean potential markdown blocks if AI ignored instructions
    const jsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');

    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      if (retries > 0) {
        console.warn(`Gemini JSON parse failed, retrying... (${retries} left)`);
        return parseDocument(documentType, rawText, retries - 1);
      }
      throw new Error(`Failed to parse Gemini response as JSON: ${jsonString}`);
    }
  } catch (error: any) {
    console.error(`Error calling Gemini API for ${documentType}:`, error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
};
