import { create } from 'zustand';
import axios from 'axios';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance?: number;
  category: string;
  tags: string[];
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (token: string) => Promise<void>;
  updateTransactionCategory: (id: string, category: string, token: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:3000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ transactions: response.data, isLoading: false });
    } catch (error: any) {
      // Don't crash default UI if endpoints aren't mounted/tested right away.  
      // Normally we just emit error string.
      set({ error: error.message, isLoading: false });
    }
  },

  updateTransactionCategory: async (id: string, category: string, token: string) => {
    // Optimistic update
    const previous = get().transactions;
    set({
      transactions: previous.map(t => t.id === id ? { ...t, category } : t)
    });

    try {
      await axios.patch(`http://localhost:3000/api/transactions/${id}`, 
        { category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error: any) {
      // Revert on failure
      set({ transactions: previous, error: error.message });
    }
  }
}));
