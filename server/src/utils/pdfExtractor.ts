import fs from 'fs';
const pdf = require('pdf-parse');


/**
 * Utility to extract text from a PDF file
 * @param filePath Path to the PDF file
 * @returns Normalized string of extracted text
 */
export const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    // Clean excessive whitespace and normalize
    return data.text.replace(/\s+/g, ' ').trim();
  } catch (error: any) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};
