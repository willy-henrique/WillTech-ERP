import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Info, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Save, Settings } from 'lucide-react';
import { PricingParams, PricingResult } from '../types';
import { calculatePricing } from '../utils/calculator';
import { calculatePriceFromParams } from '../services/pricingService';
import { pricingParametersService, type PricingParametersRecord } from '../../settings/services/pricingParametersService';
import { calcularPrecoUnitario, calcularPrecoCompleto, DEFAULT_BANDS, type PricingConfig, type BandConfig, type SizeInput } from '../utils/calcEngine';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { clsx } from 'clsx';

const printTypeToCloud = (p: string): 'liso' | 'frente' | 'frente_verso' =>
  p === 'frente' ? 'frente' : p === 'frente e verso' ? 'frente_verso' : 'liso';

// Valores numéricos como string nos inputs para permitir campo vazio (ex.: substituir 0 ao digitar)
function toNum(s: string): number {
  const n = Number(s);
  return Number.isNaN(n) ? 0 : n;
}

function recordToPricingConfig(rec: PricingParametersRecord): PricingConfig {
  return {
    rafiaPricePerKg: rec.rafiaPricePerKg,
    lineCost: rec.lineCost,
    cutCost: rec.cutCost,
    cutCostLarge: rec.cutCostLarge,
    printCostPerSide: rec.printCostPerSide,
    taxFactor: rec.taxFactor,
  };
}

function recordBandsToConfig(rec: PricingParametersRecord): BandConfig[] {
  const bands = rec.quantityBands;
  if (bands?.length) return bands as BandConfig[];
  return DEFAULT_BANDS;
}

