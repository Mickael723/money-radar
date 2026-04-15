import { parse } from 'csv-parse/sync';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from './types';
import { normalizeDate, parseAmount } from './normalize';

export function parseCSV(fileBuffer: Buffer | string, filename: string): Transaction[] {
  const fileContent = Buffer.isBuffer(fileBuffer) ? fileBuffer.toString('utf-8') : fileBuffer;
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  const transactions: Transaction[] = [];

  for (const row of records) {
    const keys = Object.keys(row);
    
    // Find dynamic mapping
    const dateKey = keys.find(k => /date/i.test(k) || k === 'Post Date' || k === 'Transaction Date');
    const descKey = keys.find(k => /description|merchant|payee/i.test(k));
    const amountKey = keys.find(k => /amount/i.test(k));
    const debitKey = keys.find(k => /debit/i.test(k));
    const creditKey = keys.find(k => /credit/i.test(k));
    const typeKey = keys.find(k => /type/i.test(k));
    
    // Attempt BofA style "Running Bal."
    const balanceKey = keys.find(k => /balance|bal\.?/i.test(k));

    if (!dateKey || !descKey) continue;
    if (!row[dateKey]) continue; // skip blank dates
    
    const desc = row[descKey]?.trim() || '';
    if (!desc) continue;

    let amount = 0;
    if (amountKey && row[amountKey]) {
      amount = parseAmount(row[amountKey]);
      
      if (typeKey && row[typeKey]) {
        const typeStr = row[typeKey].toLowerCase();
        // Adjust signs based on "type" definitions in some CSV schemas
        if ((typeStr.includes('debit') || typeStr.includes('sale') || typeStr.includes('fee')) && amount > 0) {
            amount = -amount;
        }
      }
    } else if (debitKey && row[debitKey]) {
      amount = -Math.abs(parseAmount(row[debitKey])); 
    } else if (creditKey && row[creditKey]) {
      amount = Math.abs(parseAmount(row[creditKey])); 
    } else {
      continue; // Skip lines with absolutely no amount fields
    }

    let balance: number | undefined = undefined;
    if (balanceKey && row[balanceKey]) {
       balance = parseAmount(row[balanceKey]);
    }

    const t: Transaction = {
      id: uuidv4(),
      date: normalizeDate(row[dateKey]),
      description: desc,
      amount,
      balance,
      category: 'other',
      tags: [],
      source_file: filename,
    };

    transactions.push(t);
  }

  return transactions;
}
