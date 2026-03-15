import { collection, query, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface QuantityBand {
  label: string;
  minQty: number;
  maxQty: number;
  lucroPct: number;
  inverse: number;
  acrescimo: number;
}

/** Parâmetros extras da planilha — editáveis para uso futuro (cálculo de linha, tinta, etc.). */
export interface PlanilhaExtras {
  priceKgLaminado: number;
  priceKgConventional: number;
  grammageLaminado: number;
  grammageConventional: number;
  valorImpressao: number;
  addPct: number;
  /** Preço kg linha (R$/kg) */
  linePricePerKg: number;
  /** Preço linha por grama (R$/g) */
  linePricePerGram: number;
  /** Gasto de linha por cm (g/cm) */
  lineWeightPerCm: number;
  /** Peso linha 1 metro (g) */
  lineWeightPerMeter: number;
  /** Cada sacaria passa (cm) */
  bagLineCm: number;
  tinta: number;
  solvente: number;
  consumoTinta: number;
  consumoSolvente: number;
  consumoTintaImpressaoPorLado: number;
  custoLisoCorte: number;
  custoImpressoProducao: number;
  addPrecoInicial: number;
  addPrecoIntermediario: number;
  custoAluguelTotal: number;
  custoTintaPorImpressao: number;
}

export interface PricingParametersRecord {
  id: string;
  rafiaPricePerKg: number;
  lineCost: number;
  cutCost: number;
  cutCostLarge: number;
  printCostPerSide: number;
  taxFactor: number;
  quantityBands: QuantityBand[];
  planilhaExtras?: PlanilhaExtras;
  consumptionFactor: number;
  printCosts?: Record<string, number>;
  inkCost: number;
  solventCost: number;
  operationalExtra: number;
  taxRate: number;
  marginRate: number;
  inversePercent: number;
  validFrom: string;
  createdBy?: string;
  createdAt?: string;
}

export const DEFAULT_PLANILHA_EXTRAS: PlanilhaExtras = {
  priceKgLaminado: 14,
  priceKgConventional: 14,
  grammageLaminado: 60,
  grammageConventional: 58,
  valorImpressao: 0.1,
  addPct: 15,
  linePricePerKg: 20.48,
  linePricePerGram: 0.02,
  lineWeightPerCm: 0.007,
  lineWeightPerMeter: 0.7,
  bagLineCm: 15,
  tinta: 30,
  solvente: 10,
  consumoTinta: 0.00017,
  consumoSolvente: 0.00032,
  consumoTintaImpressaoPorLado: 0.0005,
  custoLisoCorte: 0.02,
  custoImpressoProducao: 0.03,
  addPrecoInicial: 0.05,
  addPrecoIntermediario: 0.025,
  custoAluguelTotal: 6500,
  custoTintaPorImpressao: 0.02,
};

/**
 * Custo de linha por unidade (R$/saco) conforme a planilha de precificação.
 * Fórmula: CADA SACARIA PASSA (cm) × PESO LINHA 1 CM (g) × PREÇO LINHA POR GRAMA (R$/g).
 * Usado ao salvar em Configurar Preços e no backend quando lineCost não vem no doc.
 */
export function computeLineCostFromPlanilha(planilha: PlanilhaExtras): number {
  const raw = planilha.bagLineCm * planilha.lineWeightPerCm * planilha.linePricePerGram;
  return Math.round(raw * 10000) / 10000;
}

function toStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object' && 'toDate' in v)
    return (v as { toDate: () => Date }).toDate().toISOString();
  return String(v);
}

