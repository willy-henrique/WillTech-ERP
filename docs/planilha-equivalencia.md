# Equivalência Planilha Excel → Backend (Motor de Precificação Sacaria)

Este documento descreve a matemática exata replicada no motor de precificação.

## 1. Custos base (por unidade)

Para qualquer tamanho/material:

- **CUSTO RÁFIA** (R$/un):
  $$C_{\text{ráfia}} = 2 \times L \times C \times \frac{G}{1000} \times P_{\text{kg}}$$
  - \(L\) = largura (m), \(C\) = comprimento (m), \(G\) = gramatura (g/m²), \(P_{\text{kg}}\) = preço do kg (ex.: 14 R$/kg laminado ou convencional). O “2” é frente + verso do saco.

- **CUSTO LINHA** = valor da planilha (ou fórmula: peso linha 0,007 g/cm, preço/grama 0,02048, comprimento costurado + 15 cm extras por saco). No sistema: parâmetro `lineCost` (R$/un).

- **CUSTO CORTE** = 0,02 (ou 0,01 em alguns casos grandes). Parâmetro `cutCost`.

- **CUSTO IMPRESSO por lado** = 0,125 (inclui tinta + solvente + mão de obra). Fixo no motor; opcionalmente configurável por `printCostPerSide`.

- **Custo liso (c)**:
  $$c = C_{\text{ráfia}} + C_{\text{linha}} + C_{\text{corte}}$$

- **Custo frente** = \(c + 0{,}125\)

- **Custo frente e verso** = \(c + 2 \times 0{,}125\)

## 2. Imposto NF e inverso (lucro)

- **Imposto NF** = 8,5% → fator sobre o preço = **0,915** (1 − 0,085).

- **LUCRO % (p)** = margem líquida desejada depois do imposto, por faixa de quantidade:
  - &lt; 500 sacos → p ≈ 0,45 → **inverso i = 0,55**
  - 1.000+ sacos → p ≈ 0,35 → **inverso i = 0,65**
  - 2.000+ sacos → p ≈ 0,30 → **inverso i = 0,70**

- **INVERSO (i)** = 1 − p. No sistema: `quantityBands[].inverse`.

## 3. Fórmulas de preço sugerido (como na planilha)

$$\text{VALOR LISO} = \frac{c / i}{0{,}915}$$

$$\text{VALOR IMPRESSO FRENTE} = \frac{(c + 0{,}125) / i}{0{,}915}$$

$$\text{VALOR IMPRESSO FRENTE E VERSO} = \frac{(c + 2 \times 0{,}125) / i}{0{,}915}$$

Implementação: `functions/src/pricing/engine.ts` — variáveis `valorLiso`, `valorFrente`, `valorFrenteVerso`; preço unitário escolhido conforme tipo de impressão.

## 4. Lucro líquido (por unidade)

$$\text{LUCRO LISO} = \text{VALOR LISO} \times 0{,}915 - c$$

$$\text{LUCRO IMPRESSO FRENTE} = \text{VALOR FRENTE} \times 0{,}915 - (c + 0{,}125)$$

$$\text{LUCRO IMPRESSO F/V} = \text{VALOR ambos} \times 0{,}915 - (c + 2 \times 0{,}125)$$

No retorno do motor: `marginAmount` = lucro líquido total (quantidade × lucro unitário); `liquidProfit` igual a `marginAmount`.

## 5. Campos Firestore / parâmetros

| Parâmetro        | Uso no motor                          | Padrão   |
|------------------|----------------------------------------|----------|
| `rafiaPricePerKg`| Preço R$/kg (se não houver material)  | 14       |
| `lineCost`       | CUSTO LINHA (R$/un)                   | 0        |
| `cutCost`        | CUSTO CORTE (R$/un)                   | 0,02     |
| `printCostPerSide` | Custo impressão por lado (R$/un)    | 0,125    |
| `taxFactor`      | Fator após imposto (1 − 8,5%)         | 0,915    |
| `quantityBands`  | Faixas com `minQty`, `maxQty`, `inverse` | &lt;500→0,55; 1000+→0,65; 2000+→0,70 |

Preço por kg pode vir da coleção **materials** (`costPerKg`) quando o produto tem `materialId`; caso contrário usa `rafiaPricePerKg` dos parâmetros.

## 6. Entradas do callable `calculatePrice`

- **rawParams**: `width` (cm), `length` (cm), `grammage`, `materialType` (laminado | convencional), `printType` (liso | frente | frente_verso), `quantity`.
- **productVariantId** + **quantity**: alternativa; o motor carrega largura, comprimento, gramatura, material e tipo de impressão do Firestore.

## 7. Validação paralela (Excel × sistema)

1. Fixar um caso: largura (m), comprimento (m), gramatura, material, quantidade, tipo de impressão.
2. Calcular na planilha: VALOR LISO / FRENTE / F/V e lucros.
3. Chamar `calculatePrice` com os mesmos dados (convertendo m → cm se necessário).
4. Comparar com tolerância (ex.: R$ 0,01); documentar diferenças (ex.: arredondamento).

## 8. Histórico de alterações

| Data     | Alteração                                      |
|----------|-------------------------------------------------|
| (criação) | Mapeamento inicial.                            |
| Atual    | Fórmulas exatas sacaria: c, valor = (c/i)/0,915, faixas i, lucro líquido. |
