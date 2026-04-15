import { describe, it, expect } from 'vitest';
import { categorizeTransactions } from './index';
import { Transaction } from '../parser/types';
import { v4 as uuidv4 } from 'uuid';

const createTx = (description: string): Transaction => ({
  id: uuidv4(),
  date: '2026-04-15',
  amount: -10,
  description,
  category: 'other',
  tags: [],
  source_file: 'test.csv'
});

describe('Categorizer Module', () => {
  it('should categorize exact matches correctly', async () => {
    const txs = [
      createTx('netflix.com'),
      createTx('apple.com/bill')
    ];
    
    const result = await categorizeTransactions(txs);
    expect(result[0].category).toBe('subscriptions');
    expect(result[1].category).toBe('subscriptions');
  });

  it('should categorize regex matches correctly', async () => {
    const txs = [
      createTx('POS DEBIT MCDONALD\'S #1234'),
      createTx('UBER EATS SAN FRANCISCO'),
      createTx('CHEVRON 000123'),
      createTx('ACH DEBIT ZELLE TRANSFER')
    ];

    const result = await categorizeTransactions(txs);
    expect(result[0].category).toBe('food');
    expect(result[1].category).toBe('food');
    expect(result[2].category).toBe('gas');
    expect(result[3].category).toBe('transfers');
  });

  it('should default to other for unknown descriptions', async () => {
    const txs = [createTx('SOME OBSCURE CHARGE 999')];
    const result = await categorizeTransactions(txs);
    expect(result[0].category).toBe('other');
  });
});