function mapPlanilhaExtras(data: Record<string, unknown>): PlanilhaExtras {
  const e = data.planilhaExtras as Record<string, unknown> | undefined;
  if (!e) return DEFAULT_PLANILHA_EXTRAS;
  return {
    priceKgLaminado: (e.priceKgLaminado as number) ?? 14,
    priceKgConventional: (e.priceKgConventional as number) ?? 14,
    grammageLaminado: (e.grammageLaminado as number) ?? 60,
    grammageConventional: (e.grammageConventional as number) ?? 58,
    valorImpressao: (e.valorImpressao as number) ?? 0.1,
    addPct: (e.addPct as number) ?? 15,
    linePricePerKg: (e.linePricePerKg as number) ?? 20.48,
    linePricePerGram: (e.linePricePerGram as number) ?? 0.02,
    lineWeightPerCm: (e.lineWeightPerCm as number) ?? 0.007,
    lineWeightPerMeter: (e.lineWeightPerMeter as number) ?? 0.7,
    bagLineCm: (e.bagLineCm as number) ?? 15,
    tinta: (e.tinta as number) ?? 30,
    solvente: (e.solvente as number) ?? 10,
    consumoTinta: (e.consumoTinta as number) ?? 0.00017,
    consumoSolvente: (e.consumoSolvente as number) ?? 0.00032,
    consumoTintaImpressaoPorLado: (e.consumoTintaImpressaoPorLado as number) ?? 0.0005,
    custoLisoCorte: (e.custoLisoCorte as number) ?? 0.02,
    custoImpressoProducao: (e.custoImpressoProducao as number) ?? 0.03,
    addPrecoInicial: (e.addPrecoInicial as number) ?? 0.05,
    addPrecoIntermediario: (e.addPrecoIntermediario as number) ?? 0.025,
    custoAluguelTotal: (e.custoAluguelTotal as number) ?? 6500,
    custoTintaPorImpressao: (e.custoTintaPorImpressao as number) ?? 0.02,
  };
}

function mapDoc(id: string, data: Record<string, unknown>): PricingParametersRecord {
  return {
    id,
    rafiaPricePerKg: (data.rafiaPricePerKg as number) ?? 14,
    lineCost: (data.lineCost as number) ?? 0,
    cutCost: (data.cutCost as number) ?? 0.02,
    cutCostLarge: (data.cutCostLarge as number) ?? 0.01,
    printCostPerSide: (data.printCostPerSide as number) ?? 0.13,
    taxFactor: (data.taxFactor as number) ?? 0.915,
    quantityBands: (data.quantityBands as QuantityBand[]) ?? [
      { label: 'Menores 500 sacos', minQty: 0, maxQty: 499, lucroPct: 0.45, inverse: 0.55, acrescimo: 0.15 },
      { label: 'A partir de 1.000 sacos', minQty: 500, maxQty: 1999, lucroPct: 0.35, inverse: 0.65, acrescimo: 0.05 },
      { label: 'A partir de 2.000 sacos', minQty: 2000, maxQty: 1e9, lucroPct: 0.30, inverse: 0.70, acrescimo: 0.025 },
    ],
    planilhaExtras: mapPlanilhaExtras(data),
    consumptionFactor: (data.consumptionFactor as number) ?? 1,
    printCosts: (data.printCosts as Record<string, number>) ?? {},
    inkCost: (data.inkCost as number) ?? 30,
    solventCost: (data.solventCost as number) ?? 10,
    operationalExtra: (data.operationalExtra as number) ?? 0,
    taxRate: (data.taxRate as number) ?? 8.5,
    marginRate: (data.marginRate as number) ?? 15,
    inversePercent: (data.inversePercent as number) ?? 0,
    validFrom: toStr(data.validFrom),
    createdBy: data.createdBy as string | undefined,
    createdAt: toStr(data.createdAt),
  };
}

export const pricingParametersService = {
  async getActive(): Promise<PricingParametersRecord | null> {
    const q = query(collection(db, 'pricing_parameters'), orderBy('validFrom', 'desc'), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return mapDoc(d.id, d.data());
  },

  async getHistory(limitCount: number = 20): Promise<(PricingParametersRecord & { validTo?: string })[]> {
    const q = query(collection(db, 'pricing_parameter_history'), orderBy('validFrom', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return { ...mapDoc(d.id, data), validTo: toStr(data.validTo) };
    });
  },

  async save(params: Omit<PricingParametersRecord, 'id' | 'validFrom' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, 'pricing_parameters'), {
      ...params,
      validFrom: new Date(),
      createdAt: new Date(),
    });
    return ref.id;
  },
};
