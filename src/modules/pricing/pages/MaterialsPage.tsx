import { useState } from 'react';
import { 
  Layers, 
  DollarSign, 
  Edit2, 
  Search, 
  History,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';

interface Material {
  id: string;
  name: string;
  costPerKg: number;
  unit: string;
  lastUpdate: string;
  category: 'Resina' | 'Insumo' | 'Químico';
  trend: 'up' | 'down' | 'stable';
}

const MOCK_MATERIALS: Material[] = [
  { id: '1', name: 'Polipropileno Virgem', costPerKg: 12.50, unit: 'kg', lastUpdate: '2026-03-10', category: 'Resina', trend: 'up' },
  { id: '2', name: 'Polipropileno Reciclado', costPerKg: 8.20, unit: 'kg', lastUpdate: '2026-03-12', category: 'Resina', trend: 'stable' },
  { id: '3', name: 'Tinta Branca Ráfia', costPerKg: 45.00, unit: 'kg', lastUpdate: '2026-03-05', category: 'Insumo', trend: 'down' },
  { id: '4', name: 'Solvente Especial', costPerKg: 18.50, unit: 'L', lastUpdate: '2026-03-13', category: 'Químico', trend: 'up' },
];

export function MaterialsPage() {
  const [materials] = useState<Material[]>(MOCK_MATERIALS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Custos de Materiais</h1>
          <p className="text-slate-500">Gerencie os custos base para o motor de precificação.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <History className="w-4 h-4" />
          Histórico de Preços
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {materials.map((m) => (
          <div key={m.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-emerald-500 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div className={clsx(
                "flex items-center gap-1 text-[10px] font-bold uppercase",
                m.trend === 'up' ? "text-red-500" : m.trend === 'down' ? "text-emerald-500" : "text-slate-400"
              )}>
                {m.trend === 'up' ? 'Alta' : m.trend === 'down' ? 'Baixa' : 'Estável'}
              </div>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">{m.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{m.category}</p>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Custo Atual</p>
                <p className="text-xl font-black text-slate-900">R$ {m.costPerKg.toFixed(2)} <span className="text-xs font-normal text-slate-400">/{m.unit}</span></p>
              </div>
              <button className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Parametros de Processo */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Parâmetros de Custo Operacional
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Processos</h4>
            <ParamItem label="Custo de Corte (un)" value="R$ 0,02" />
            <ParamItem label="Custo de Costura (un)" value="R$ 0,03" />
            <ParamItem label="Custo de Impressão Frente (un)" value="R$ 0,05" />
            <ParamItem label="Custo de Impressão F/V (un)" value="R$ 0,09" />
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Insumos</h4>
            <ParamItem label="Aditivo Anti-UV (kg)" value="R$ 28,50" />
            <ParamItem label="Pigmento Branco (kg)" value="R$ 15,20" />
            <ParamItem label="Laminado Adicional (kg)" value="R$ 2,00" />
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tributação e Margem</h4>
            <ParamItem label="ICMS Médio" value="12%" />
            <ParamItem label="Margem de Contribuição Alvo" value="15%" />
            <ParamItem label="Comissão Vendas" value="3%" />
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Editar Parâmetros
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ParamItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}
