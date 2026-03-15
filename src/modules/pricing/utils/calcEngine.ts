/**
 * Motor de precificação de sacaria ráfia — TypeScript puro, zero dependência Firebase.
 *
 * Replica exatamente a planilha Excel (menores 500 / 1000+ / 2000+):
 *   CUSTO RÁFIA = 2 × L × C × (G/1000) × P_kg   (L,C em m; G em g/m²)
 *   CUSTO LINHA = derivado em Configurar Preços: cada sacaria passa (cm) × peso linha/cm (g) × preço/g (R$/g)
 *   c (custo liso) = RÁFIA + LINHA + CORTE
 *   VALOR = (custo / inverso) / taxFactor   (inverso por faixa de quantidade; taxFactor = 1 − imposto NF)
 *   LUCRO = VALOR × taxFactor − custo
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface SizeInput {
  label: string;
  widthCm: number;
  lengthCm: number;
  material: 'LAMINADO' | 'CONVENCIONAL';
  grammage: number;
}

export interface PricingConfig {
  rafiaPricePerKg: number;
  lineCost: number;
  cutCost: number;
  cutCostLarge: number;
  printCostPerSide: number;
  taxFactor: number;
}

export interface BandConfig {
  label: string;
  minQty: number;
  maxQty: number;
  lucroPct: number;
  inverse: number;
  acrescimo: number;
}

export interface PricingRow {
  label: string;
  widthCm: number;
  lengthCm: number;
  material: string;
  grammage: number;
  custoRafia: number;
  custoLinha: number;
  custoCorte: number;
  custoImpresso: number;
  custoLiso: number;
  custoFrente: number;
  custoFrenteVerso: number;
  valorLiso: number;
  lucroLiso: number;
  valorImpressoFrente: number;
  lucroImpressoFrente: number;
  valorImpressoFrenteVerso: number;
  lucroImpressoFrenteVerso: number;
  lucroPct: number;
  inversoPct: number;
  acrescimo: number;
  bandLabel: string;
}

export interface PricingTable {
  bands: Array<{
    band: BandConfig;
    rows: PricingRow[];
  }>;
}

// ---------------------------------------------------------------------------
// Defaults (valores idênticos à planilha)
// ---------------------------------------------------------------------------

export const DEFAULT_CONFIG: PricingConfig = {
  rafiaPricePerKg: 14,
  lineCost: 0,
  cutCost: 0.02,
  cutCostLarge: 0.01,
  printCostPerSide: 0.125,
  taxFactor: 0.915,
};

export const DEFAULT_BANDS: BandConfig[] = [
  { label: 'Menores 500', minQty: 0, maxQty: 499, lucroPct: 0.45, inverse: 0.55, acrescimo: 0.15 },
  { label: 'A partir de 1.000', minQty: 500, maxQty: 1999, lucroPct: 0.35, inverse: 0.65, acrescimo: 0.10 },
  { label: 'A partir de 2.000', minQty: 2000, maxQty: 1e9, lucroPct: 0.30, inverse: 0.70, acrescimo: 0.05 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const r2 = (n: number) => Math.round(n * 100) / 100;
const r4 = (n: number) => Math.round(n * 10000) / 10000;

// ---------------------------------------------------------------------------
// Funções de cálculo
// ---------------------------------------------------------------------------

export function calcularCustoRafia(
  widthCm: number,
  lengthCm: number,
  grammage: number,
  pricePerKg: number,
): number {
  const widthM = widthCm / 100;
  const lengthM = lengthCm / 100;
  return r4(2 * widthM * lengthM * (grammage / 1000) * pricePerKg);
}

export function calcularPrecoCompleto(
  size: SizeInput,
  config: PricingConfig,
  band: BandConfig,
): PricingRow {
  const custoRafia = calcularCustoRafia(
    size.widthCm,
    size.lengthCm,
    size.grammage,
    config.rafiaPricePerKg,
  );
  const custoLinha = r4(config.lineCost);
  const custoCorte = r4(config.cutCost);
  const custoImpresso = r4(config.printCostPerSide);

  const custoLiso = r4(custoRafia + custoLinha + custoCorte);
  const custoFrente = r4(custoLiso + custoImpresso);
  const custoFrenteVerso = r4(custoLiso + 2 * custoImpresso);

  const i = band.inverse;
  const tf = config.taxFactor;

  const valorLiso = r2((custoLiso / i) / tf);
  const valorImpressoFrente = r2((custoFrente / i) / tf);
  const valorImpressoFrenteVerso = r2((custoFrenteVerso / i) / tf);

  const lucroLiso = r4(valorLiso * tf - custoLiso);
  const lucroImpressoFrente = r4(valorImpressoFrente * tf - custoFrente);
  const lucroImpressoFrenteVerso = r4(valorImpressoFrenteVerso * tf - custoFrenteVerso);

  return {
    label: size.label,
    widthCm: size.widthCm,
    lengthCm: size.lengthCm,
    material: size.material,
    grammage: size.grammage,
    custoRafia,
    custoLinha,
    custoCorte,
    custoImpresso,
    custoLiso,
    custoFrente,
    custoFrenteVerso,
    valorLiso,
    lucroLiso,
    valorImpressoFrente,
    lucroImpressoFrente,
    valorImpressoFrenteVerso,
    lucroImpressoFrenteVerso,
    lucroPct: band.lucroPct,
    inversoPct: band.inverse,
    acrescimo: band.acrescimo,
    bandLabel: band.label,
  };
}

export function calcularTabelaCompleta(
  sizes: SizeInput[],
  config: PricingConfig,
  bands: BandConfig[],
): PricingTable {
  return {
    bands: bands.map((band) => ({
      band,
      rows: sizes.map((size) => calcularPrecoCompleto(size, config, band)),
    })),
  };
}

/**
 * Busca a faixa (band) correta pela quantidade.
 */
export function getBandForQuantity(qty: number, bands: BandConfig[]): BandConfig {
  return bands.find((b) => qty >= b.minQty && qty <= b.maxQty) ?? bands[0];
}

/**
 * Calcula preço unitário de um único tamanho dado a quantidade.
 */
export function calcularPrecoUnitario(
  size: SizeInput,
  config: PricingConfig,
  bands: BandConfig[],
  quantity: number,
  printType: 'liso' | 'frente' | 'frente_verso',
): { unitPrice: number; unitCost: number; liquidProfit: number; band: BandConfig } {
  const band = getBandForQuantity(quantity, bands);
  const row = calcularPrecoCompleto(size, config, band);

  let unitPrice: number;
  let unitCost: number;

  if (printType === 'frente_verso') {
    unitPrice = row.valorImpressoFrenteVerso;
    unitCost = row.custoFrenteVerso;
  } else if (printType === 'frente') {
    unitPrice = row.valorImpressoFrente;
    unitCost = row.custoFrente;
  } else {
    unitPrice = row.valorLiso;
    unitCost = row.custoLiso;
  }

  const liquidProfit = r4(unitPrice * config.taxFactor - unitCost);

  return { unitPrice, unitCost, liquidProfit, band };
}
