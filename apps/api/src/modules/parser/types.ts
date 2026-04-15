export type Transaction = {
  id: string; // uuid v4
  date: string; // ISO 8601
  description: string; // raw merchant string
  amount: number; // negative = debit
  balance?: number; // running balance if present
  category: string; // assigned category slug
  tags: string[]; // user-defined tags
  source_file: string; // original filename
};

export type ParseResult = {
  transactions: Transaction[];
  metadata: {
    filename: string;
    bank_hint?: string;
    date_range?: string;
    row_count: number;
    error?: string;
  };
};
