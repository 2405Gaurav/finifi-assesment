import fs from 'fs';
import { extractText } from 'unpdf';

/**
 * Utility to extract text from a PDF file using unpdf
 * @param filePath Path to the PDF file
 * @returns Normalized string of extracted text
 */
export const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    // Convert Buffer to Uint8Array for unpdf compatibility
    const uint8Array = new Uint8Array(dataBuffer);
    
    // unpdf provides a robust extraction strategy compatible with Node/TS
    const result = await extractText(uint8Array);

    // Join lines if text is returned as an array, then clean whitespace
    const text = Array.isArray(result.text) ? result.text.join(' ') : result.text;
    
    return text.replace(/\s+/g, ' ').trim();
  } catch (error: any) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};
