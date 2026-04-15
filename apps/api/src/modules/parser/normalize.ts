import { parse, isValid, format } from 'date-fns';

export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  const dateTrimmed = dateStr.trim();
  
  const formats = [
    'MM/dd/yyyy',
    'MM/dd/yy',
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'MM/dd',
    'MM-dd',
    'MM-dd-yyyy'
  ];

  for (const fmt of formats) {
    let dateToParse = dateTrimmed;
    let actualFmt = fmt;
    
    if ((fmt === 'MM/dd' || fmt === 'MM-dd') && dateTrimmed.length <= 5) {
      dateToParse = `${dateTrimmed.replace('-', '/')}/${new Date().getFullYear()}`;
      actualFmt = 'MM/dd/yyyy';
    }

    const parsed = parse(dateToParse, actualFmt, new Date());
    if (isValid(parsed) && parsed.getFullYear() > 2000) {
      return format(parsed, 'yyyy-MM-dd');
    }
  }

  const fallback = new Date(dateTrimmed);
  if (!isNaN(fallback.getTime())) {
    return format(fallback, 'yyyy-MM-dd');
  }

  return dateTrimmed;
}

export function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;
  
  // Keep the negative sign if present, either at the start or end (e.g. 50.00- or -50.00)
  const isNegative = amountStr.includes('-') || amountStr.includes('(');
  
  // Remove everything except digits and decimal point
  const cleanStr = amountStr.replace(/[^0-9.]/g, '');
  if (!cleanStr) return 0;

  let val = parseFloat(cleanStr);
  if (isNaN(val)) return 0;

  return isNegative ? -Math.abs(val) : Math.abs(val);
}
