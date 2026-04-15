import { ParseResult } from './types';
import { parseCSV } from './csv';
import { parsePDF } from './pdf';

export async function parseStatement(file: { originalname: string, mimetype: string, buffer: Buffer }): Promise<ParseResult> {
  const filename = file.originalname;
  const mimeType = file.mimetype;
  const ext = filename.split('.').pop()?.toLowerCase();
  
  let txs = [];
  
  if (mimeType === 'text/csv' || ext === 'csv' || mimeType === 'application/vnd.ms-excel') {
    txs = parseCSV(file.buffer, filename);
  } else if (mimeType === 'application/pdf' || ext === 'pdf') {
    txs = await parsePDF(file.buffer, filename);
  } else {
    throw new Error('Unsupported format. Only PDF and CSV are supported.');
  }
  
  if (txs.length === 0) {
    throw new Error('Parse error: zero rows extracted');
  }
  
  txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const date_range = txs.length > 0 
    ? `${txs[txs.length - 1].date} to ${txs[0].date}`
    : undefined;
    
  return {
    transactions: txs,
    metadata: {
      filename,
      date_range,
      row_count: txs.length,
    }
  };
}
