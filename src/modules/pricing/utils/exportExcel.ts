import * as XLSX from 'xlsx';
import type { PricingRow, BandConfig } from './calcEngine';

export function exportPricingTableExcel(
  bands: Array<{ band: BandConfig; rows: PricingRow[] }>,
) {
  const wb = XLSX.utils.book_new();

  for (const { band, rows } of bands) {
    const data = rows.map((r) => ({
      Tamanho: r.label,
      Material: r.material,
      'Gramatura (g)': r.grammage,
      'Custo Ráfia': r.custoRafia,
      'Custo Linha': r.custoLinha,
      'Custo Corte': r.custoCorte,
      'Custo Impressão': r.custoImpresso,
      'Custo Liso': r.custoLiso,
      'Valor Liso (R$)': r.valorLiso,
      'Lucro Liso': r.lucroLiso,
      'Impresso Frente (R$)': r.valorImpressoFrente,
      'Lucro Frente': r.lucroImpressoFrente,
      'Impresso F/V (R$)': r.valorImpressoFrenteVerso,
      'Lucro F/V': r.lucroImpressoFrenteVerso,
      'Lucro %': band.lucroPct,
      'Inverso %': band.inverse,
      'Acréscimo %': band.acrescimo,
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    const colWidths = [
      { wch: 10 }, { wch: 14 }, { wch: 10 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 14 }, { wch: 12 },
      { wch: 16 }, { wch: 12 },
      { wch: 16 }, { wch: 12 },
      { wch: 10 }, { wch: 10 }, { wch: 12 },
    ];
    ws['!cols'] = colWidths;

    const sheetName = band.label.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, `tabela-precos-rafia-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
