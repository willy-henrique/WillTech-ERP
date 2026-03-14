import { useState, useEffect } from 'react';
import { 
  Factory, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Settings,
  ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';

interface ProductionOrder {
  id: string;
  orderId: string;
  productName: string;
  plannedQty: number;
  producedQty: number;
  status: 'pending' | 'in_progress' | 'paused' | 'completed';
  startDate: string;
  estimatedFinish: string;
  waste: number;
}

const MOCK_PO: ProductionOrder[] = [
  {
    id: 'OP-2026-1024',
    orderId: 'PED-2026-001',
    productName: 'Saco Ráfia Laminado 60x90',
    plannedQty: 2500,
    producedQty: 1800,
    status: 'in_progress',
    startDate: '2026-03-13 08:00',
    estimatedFinish: '2026-03-14 12:00',
    waste: 12,
  },
  {
    id: 'OP-2026-1025',
    orderId: 'PED-2026-002',
    productName: 'Saco Ráfia Convencional 50x70',
    plannedQty: 10000,
    producedQty: 0,
    status: 'pending',
    startDate: '2026-03-15 08:00',
    estimatedFinish: '2026-03-18 18:00',
    waste: 0,
  }
];

export function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>(MOCK_PO);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ordens de Produção</h1>
          <p className="text-slate-500">Controle o chão de fábrica e o progresso das OPs.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Settings className="w-4 h-4" />
          Planejamento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.map((op) => (
          <div key={op.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "p-2 rounded-lg",
                    op.status === 'in_progress' ? "bg-blue-50 text-blue-600" :
                    op.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                    "bg-slate-50 text-slate-500"
                  )}>
                    <Factory className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{op.id}</h3>
                    <p className="text-xs text-slate-500">Ref. Pedido: {op.orderId}</p>
                  </div>
                </div>
                <div className={clsx(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  op.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                  op.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                  "bg-slate-100 text-slate-600"
                )}>
                  {op.status === 'in_progress' ? 'Em Produção' : 
                   op.status === 'completed' ? 'Concluída' : 'Aguardando'}
                </div>
              </div>

              <h4 className="text-lg font-semibold text-slate-800 mb-4">{op.productName}</h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Planejado</p>
                  <p className="text-lg font-bold text-slate-800">{op.plannedQty.toLocaleString()} un</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Produzido</p>
                  <p className="text-lg font-bold text-emerald-600">{op.producedQty.toLocaleString()} un</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Saldo</p>
                  <p className="text-lg font-bold text-slate-800">{(op.plannedQty - op.producedQty).toLocaleString()} un</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Refugo/Perda</p>
                  <p className="text-lg font-bold text-red-500">{op.waste} un</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Progresso da Produção</span>
                  <span>{Math.round((op.producedQty / op.plannedQty) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(op.producedQty / op.plannedQty) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 w-full md:w-72 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Início</p>
                    <p className="text-xs font-medium text-slate-700">{op.startDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Previsão Término</p>
                    <p className="text-xs font-medium text-slate-700">{op.estimatedFinish}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                {op.status === 'pending' ? (
                  <button className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors">
                    <Play className="w-4 h-4" />
                    Iniciar
                  </button>
                ) : op.status === 'in_progress' ? (
                  <>
                    <button className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors">
                      <Pause className="w-4 h-4" />
                      Pausar
                    </button>
                    <button className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors">
                      <CheckCircle2 className="w-4 h-4" />
                      Finalizar
                    </button>
                  </>
                ) : (
                  <button className="flex-1 bg-slate-200 text-slate-600 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                    <ArrowRight className="w-4 h-4" />
                    Detalhes
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
