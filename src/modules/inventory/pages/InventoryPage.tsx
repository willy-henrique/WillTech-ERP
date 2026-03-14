import { useState } from 'react';
import { 
  Database, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  AlertTriangle,
  History,
  Plus
} from 'lucide-react';
import { clsx } from 'clsx';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  balance: number;
  unit: string;
  minStock: number;
  lastMovement: string;
  status: 'ok' | 'warning' | 'critical';
}

const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Polipropileno Virgem (PP)', category: 'Resina', balance: 450, unit: 'kg', minStock: 1000, lastMovement: '2026-03-13', status: 'critical' },
  { id: '2', name: 'Polipropileno Reciclado', category: 'Resina', balance: 1200, unit: 'kg', minStock: 500, lastMovement: '2026-03-12', status: 'ok' },
  { id: '3', name: 'Tinta Branca Ráfia', category: 'Tintas', balance: 12, unit: 'un', minStock: 20, lastMovement: '2026-03-10', status: 'warning' },
  { id: '4', name: 'Linha de Costura 20/3', category: 'Insumos', balance: 5, unit: 'un', minStock: 15, lastMovement: '2026-03-11', status: 'critical' },
  { id: '5', name: 'Solvente Especial', category: 'Químicos', balance: 8, unit: 'L', minStock: 10, lastMovement: '2026-03-13', status: 'warning' },
];

export function InventoryPage() {
  const [items] = useState<InventoryItem[]>(MOCK_INVENTORY);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estoque de Materiais</h1>
          <p className="text-slate-500">Controle de insumos, resinas e materiais auxiliares.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <History className="w-4 h-4" />
            Movimentações
          </button>
          <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Entrada de Material
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Itens em Alerta</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-amber-600">3</p>
            <AlertTriangle className="w-8 h-8 text-amber-200" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Itens Críticos</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-red-600">2</p>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Valor em Estoque</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-slate-800">R$ 84.500</p>
            <Database className="w-8 h-8 text-slate-200" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar material..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500">
            <option value="">Todas as Categorias</option>
            <option value="Resina">Resinas</option>
            <option value="Tintas">Tintas</option>
            <option value="Insumos">Insumos</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Material</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold text-right">Saldo Atual</th>
                <th className="px-6 py-4 font-semibold text-right">Estoque Mínimo</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Última Mov.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-400">ID: {item.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className={clsx(
                      "text-sm font-black",
                      item.status === 'critical' ? "text-red-600" :
                      item.status === 'warning' ? "text-amber-600" :
                      "text-slate-800"
                    )}>
                      {item.balance} {item.unit}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {item.minStock} {item.unit}
                  </td>
                  <td className="px-6 py-4">
                    <div className={clsx(
                      "flex items-center gap-2 px-2 py-1 rounded-full w-fit",
                      item.status === 'critical' ? "bg-red-50 text-red-600" :
                      item.status === 'warning' ? "bg-amber-50 text-amber-600" :
                      "bg-emerald-50 text-emerald-600"
                    )}>
                      <div className={clsx("w-1.5 h-1.5 rounded-full", 
                        item.status === 'critical' ? "bg-red-600 animate-pulse" :
                        item.status === 'warning' ? "bg-amber-600" :
                        "bg-emerald-600"
                      )}></div>
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {item.status === 'critical' ? 'Crítico' : 
                         item.status === 'warning' ? 'Atenção' : 'Normal'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(item.lastMovement).toLocaleDateString('pt-BR')}
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
