export interface PricingParams {
  materialType: 'convencional' | 'laminado';
  width: number; // cm
  length: number; // cm
  weight: number; // g/m2
  printingType: 'sem impressão' | 'frente' | 'frente e verso';
  quantity: number;
  additionalCosts: number;
  margin: number; // %
  tax: number; // %
}

export interface PricingResult {
  rawMaterialCost: number;
  printingCost: number;
  cuttingCost: number;
  sewingCost: number;
  taxAmount: number;
  marginAmount: number;
  totalCost: number;
  unitPrice: number;
  totalPrice: number;
  estimatedProfit: number;
}

export interface MaterialCost {
  id: string;
  name: string;
  unit: string;
  cost: number;
  updatedAt: string;
}
