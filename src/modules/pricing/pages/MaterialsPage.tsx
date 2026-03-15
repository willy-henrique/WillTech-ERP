import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Edit2, History, TrendingUp, ArrowRight } from 'lucide-react';
import { materialService, type MaterialRecord } from '../services/materialService';
import { pricingParametersService } from '../../settings/services/pricingParametersService';
import { Card } from '../../../components/ui/Card';

export function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [params, setParams] = useState<Awaited<ReturnType<typeof pricingParametersService.getActive>>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [mat, pr] = await Promise.all([materialService.getMaterials(), pricingParametersService.getActive()]);
      setMaterials(mat);
      setParams(pr);
      setLoading(false);
    })();
  }, []);

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
        {loading ? (
          <div className="col-span-full text-slate-500">Carregando materiais...</div>
        ) : (
          materials.map((m) => (
            <Card key={m.id} className="p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400">{m.type}</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{m.name}</h3>
              <p className="text-xs text-slate-400 mb-4">Custo por kg</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Custo Atual</p>
                  <p className="text-xl font-black text-slate-900">R$ {m.costPerKg.toFixed(2)} <span className="text-xs font-normal text-slate-400">/{m.unit}</span></p>
                </div>
                <button className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Editar">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Parâmetros de processo (resumo); edição em Configurações */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Parâmetros de Custo Operacional
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Processos</h4>
            <ParamItem label="Custo de Corte (un)" value={params ? `R$ ${params.cutCost.toFixed(2)}` : '—'} />
            <ParamItem label="Custo de Linha (un)" value={params ? `R$ ${params.lineCost.toFixed(2)}` : '—'} />
            <ParamItem label="Impressão Frente (un)" value={params?.printCosts?.frente != null ? `R$ ${params.printCosts.frente.toFixed(2)}` : '—'} />
            <ParamItem label="Impressão F/V (un)" value={params?.printCosts?.frente_verso != null ? `R$ ${params.printCosts.frente_verso.toFixed(2)}` : '—'} />
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Insumos</h4>
            <ParamItem label="Tinta" value={params ? `R$ ${params.inkCost.toFixed(2)}` : '—'} />
            <ParamItem label="Solvente" value={params ? `R$ ${params.solventCost.toFixed(2)}` : '—'} />
            <ParamItem label="Operacional extra" value={params ? `R$ ${params.operationalExtra.toFixed(2)}` : '—'} />
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tributação e Margem</h4>
            <ParamItem label="Imposto (%)" value={params ? `${params.taxRate}%` : '—'} />
            <ParamItem label="Margem (%)" value={params ? `${params.marginRate}%` : '—'} />
            <ParamItem label="Inverso (%)" value={params ? `${params.inversePercent}%` : '—'} />
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Link to="/settings?tab=params" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Editar em Configurações
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>
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
