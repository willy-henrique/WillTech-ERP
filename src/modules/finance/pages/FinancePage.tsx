import { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  Search, 
  Filter,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { clsx } from 'clsx';

interface Transaction {
  id: string;
  description: string;
  customer: string;
  amount: number;
  dueDate: string;
  type: 'income' | 'expense';
  status: 'paid' | 'pending' | 'overdue';
}

export function FinancePage() {
  const [transactions] = useState<Transaction[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500">Fluxo de caixa, contas a pagar e receber.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <FileText className="w-4 h-4" />
            Relatórios Financeiros
          </button>
          <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <DollarSign className="w-4 h-4" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Saldo em Caixa</p>
            <DollarSign className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-3xl font-black text-slate-800">—</p>
          <p className="mt-4 text-xs text-slate-400">Integre contas a pagar/receber para exibir o saldo.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">A Receber (30 dias)</p>
            <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-600">—</p>
          <p className="mt-4 text-xs text-slate-400">Nenhum título a receber cadastrado.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">A Pagar (30 dias)</p>
            <ArrowDownCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-black text-red-600">—</p>
          <p className="mt-4 text-xs text-slate-400">Nenhum título a pagar cadastrado.</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar lançamento..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Março / 2026
            </button>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Descrição / Cliente</th>
                <th className="px-6 py-4 font-semibold">Vencimento</th>
                <th className="px-6 py-4 font-semibold">Valor</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    Nenhum lançamento financeiro. Cadastre contas a pagar e receber para exibir aqui.
                  </td>
                </tr>
              ) : transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{t.description}</p>
                    <p className="text-xs text-slate-500">{t.customer}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className={clsx(
                    "px-6 py-4 text-sm font-black",
                    t.type === 'income' ? "text-emerald-600" : "text-red-600"
                  )}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "text-[10px] font-black uppercase tracking-widest",
                      t.type === 'income' ? "text-emerald-500" : "text-red-500"
                    )}>
                      {t.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                      t.status === 'paid' ? "bg-emerald-50 text-emerald-600" :
                      t.status === 'pending' ? "bg-amber-50 text-amber-600" :
                      "bg-red-50 text-red-600"
                    )}>
                      {t.status === 'paid' ? 'Pago' : 
                       t.status === 'pending' ? 'Pendente' : 'Atrasado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
