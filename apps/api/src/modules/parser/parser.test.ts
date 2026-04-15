import { describe, it, expect } from 'vitest';
import { parseCSV } from './csv';
import { extractTransactionsFromText } from './pdf';
import { normalizeDate, parseAmount } from './normalize';

describe('Normalize Module', () => {
  it('should normalize different date formats to YYYY-MM-DD', () => {
    expect(normalizeDate('12/25/2026')).toBe('2026-12-25');
    // For MM/dd, it appends the current year
    const currentYear = new Date().getFullYear();
    expect(normalizeDate('12/25')).toBe(`${currentYear}-12-25`);
  });

  it('should parse amounts correctly with or without dollar signs and commas', () => {
    expect(parseAmount('$1,234.56')).toBe(1234.56);
    expect(parseAmount('-$50.00')).toBe(-50);
    expect(parseAmount('45.22-')).toBe(-45.22);
    expect(parseAmount('(100.00)')).toBe(-100);
    expect(parseAmount('50')).toBe(50);
  });
});

describe('CSV Parser', () => {
  it('should parse Chase-style CSVs correctly', () => {
    const csvContent = `Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
DEBIT,03/15/2026,AMAZON.COM,-45.00,Sale,,
CREDIT,03/16/2026,PAYROLL,1500.00,ACH,,
`;
    const result = parseCSV(csvContent, 'chase.csv');
    expect(result).toHaveLength(2);
    expect(result[0].amount).toBe(-45.00);
    expect(result[0].date).toBe('2026-03-15');
    expect(result[1].amount).toBe(1500.00);
  });

  it('should parse BofA-style CSVs correctly', () => {
    const csvContent = `Date,Description,Amount,Running Bal.
03/15/2026,Target Store,-100.50,1400.00
03/16/2026,Deposit,500.00,1900.00
`;
    const result = parseCSV(csvContent, 'bofa.csv');
    expect(result).toHaveLength(2);
    expect(result[0].amount).toBe(-100.50);
    expect(result[0].balance).toBe(1400.00);
    expect(result[1].amount).toBe(500.00);
  });
});

describe('PDF Parser', () => {
  it('should extract transactions correctly from multi-line text', () => {
    const text = `
    Some header info
    Statement Period: March 2026
    Date Description Amount Balance
    03/15 AMAZON INC -45.00 1200.00
    03/18 TARGET $50.00 1250.00
    03/20 SOME RANDOM TEXT UNMATCHED
    03/22 PAYROLL DEPOSIT 1,500.00 2,750.00
    `;
    const transactions = extractTransactionsFromText(text, 'statement.pdf');
    expect(transactions).toHaveLength(3);
    
    expect(transactions[0].date).toMatch(/^20\d\d-03-15$/);
    expect(transactions[0].description).toBe('AMAZON INC');
    expect(transactions[0].amount).toBe(-45);
    expect(transactions[0].balance).toBe(1200);

    expect(transactions[1].description).toBe('TARGET');
    expect(transactions[1].amount).toBe(50);

    expect(transactions[2].description).toBe('PAYROLL DEPOSIT');
    expect(transactions[2].amount).toBe(1500);
    expect(transactions[2].balance).toBe(2750);
  });
});