function calculateWithConfig(
  numericParams: PricingParams,
  config: PricingParametersRecord,
): PricingResult {
  const pricingConfig = recordToPricingConfig(config);
  const bands = recordBandsToConfig(config);
  const size: SizeInput = {
    label: `${numericParams.width}x${numericParams.length}`,
    widthCm: numericParams.width,
    lengthCm: numericParams.length,
    material: numericParams.materialType === 'laminado' ? 'LAMINADO' : 'CONVENCIONAL',
    grammage: numericParams.weight,
  };
  const printType = printTypeToCloud(numericParams.printingType);
  const { unitPrice, unitCost, liquidProfit, band } = calcularPrecoUnitario(
    size,
    pricingConfig,
    bands,
    numericParams.quantity,
    printType,
  );
  const row = calcularPrecoCompleto(size, pricingConfig, band);
  const qty = numericParams.quantity;
  const rawMaterialCost = row.custoRafia * qty;
  const sewingCost = row.custoLinha * qty;
  const cuttingCost = row.custoCorte * qty;
  const printingCost =
    printType === 'frente_verso'
      ? (row.custoFrenteVerso - row.custoLiso) * qty
      : printType === 'frente'
        ? (row.custoFrente - row.custoLiso) * qty
        : 0;
  const totalCost = unitCost * qty;
  const totalPrice = unitPrice * qty;
  const marginAmount = liquidProfit * qty;
  const taxAmount = Math.max(0, totalPrice - totalCost - marginAmount);
  return {
    rawMaterialCost,
    printingCost,
    cuttingCost,
    sewingCost,
    taxAmount,
    marginAmount,
    totalCost,
    unitPrice,
    totalPrice,
    estimatedProfit: marginAmount,
  };
}

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
    tax: 12,
  });

  // Estado de exibição dos campos numéricos (string) para não forçar 0 ao apagar
  const [widthStr, setWidthStr] = useState(String(params.width));
  const [lengthStr, setLengthStr] = useState(String(params.length));
  const [weightStr, setWeightStr] = useState(String(params.weight));
  const [quantityStr, setQuantityStr] = useState(String(params.quantity));
  const [marginStr, setMarginStr] = useState(String(params.margin));

  const [result, setResult] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [useCloud, setUseCloud] = useState(true);

  const [activeConfig, setActiveConfig] = useState<PricingParametersRecord | null>(null);
  const [configHistory, setConfigHistory] = useState<PricingParametersRecord[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('active');

  useEffect(() => {
    (async () => {
      setConfigLoading(true);
      try {
        const [active, history] = await Promise.all([
          pricingParametersService.getActive(),
          pricingParametersService.getHistory(20),
        ]);
        setActiveConfig(active);
        setConfigHistory(history);
        setSelectedConfigId('active');
      } finally {
        setConfigLoading(false);
      }
    })();
  }, []);

  const selectedConfig: PricingParametersRecord | null =
    selectedConfigId === 'active' ? activeConfig : configHistory.find((c) => c.id === selectedConfigId) ?? activeConfig;

  useEffect(() => {
    const planilha = selectedConfig?.planilhaExtras;
    if (!planilha) return;
    const grammage = params.materialType === 'laminado' ? planilha.grammageLaminado : planilha.grammageConventional;
    setWeightStr(String(grammage));
    setParams((p) => ({ ...p, weight: grammage }));
  }, [params.materialType, selectedConfig?.id]);

  const handleCalculate = async () => {
    const numericParams: PricingParams = {
      ...params,
      width: toNum(widthStr),
      length: toNum(lengthStr),
      weight: toNum(weightStr),
      quantity: toNum(quantityStr),
      margin: toNum(marginStr),
    };
    setParams(numericParams);
    setWidthStr(String(numericParams.width));
    setLengthStr(String(numericParams.length));
    setWeightStr(String(numericParams.weight));
    setQuantityStr(String(numericParams.quantity));
    setMarginStr(String(numericParams.margin));

    if (useCloud) {
      setLoading(true);
      try {
        const cloud = await calculatePriceFromParams({
          width: numericParams.width,
          length: numericParams.length,
          grammage: numericParams.weight,
          materialType: numericParams.materialType,
          printType: printTypeToCloud(numericParams.printingType),
          quantity: numericParams.quantity,
        });
        setResult({
          rawMaterialCost: cloud.rawMaterialCost ?? 0,
          printingCost: cloud.printingCost ?? 0,
          cuttingCost: cloud.cuttingCost ?? 0,
          sewingCost: cloud.lineCost ?? 0,
          taxAmount: cloud.taxAmount,
          marginAmount: cloud.marginAmount,
          totalCost: cloud.totalCost,
          unitPrice: cloud.unitPrice,
          totalPrice: cloud.totalPrice,
          estimatedProfit: cloud.marginAmount,
        });
      } catch (e) {
        console.error(e);
        if (selectedConfig) setResult(calculateWithConfig(numericParams, selectedConfig));
        else setResult(calculatePricing(numericParams));
      } finally {
        setLoading(false);
      }
    } else {
      if (selectedConfig) {
        setResult(calculateWithConfig(numericParams, selectedConfig));
      } else {
        setResult(calculatePricing(numericParams));
      }
    }
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
                  value={widthStr}
                  onChange={(e) => setWidthStr(e.target.value)}
                />
                <Input 
                  label="Comprimento (cm)"
                  type="number" 
                  value={lengthStr}
                  onChange={(e) => setLengthStr(e.target.value)}
                />
              </div>

              <Input 
                label="Gramatura (g/m²)"
                type="number" 
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
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
                  value={quantityStr}
                  onChange={(e) => setQuantityStr(e.target.value)}
                  className="font-bold"
                />
                <Input 
                  label="Margem (%)"
                  type="number" 
                  value={marginStr}
                  onChange={(e) => setMarginStr(e.target.value)}
                />
              </div>

              {!configLoading && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Configuração de precificação</p>
                  {activeConfig ? (
                    <>
                      <p className="text-sm text-slate-700">
                        Parâmetros vigentes desde{' '}
                        <span className="font-medium">
                          {new Date(activeConfig.validFrom).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                      {!useCloud && configHistory.length > 0 && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Usar configuração</label>
                          <select
                            value={selectedConfigId}
                            onChange={(e) => setSelectedConfigId(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="active">Vigente</option>
                            {configHistory.map((h) => (
                              <option key={h.id} value={h.id}>
                                {new Date(h.validFrom).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <Link
                        to="/configurar-precos"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        <Settings className="w-4 h-4" />
                        Alterar em Configurar Preços
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-amber-700">
                        Nenhum parâmetro cadastrado. O cálculo usará valores padrão.
                      </p>
                      <Link
                        to="/configurar-precos"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        <Settings className="w-4 h-4" />
                        Configurar em Configurar Preços
                      </Link>
                    </>
                  )}
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={useCloud} onChange={(e) => setUseCloud(e.target.checked)} />
                Usar motor do servidor (parâmetros vigentes)
              </label>
              <Button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold gap-2 mt-4 shadow-lg shadow-emerald-200"
              >
                {loading ? 'Calculando...' : 'Calcular Preço'}
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
                          {params.quantity > 0 && result.totalCost > 0
                            ? (result.unitPrice / (result.totalCost / params.quantity)).toFixed(2) + 'x'
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
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
