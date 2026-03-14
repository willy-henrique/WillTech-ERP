import { useState } from 'react';
import { 
  Calculator, 
  Info, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Save
} from 'lucide-react';
import { PricingParams, PricingResult } from '../types';
import { calculatePricing } from '../utils/calculator';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { clsx } from 'clsx';

export function PricingPage() {
  const [params, setParams] = useState<PricingParams>({
    materialType: 'convencional',
    width: 50,
    length: 70,
    weight: 60,
    printingType: 'sem impressão',
    quantity: 1000,
    additionalCosts: 0,
    margin: 15,
    tax: 12
  });

  const [result, setResult] = useState<PricingResult | null>(null);

  const handleCalculate = () => {
    const res = calculatePricing(params);
    setResult(res);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calculadora de Precificação</h1>
          <p className="text-slate-500">Simule custos e defina preços de venda com precisão técnica.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Salvar Simulação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              Parâmetros do Produto
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Material</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={params.materialType === 'convencional' ? 'success' : 'outline'}
                    onClick={() => setParams({...params, materialType: 'convencional'})}
                    className="text-sm font-medium"
                  >
                    Convencional
                  </Button>
                  <Button 
                    variant={params.materialType === 'laminado' ? 'success' : 'outline'}
                    onClick={() => setParams({...params, materialType: 'laminado'})}
                    className="text-sm font-medium"
                  >
                    Laminado
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Largura (cm)"
                  type="number" 
                  value={params.width}
                  onChange={(e) => setParams({...params, width: Number(e.target.value)})}
                />
                <Input 
                  label="Comprimento (cm)"
                  type="number" 
                  value={params.length}
                  onChange={(e) => setParams({...params, length: Number(e.target.value)})}
                />
              </div>

              <Input 
                label="Gramatura (g/m²)"
                type="number" 
                value={params.weight}
                onChange={(e) => setParams({...params, weight: Number(e.target.value)})}
              />

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Impressão</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                  value={params.printingType}
                  onChange={(e) => setParams({...params, printingType: e.target.value as any})}
                >
                  <option value="sem impressão">Sem Impressão</option>
                  <option value="frente">Frente</option>
                  <option value="frente e verso">Frente e Verso</option>
                </select>
              </div>

              <div className="h-px bg-slate-100 my-2"></div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Quantidade"
                  type="number" 
                  value={params.quantity}
                  onChange={(e) => setParams({...params, quantity: Number(e.target.value)})}
                  className="font-bold"
                />
                <Input 
                  label="Margem (%)"
                  type="number" 
                  value={params.margin}
                  onChange={(e) => setParams({...params, margin: Number(e.target.value)})}
                />
              </div>

              <Button 
                onClick={handleCalculate}
                className="w-full py-3 rounded-xl font-bold gap-2 mt-4 shadow-lg shadow-emerald-200"
              >
                Calcular Preço
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {!result ? (
            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-400">Aguardando Parâmetros</h3>
              <p className="text-sm text-slate-400 max-w-xs mt-2">Preencha os dados ao lado e clique em calcular para ver a memória de custos e preço sugerido.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Main Price Card */}
              <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Calculator size={120} />
                </div>
                <div className="relative z-10">
                  <p className="text-emerald-100 font-medium uppercase tracking-wider text-xs">Preço Unitário Sugerido</p>
                  <h2 className="text-5xl font-black mt-2">R$ {result.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                  <div className="flex items-center gap-6 mt-6">
                    <div>
                      <p className="text-emerald-100 text-[10px] uppercase font-bold">Total do Lote</p>
                      <p className="text-xl font-bold">R$ {result.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="w-px h-10 bg-white/20"></div>
                    <div>
                      <p className="text-emerald-100 text-[10px] uppercase font-bold">Lucro Estimado</p>
                      <p className="text-xl font-bold text-emerald-200">R$ {result.estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Memória de Custos (Lote)
                  </h3>
                  <div className="space-y-3">
                    <CostItem label="Matéria-prima (PP)" value={result.rawMaterialCost} />
                    <CostItem label="Impressão" value={result.printingCost} />
                    <CostItem label="Corte" value={result.cuttingCost} />
                    <CostItem label="Costura" value={result.sewingCost} />
                    <div className="h-px bg-slate-100 my-2"></div>
                    <CostItem label="Custo Total Direto" value={result.totalCost} isBold />
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Impostos e Margem
                  </h3>
                  <div className="space-y-3">
                    <CostItem label={`Impostos (${params.tax}%)`} value={result.taxAmount} />
                    <CostItem label={`Margem (${params.margin}%)`} value={result.marginAmount} />
                    <div className="h-px bg-slate-100 my-2"></div>
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-800">Markup Aplicado</span>
                        <span className="text-sm font-black text-emerald-800">
                          {(result.unitPrice / (result.totalCost / params.quantity)).toFixed(2)}x
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Atenção:</strong> Este cálculo é uma simulação baseada nos custos operacionais atuais. 
                  Variações no preço do Polipropileno (PP) no mercado internacional podem afetar a margem real. 
                  Recomendamos validar orçamentos acima de 50.000 unidades com a diretoria.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CostItem({ label, value, isBold }: { label: string, value: number, isBold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={clsx("text-slate-500", isBold && "font-bold text-slate-800")}>{label}</span>
      <span className={clsx("text-slate-800", isBold && "font-bold")}>
        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}
