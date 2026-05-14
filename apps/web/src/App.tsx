import { useState } from 'react';
import { Ledger } from './components/Ledger';
import { Dashboard } from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger'>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-200 pb-4 gap-4">
          <h1 className="text-3xl font-bold text-emerald-900 tracking-tight">MoneyRadar</h1>
          
          <div className="flex bg-emerald-100/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-200/50 hover:text-emerald-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'ledger'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-200/50 hover:text-emerald-900'
              }`}
            >
              Ledger
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="mt-6">
          {activeTab === 'dashboard' ? <Dashboard /> : <Ledger />}
        </div>
      </div>
    </div>
  )
}

export default App;
