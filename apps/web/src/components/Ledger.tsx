import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { useTransactionStore, Transaction } from '../store/transactionStore';
import { Download } from 'lucide-react';
import Papa from 'papaparse';

const CATEGORIES = [
  'subscriptions', 'food', 'gas', 'utilities', 'shopping',
  'health', 'travel', 'entertainment', 'transfers', 'other'
];

export function Ledger() {
  const mockToken = "mock_token"; 
  const { transactions, fetchTransactions, updateTransactionCategory, isLoading } = useTransactionStore();
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    fetchTransactions(mockToken);
  }, [fetchTransactions]);

  const exportCSV = () => {
    const csv = Papa.unparse(transactions.map(t => ({
      Date: t.date,
      Description: t.description,
      Category: t.category,
      Amount: t.amount,
      Balance: t.balance || '',
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: info => <span className="text-slate-500 font-mono text-sm">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: info => <span className="font-semibold text-slate-700">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const tx = row.original;
        const getTagColor = (cat: string) => {
           if (cat === 'food') return 'bg-orange-100 text-orange-800';
           if (cat === 'subscriptions') return 'bg-purple-100 text-purple-800';
           return 'bg-slate-100 text-slate-800';
        };

        return (
          <select 
            value={tx.category}
            onChange={(e) => updateTransactionCategory(tx.id, e.target.value, mockToken)}
            className={`border border-slate-200 rounded-md px-2 py-1 text-xs font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-ring ${getTagColor(tx.category)}`}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        );
      }
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.original.amount;
        const isNegative = amount < 0;
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
        return (
          <span className={isNegative ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}>
            {isNegative ? '-' : '+'}{formatted}
          </span>
        );
      }
    },
  ];

  const table = useReactTable({
    data: transactions || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white border text-sm rounded-xl shadow-sm p-8 space-y-6">
      <div className="flex justify-between items-center">
        <input 
          type="text" 
          value={globalFilter ?? ''} 
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search transactions..."
          className="border border-slate-300 rounded-lg px-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 bg-slate-900 font-medium text-white px-5 py-2.5 rounded-lg shadow hover:bg-slate-800 transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 animate-pulse">Fetching transactions...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b bg-slate-50">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 text-slate-500 tracking-wider font-semibold uppercase text-xs">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="p-8 text-center text-slate-400">No transactions found</td></tr>
              ) : table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b hover:bg-slate-50 transition border-slate-100">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between items-center text-slate-500">
        <div>
          Showing {table.getRowModel().rows.length} records.
        </div>
        <div className="flex gap-2">
           <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-4 py-2 border rounded-md disabled:opacity-30 hover:bg-slate-100 transition">
             Previous
           </button>
           <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-4 py-2 border rounded-md disabled:opacity-30 hover:bg-slate-100 transition">
             Next
           </button>
        </div>
      </div>
    </div>
  );
}
