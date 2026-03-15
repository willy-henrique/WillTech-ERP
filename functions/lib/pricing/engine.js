"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePrice = calculatePrice;
const admin = __importStar(require("firebase-admin"));
/** Custo linha por unidade (R$/saco): cada sacaria passa (cm) × peso linha 1 cm (g) × preço/g */
function computeLineCostFromPlanilha(planilha) {
    if (!planilha?.bagLineCm || !planilha?.lineWeightPerCm || !planilha?.linePricePerGram)
        return 0;
    const raw = planilha.bagLineCm * planilha.lineWeightPerCm * planilha.linePricePerGram;
    return round4(raw);
}
const db = admin.firestore();
const round2 = (n) => Math.round(n * 100) / 100;
const round4 = (n) => Math.round(n * 10000) / 10000;
const DEFAULT_INVERSE_BANDS = [
    { minQty: 0, maxQty: 499, inverse: 0.55 },
    { minQty: 500, maxQty: 999, inverse: 0.65 },
    { minQty: 1000, maxQty: 1999, inverse: 0.65 },
    { minQty: 2000, maxQty: 1e9, inverse: 0.70 },
];
function getBands(paramsSnap) {
    if (paramsSnap.empty)
        return DEFAULT_INVERSE_BANDS;
    const bands = paramsSnap.docs[0].data().quantityBands;
    if (bands?.length)
        return bands.filter((b) => b.inverse != null);
    return DEFAULT_INVERSE_BANDS;
}
function getInverseForQuantity(quantity, bands) {
    if (!bands?.length)
        return 0.65;
    const band = bands
        .filter((b) => b.inverse != null)
        .find((b) => quantity >= b.minQty && quantity <= (b.maxQty ?? 1e9));
    return band?.inverse ?? 0.65;
}
async function calculatePrice(input, userId) {
    const { productVariantId, rawParams, quantity, overrides } = input;
    const qty = quantity ?? rawParams?.quantity ?? 0;
    if (!qty || qty <= 0)
        throw new Error('quantity is required and must be positive');
    let widthCm;
    let lengthCm;
    let grammage;
    let materialId;
    let printType;
    if (rawParams) {
        widthCm = rawParams.width;
        lengthCm = rawParams.length;
        grammage = rawParams.grammage;
        printType = rawParams.printType;
        const matSnap = await db.collection('materials').where('type', '==', rawParams.materialType).limit(1).get();
        materialId = matSnap.empty ? '' : matSnap.docs[0].id;
    }
    else if (productVariantId) {
        const variantSnap = await db.collection('product_variants').doc(productVariantId).get();
        if (!variantSnap.exists)
            throw new Error('Product variant not found');
        const variant = variantSnap.data();
        const templateSnap = await db.collection('product_templates').doc(variant.productTemplateId).get();
        if (!templateSnap.exists)
            throw new Error('Product template not found');
        const template = templateSnap.data();
        widthCm = variant.width ?? template.width;
        lengthCm = variant.length ?? template.length;
        materialId = variant.materialId ?? template.materialId ?? '';
        printType = (variant.printTypeId === 'frente_verso' ? 'frente_verso' : variant.printTypeId === 'frente' ? 'frente' : 'liso');
        if (variant.grammageValue != null)
            grammage = variant.grammageValue;
        else if (template.grammageId) {
            const gramSnap = await db.collection('grammages').doc(template.grammageId).get();
            grammage = gramSnap.data()?.value ?? 0;
        }
        else
            grammage = 0;
    }
    else {
        throw new Error('productVariantId or rawParams is required for calculation');
    }
    let rafiaPricePerKg = 14;
    let lineCost = 0;
    let cutCost = 0.02;
    let printCostPerSide = 0.125;
    let taxFactor = 0.915;
    const paramsSnap = await db.collection('pricing_parameters').orderBy('validFrom', 'desc').limit(1).get();
    if (!paramsSnap.empty) {
        const params = paramsSnap.docs[0].data();
        if (params.rafiaPricePerKg != null)
            rafiaPricePerKg = params.rafiaPricePerKg;
        lineCost = params.lineCost != null && params.lineCost > 0
            ? params.lineCost
            : computeLineCostFromPlanilha(params.planilhaExtras);
        if (params.cutCost != null)
            cutCost = params.cutCost;
        if (params.printCostPerSide != null)
            printCostPerSide = params.printCostPerSide;
        if (params.taxFactor != null)
            taxFactor = params.taxFactor;
    }
    const materialSnap = await db.collection('materials').doc(materialId).get();
    if (materialSnap.exists) {
        const costKg = materialSnap.data()?.costPerKg;
        if (costKg != null)
            rafiaPricePerKg = costKg;
    }
    const widthM = widthCm / 100;
    const lengthM = lengthCm / 100;
    const costRafia = 2 * widthM * lengthM * (grammage / 1000) * rafiaPricePerKg;
    const c = round4(costRafia + lineCost + cutCost);
    const costFrente = round4(c + printCostPerSide);
    const costFrenteVerso = round4(c + 2 * printCostPerSide);
    const bands = getBands(paramsSnap);
    const i = getInverseForQuantity(qty, bands);
    const valorLiso = round2((c / i) / taxFactor);
    const valorFrente = round2((costFrente / i) / taxFactor);
    const valorFrenteVerso = round2((costFrenteVerso / i) / taxFactor);
    let unitCost;
    let unitPrice;
    if (printType === 'frente_verso') {
        unitCost = costFrenteVerso;
        unitPrice = valorFrenteVerso;
    }
    else if (printType === 'frente') {
        unitCost = costFrente;
        unitPrice = valorFrente;
    }
    else {
        unitCost = c;
        unitPrice = valorLiso;
    }
    if (overrides?.manualPrice != null && overrides.manualPrice > 0) {
        unitPrice = round2(overrides.manualPrice);
        await db.collection('audit_logs').add({
            action: 'price_override',
            entityType: 'quotation_item',
            entityId: '',
            userId,
            reason: overrides.reason ?? '',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    const totalPrice = round2(unitPrice * qty);
    const totalCost = round4(unitCost * qty);
    const taxRate = 1 - taxFactor;
    const taxAmount = round2(unitPrice * taxRate * qty);
    const liquidProfitPerUnit = round4(unitPrice * taxFactor - unitCost);
    const marginAmount = round2(liquidProfitPerUnit * qty);
    const steps = [
        { name: 'costRafia', output: costRafia },
        { name: 'c_liso', output: c },
        { name: 'inverse_i', output: i },
        { name: 'unitCost', output: unitCost },
        { name: 'unitPrice', output: unitPrice },
    ];
    return {
        unitCost,
        unitPrice,
        totalPrice,
        totalCost,
        taxAmount,
        marginAmount,
        liquidProfit: marginAmount,
        steps,
        valorLiso,
        valorFrente,
        valorFrenteVerso,
        rawMaterialCost: round4(costRafia * qty),
        printingCost: round4((unitCost - c) * qty),
        cuttingCost: round4(cutCost * qty),
        lineCost: round4(lineCost * qty),
    };
}
//# sourceMappingURL=engine.js.map