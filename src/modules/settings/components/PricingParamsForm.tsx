import { useState, useEffect, useMemo } from 'react';
import { Save, Plus, Trash2, Eye } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  pricingParametersService,
  computeLineCostFromPlanilha,
  DEFAULT_PLANILHA_EXTRAS,
  type PricingParametersRecord,
  type QuantityBand,
  type PlanilhaExtras,
} from '../services/pricingParametersService';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import {
  calcularPrecoCompleto,
  type PricingConfig,
  type BandConfig,
} from '../../pricing/utils/calcEngine';


/** Valores padrão das planilhas: menores 500 / a partir 1.000 / a partir 2.000 */
const defaultBands: QuantityBand[] = [
  { label: 'Menores 500 sacos', minQty: 0, maxQty: 499, lucroPct: 0.45, inverse: 0.55, acrescimo: 0.15 },
  { label: 'A partir de 1.000 sacos', minQty: 500, maxQty: 1999, lucroPct: 0.35, inverse: 0.65, acrescimo: 0.05 },
  { label: 'A partir de 2.000 sacos', minQty: 2000, maxQty: 1e9, lucroPct: 0.30, inverse: 0.70, acrescimo: 0.025 },
];

export interface PricingParamsFormState {
  rafiaPricePerKg: number;
  lineCost: number;
  cutCost: number;
  cutCostLarge: number;
  printCostPerSide: number;
  taxFactor: number;
  bands: QuantityBand[];
  planilha: PlanilhaExtras;
}

const defaultForm: PricingParamsFormState = {
  rafiaPricePerKg: 14,
  lineCost: 0,
  cutCost: 0.02,
  cutCostLarge: 0.01,
  printCostPerSide: 0.13,
  taxFactor: 0.915,
  bands: [...defaultBands],
  planilha: { ...DEFAULT_PLANILHA_EXTRAS },
};

