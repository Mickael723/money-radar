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

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: number;
  year: number;
}

interface TransactionState {
  transactions: Transaction[];
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (token: string) => Promise<void>;
  updateTransactionCategory: (id: string, category: string, token: string) => Promise<void>;
  fetchBudgets: (month: number, year: number, token: string) => Promise<void>;
  setBudgetLimit: (category: string, limit: number, month: number, year: number, token: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  budgets: [],
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
  },

  fetchBudgets: async (month: number, year: number, token: string) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/budgets?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ budgets: res.data.budgets.map((b: any) => ({ ...b, limit: parseFloat(b.limit) })) });
    } catch (error: any) {
      console.error('Failed to fetch budgets', error);
    }
  },

  setBudgetLimit: async (category: string, limit: number, month: number, year: number, token: string) => {
    try {
      const res = await axios.put(`http://localhost:3000/api/budgets/${category}`, 
        { limit, month, year }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedBudget = { ...res.data.budget, limit: parseFloat(res.data.budget.limit) };
      
      set(state => {
        const exists = state.budgets.find(b => b.category === category);
        if (exists) {
          return { budgets: state.budgets.map(b => b.category === category ? updatedBudget : b) };
        }
        return { budgets: [...state.budgets, updatedBudget] };
      });
    } catch (error: any) {
      console.error('Failed to set budget', error);
    }
  }
}));
