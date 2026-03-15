import { PricingParams, PricingResult } from '../types';

/**
 * Fallback quando não existe configuração em Configurar Preços / Firestore.
 * Usa valores padrão de referência (alinhados ao backend) para exibir uma estimativa.
 * Configure em Configurar Preços para usar custos reais.
 */
const FALLBACK_COSTS = {
  rafiaPricePerKg: 14,
  cutCost: 0.02,
  lineCost: 0.03,
  printFrente: 0.05,
  printFrenteVerso: 0.09,
};

export function calculatePricing(params: PricingParams): PricingResult {
  const { width, length, weight, materialType, printingType, quantity, additionalCosts, margin, tax } = params;

  const areaM2 = (width * 2 * length) / 10000;
  const weightKg = (areaM2 * weight) / 1000;
  const rawMaterialCost = weightKg * FALLBACK_COSTS.rafiaPricePerKg;

  let printingCost = 0;
  if (printingType === 'frente') printingCost = FALLBACK_COSTS.printFrente;
  if (printingType === 'frente e verso') printingCost = FALLBACK_COSTS.printFrenteVerso;

  const cuttingCost = FALLBACK_COSTS.cutCost;
  const sewingCost = FALLBACK_COSTS.lineCost;

  const safeQty = quantity > 0 ? quantity : 1;
  const unitDirectCost = rawMaterialCost + printingCost + cuttingCost + sewingCost + additionalCosts / safeQty;

  const divisor = 1 - (tax + margin) / 100;
  const unitPrice = Math.abs(divisor) > 1e-6 ? unitDirectCost / divisor : 0;

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
