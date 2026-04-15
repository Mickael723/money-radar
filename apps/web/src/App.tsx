import { Ledger } from './components/Ledger';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <h1 className="text-3xl font-bold mb-8">MoneyRadar</h1>
      <Ledger />
    </div>
  )
}

export default App