export function PricingParamsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<(PricingParametersRecord & { validTo?: string })[]>([]);
  const [form, setForm] = useState<PricingParamsFormState>(defaultForm);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    (async () => {
      const [active, hist] = await Promise.all([
        pricingParametersService.getActive(),
        pricingParametersService.getHistory(10),
      ]);
      setHistory(hist);
      if (active) {
        setForm({
          rafiaPricePerKg: active.rafiaPricePerKg,
          lineCost: active.lineCost,
          cutCost: active.cutCost,
          cutCostLarge: active.cutCostLarge,
          printCostPerSide: active.printCostPerSide,
          taxFactor: active.taxFactor,
          bands: active.quantityBands?.length ? active.quantityBands : [...defaultBands],
          planilha: active.planilhaExtras ?? { ...DEFAULT_PLANILHA_EXTRAS },
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const lineCost = computeLineCostFromPlanilha(form.planilha);
      await addDoc(collection(db, 'pricing_parameters'), {
        rafiaPricePerKg: form.rafiaPricePerKg,
        lineCost,
        cutCost: form.cutCost,
        cutCostLarge: form.cutCostLarge,
        printCostPerSide: form.printCostPerSide,
        taxFactor: form.taxFactor,
        quantityBands: form.bands,
        planilhaExtras: form.planilha,
        consumptionFactor: 1,
        printCosts: {
          liso: 0,
          frente: form.printCostPerSide,
          frente_verso: form.printCostPerSide * 2,
        },
        inkCost: form.planilha.tinta,
        solventCost: form.planilha.solvente,
        operationalExtra: 0,
        taxRate: (1 - form.taxFactor) * 100,
        marginRate: form.planilha.addPct,
        inversePercent: 0,
        validFrom: new Date(),
        createdAt: new Date(),
      });
      const [active, hist] = await Promise.all([
        pricingParametersService.getActive(),
        pricingParametersService.getHistory(10),
      ]);
      setHistory(hist);
      if (active) {
        setForm({
          rafiaPricePerKg: active.rafiaPricePerKg,
          lineCost: active.lineCost,
          cutCost: active.cutCost,
          cutCostLarge: active.cutCostLarge,
          printCostPerSide: active.printCostPerSide,
          taxFactor: active.taxFactor,
          bands: active.quantityBands?.length ? active.quantityBands : [...defaultBands],
          planilha: active.planilhaExtras ?? { ...DEFAULT_PLANILHA_EXTRAS },
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  function updateBand(index: number, field: keyof QuantityBand, value: string | number) {
    setForm((f) => {
      const bands = [...f.bands];
      bands[index] = { ...bands[index], [field]: typeof value === 'string' ? value : Number(value) };
      if (field === 'lucroPct') bands[index].inverse = Math.round((1 - Number(value)) * 100) / 100;
      if (field === 'inverse') bands[index].lucroPct = Math.round((1 - Number(value)) * 100) / 100;
      return { ...f, bands };
    });
  }

  function addBand() {
    setForm((f) => ({
      ...f,
      bands: [
        ...f.bands,
        { label: 'Nova faixa', minQty: 0, maxQty: 999, lucroPct: 0.30, inverse: 0.70, acrescimo: 0.05 },
      ],
    }));
  }

  function removeBand(index: number) {
    setForm((f) => ({ ...f, bands: f.bands.filter((_, i) => i !== index) }));
  }

  function updatePlanilha<K extends keyof PlanilhaExtras>(field: K, value: PlanilhaExtras[K]) {
    setForm((f) => ({ ...f, planilha: { ...f.planilha, [field]: value } }));
  }

  const previewRow = useMemo(() => {
    if (!showPreview) return null;
    const cfg: PricingConfig = {
      rafiaPricePerKg: form.rafiaPricePerKg,
      lineCost: form.lineCost,
      cutCost: form.cutCost,
      cutCostLarge: form.cutCostLarge,
      printCostPerSide: form.printCostPerSide,
      taxFactor: form.taxFactor,
    };
    const size = { label: '50X80', widthCm: 50, lengthCm: 83, material: 'LAMINADO' as const, grammage: 60 };
    return form.bands.map((b) => {
      const band: BandConfig = { ...b };
      return { band: b, row: calcularPrecoCompleto(size, cfg, band) };
    });
  }, [form, showPreview]);

  if (loading) return <Card className="p-6">Carregando parâmetros...</Card>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custos operacionais (por unidade)</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Valores usados na Calculadora e na Tabela de Preços. Altere quando o mercado ou os custos mudarem.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ParamInput
              label="Preço PP / Ráfia (R$/kg)"
              value={form.rafiaPricePerKg}
              step={0.5}
              onChange={(v) => setForm({ ...form, rafiaPricePerKg: v })}
              hint="Matéria-prima"
            />
            <ParamInput
              label="Costura / Linha (R$/un)"
              value={computeLineCostFromPlanilha(form.planilha)}
              step={0.001}
              onChange={(v) => setForm({ ...form, lineCost: v })}
              hint="Calculado da planilha: cada sacaria passa (cm) × peso linha/cm (g) × preço/g. Ao salvar, este valor será gravado."
              readOnly
            />
            <ParamInput
              label="Corte (R$/un)"
              value={form.cutCost}
              step={0.01}
              onChange={(v) => setForm({ ...form, cutCost: v })}
            />
            <ParamInput
              label="Corte grande (R$/un)"
              value={form.cutCostLarge}
              step={0.01}
              onChange={(v) => setForm({ ...form, cutCostLarge: v })}
            />
            <ParamInput
              label="Impressão por lado (R$/un)"
              value={form.printCostPerSide}
              step={0.001}
              onChange={(v) => setForm({ ...form, printCostPerSide: v })}
            />
            <ParamInput
              label="Fator após imposto"
              value={form.taxFactor}
              step={0.001}
              onChange={(v) => setForm({ ...form, taxFactor: v })}
              hint={`Imposto NF: ${((1 - form.taxFactor) * 100).toFixed(1)}%`}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insumos e fatores (planilha)</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Parâmetros da planilha original. Editáveis para futuros ajustes e cálculos derivados.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <ParamInput label="Preço kg laminado (R$/kg)" value={form.planilha.priceKgLaminado} step={0.5} onChange={(v) => updatePlanilha('priceKgLaminado', v)} />
            <ParamInput label="Preço kg convencional (R$/kg)" value={form.planilha.priceKgConventional} step={0.5} onChange={(v) => updatePlanilha('priceKgConventional', v)} />
            <ParamInput label="Gramatura laminado (g/m²)" value={form.planilha.grammageLaminado} step={1} onChange={(v) => updatePlanilha('grammageLaminado', v)} />
            <ParamInput label="Gramatura convencional (g/m²)" value={form.planilha.grammageConventional} step={1} onChange={(v) => updatePlanilha('grammageConventional', v)} />
            <ParamInput label="Valor impressão (R$/un)" value={form.planilha.valorImpressao} step={0.01} onChange={(v) => updatePlanilha('valorImpressao', v)} />
            <ParamInput label="ADD %" value={form.planilha.addPct} step={1} onChange={(v) => updatePlanilha('addPct', v)} hint="Acréscimo geral" />
            <ParamInput label="Preço kg linha (R$/kg)" value={form.planilha.linePricePerKg} step={0.01} onChange={(v) => updatePlanilha('linePricePerKg', v)} />
            <ParamInput label="Preço linha por grama (R$/g)" value={form.planilha.linePricePerGram} step={0.001} onChange={(v) => updatePlanilha('linePricePerGram', v)} />
            <ParamInput label="Peso linha 1 m (g)" value={form.planilha.lineWeightPerMeter} step={0.01} onChange={(v) => updatePlanilha('lineWeightPerMeter', v)} />
            <ParamInput label="Peso linha 1 cm (g)" value={form.planilha.lineWeightPerCm} step={0.001} onChange={(v) => updatePlanilha('lineWeightPerCm', v)} />
            <ParamInput label="Cada sacaria passa (cm)" value={form.planilha.bagLineCm} step={1} onChange={(v) => updatePlanilha('bagLineCm', v)} />
            <ParamInput label="Tinta (R$)" value={form.planilha.tinta} step={0.5} onChange={(v) => updatePlanilha('tinta', v)} />
            <ParamInput label="Solvente (R$)" value={form.planilha.solvente} step={0.5} onChange={(v) => updatePlanilha('solvente', v)} />
            <ParamInput label="Consumo tinta" value={form.planilha.consumoTinta} step={0.00001} onChange={(v) => updatePlanilha('consumoTinta', v)} />
            <ParamInput label="Consumo solvente" value={form.planilha.consumoSolvente} step={0.00001} onChange={(v) => updatePlanilha('consumoSolvente', v)} />
            <ParamInput label="Consumo tinta impressão/lado (g)" value={form.planilha.consumoTintaImpressaoPorLado} step={0.0001} onChange={(v) => updatePlanilha('consumoTintaImpressaoPorLado', v)} />
            <ParamInput label="Custo liso corte (R$)" value={form.planilha.custoLisoCorte} step={0.01} onChange={(v) => updatePlanilha('custoLisoCorte', v)} />
            <ParamInput label="Custo impresso produção (R$)" value={form.planilha.custoImpressoProducao} step={0.01} onChange={(v) => updatePlanilha('custoImpressoProducao', v)} />
            <ParamInput label="ADD preço inicial" value={form.planilha.addPrecoInicial} step={0.01} onChange={(v) => updatePlanilha('addPrecoInicial', v)} />
            <ParamInput label="ADD preço intermediário" value={form.planilha.addPrecoIntermediario} step={0.01} onChange={(v) => updatePlanilha('addPrecoIntermediario', v)} />
            <ParamInput label="Custo aluguel total (R$)" value={form.planilha.custoAluguelTotal} step={100} onChange={(v) => updatePlanilha('custoAluguelTotal', v)} />
            <ParamInput label="Custo tinta por impressão (R$)" value={form.planilha.custoTintaPorImpressao} step={0.01} onChange={(v) => updatePlanilha('custoTintaPorImpressao', v)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle>Faixas de quantidade (margem por volume)</CardTitle>
          <Button variant="outline" size="sm" onClick={addBand} className="gap-1.5">
            <Plus className="w-4 h-4" /> Adicionar faixa
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.bands.map((band, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={band.label}
                  onChange={(e) => updateBand(i, 'label', e.target.value)}
                  className="font-bold text-slate-900 text-sm bg-transparent border-none outline-none"
                />
                {form.bands.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBand(i)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <BandInput label="Qtd mín." value={band.minQty} step={1} onChange={(v) => updateBand(i, 'minQty', v)} />
                <BandInput label="Qtd máx." value={band.maxQty >= 1e8 ? 999999 : band.maxQty} step={1} onChange={(v) => updateBand(i, 'maxQty', v)} />
                <BandInput label="Lucro %" value={band.lucroPct} step={0.01} onChange={(v) => updateBand(i, 'lucroPct', v)} />
                <BandInput label="Inverso %" value={band.inverse} step={0.01} onChange={(v) => updateBand(i, 'inverse', v)} />
                <BandInput label="Acréscimo" value={band.acrescimo} step={0.01} onChange={(v) => updateBand(i, 'acrescimo', v)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            Preview (ex.: 50×80 LAM. 60 g)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Ocultar' : 'Mostrar'}
          </Button>
        </CardHeader>
        {showPreview && previewRow && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faixa</TableHead>
                  <TableHead className="text-right">Custo liso</TableHead>
                  <TableHead className="text-right">V. liso</TableHead>
                  <TableHead className="text-right">Lucro liso</TableHead>
                  <TableHead className="text-right">V. frente</TableHead>
                  <TableHead className="text-right">V. F/V</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRow.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-sm">{p.band.label}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">R$ {p.row.custoLiso.toFixed(4)}</TableCell>
                    <TableCell className="text-right text-sm font-bold text-emerald-700 tabular-nums">R$ {p.row.valorLiso.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-sm text-emerald-600 tabular-nums">{p.row.lucroLiso.toFixed(4)}</TableCell>
                    <TableCell className="text-right text-sm font-bold text-blue-700 tabular-nums">R$ {p.row.valorImpressoFrente.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-sm font-bold text-purple-700 tabular-nums">R$ {p.row.valorImpressoFrenteVerso.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Ao salvar, uma nova versão dos parâmetros passa a valer para a Calculadora e a Tabela de Preços.
        </p>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar nova versão'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de alterações</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vigência</TableHead>
                <TableHead className="text-right">Ráfia/kg</TableHead>
                <TableHead className="text-right">Corte</TableHead>
                <TableHead className="text-right">Impr./lado</TableHead>
                <TableHead className="text-right">Imposto</TableHead>
                <TableHead>Faixas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-slate-500 text-sm">Nenhum registro.</TableCell>
                </TableRow>
              ) : (
                history.map((h, i) => (
                  <TableRow key={h.id ?? i}>
                    <TableCell className="text-sm">{new Date(h.validFrom).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">R$ {h.rafiaPricePerKg?.toFixed(2) ?? '—'}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">R$ {h.cutCost?.toFixed(2) ?? '—'}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">R$ {h.printCostPerSide?.toFixed(3) ?? '—'}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{h.taxFactor ? `${((1 - h.taxFactor) * 100).toFixed(1)}%` : '—'}</TableCell>
                    <TableCell className="text-sm text-slate-500">{h.quantityBands?.length ?? 0} faixas</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function ParamInput({
  label,
  value,
  step,
  onChange,
  hint,
  readOnly,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        readOnly={readOnly}
        className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 tabular-nums ${readOnly ? 'bg-slate-50 cursor-not-allowed' : ''}`}
      />
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

function BandInput({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 tabular-nums"
      />
    </div>
  );
}
