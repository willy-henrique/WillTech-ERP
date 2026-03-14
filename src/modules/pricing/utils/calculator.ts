import { PricingParams, PricingResult } from '../types';

// Custos base mockados (em um cenário real viriam do banco/configurações)
const COSTS = {
  PP_KG: 12.50, // Polipropileno por KG
  LAMINADO_KG_EXTRA: 2.00, // Adicional por KG se for laminado
  PRINT_FRENTE: 0.05, // Custo por unidade para impressão frente
  PRINT_FRENTE_VERSO: 0.09, // Custo por unidade para impressão frente e verso
  CORTE: 0.02, // Custo de corte por unidade
  COSTURA: 0.03, // Custo de costura por unidade
};

export function calculatePricing(params: PricingParams): PricingResult {
  const { width, length, weight, materialType, printingType, quantity, additionalCosts, margin, tax } = params;

  // 1. Calcular peso do saco em gramas
  // Área em m2 = (largura * 2 * comprimento) / 10000 (saco tem duas faces)
  const areaM2 = (width * 2 * length) / 10000;
  const weightGrams = areaM2 * weight;
  const weightKg = weightGrams / 1000;

  // 2. Custo de Matéria Prima
  const baseKgCost = materialType === 'laminado' ? COSTS.PP_KG + COSTS.LAMINADO_KG_EXTRA : COSTS.PP_KG;
  const rawMaterialCost = weightKg * baseKgCost;

  // 3. Custo de Impressão
  let printingCost = 0;
  if (printingType === 'frente') printingCost = COSTS.PRINT_FRENTE;
  if (printingType === 'frente e verso') printingCost = COSTS.PRINT_FRENTE_VERSO;

  // 4. Custos Operacionais
  const cuttingCost = COSTS.CORTE;
  const sewingCost = COSTS.COSTURA;

  // 5. Soma dos Custos Diretos Unitários
  const unitDirectCost = rawMaterialCost + printingCost + cuttingCost + sewingCost + (additionalCosts / quantity);

  // 6. Impostos e Margem (sobre o preço de venda)
  // PV = Custo / (1 - (Tax + Margin)/100)
  const divisor = 1 - ((tax + margin) / 100);
  const unitPrice = unitDirectCost / divisor;

  const totalPrice = unitPrice * quantity;
  const taxAmount = unitPrice * (tax / 100) * quantity;
  const marginAmount = unitPrice * (margin / 100) * quantity;
  const totalCost = unitDirectCost * quantity;

  return {
    rawMaterialCost: rawMaterialCost * quantity,
    printingCost: printingCost * quantity,
    cuttingCost: cuttingCost * quantity,
    sewingCost: sewingCost * quantity,
    taxAmount,
    marginAmount,
    totalCost,
    unitPrice,
    totalPrice,
    estimatedProfit: marginAmount
  };
}
