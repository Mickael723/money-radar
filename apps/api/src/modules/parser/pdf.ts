import { v4 as uuidv4 } from 'uuid';
import { Transaction } from './types';
import { normalizeDate, parseAmount } from './normalize';

/**
 * Extracts transactions using regex matching strings shaped like:
 * [Date (MM/DD)] [Description] [Amount] [Balance]
 */
export function extractTransactionsFromText(text: string, filename: string): Transaction[] {
  const lines = text.split('\n');
  const transactions: Transaction[] = [];
  
  // Format matching pattern:
  // Date: MM/DD
  // Description: Anything non-numeric as capturing group, or allowing spaces
  // Amount: number with optional commas, negative sign
  // Balance: number with optional commas, negative sign
  
  // matches formats like: "12/25 AMAZON INC $45.00 -120.00"
  // ^(\d{1,2}\/\d{1,2})\s+(.+?)\s+(-?\$?[0-9,]+\.\d{2})\s+(-?\$?[0-9,]+\.\d{2})$
  const regex = /^(\d{1,2}\/\d{1,2})\s+(.+?)\s+(-?\$?[0-9,]+\.\d{2})\s+(-?\$?[0-9,]+\.\d{2})$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const match = trimmed.match(regex);
    if (!match) continue;

    const [_, rawDate, rawDescription, rawAmount, rawBalance] = match;
    
    transactions.push({
      id: uuidv4(),
      date: normalizeDate(rawDate),
      description: rawDescription.trim(),
      amount: parseAmount(rawAmount),
      balance: parseAmount(rawBalance),
      category: 'other',
      tags: [],
      source_file: filename,
    });
  }

  return transactions;
}

export async function parsePDF(fileBuffer: Buffer | Uint8Array, filename: string): Promise<Transaction[]> {
  // Load pdfjsLib dynamically since the build configurations
  // depending on standard import vs module can cause pathing issues in tests.
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

  const data = new Uint8Array(fileBuffer);
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Reconstruct lines roughly based on y coordinates or just join strings realistically
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n';
  }

  return extractTransactionsFromText(fullText, filename);
}
