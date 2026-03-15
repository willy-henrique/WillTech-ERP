import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PricingRow, BandConfig } from './calcEngine';

const fmt = (v: number, d = 2) => v.toFixed(d);

export function exportPricingTablePdf(
  bands: Array<{ band: BandConfig; rows: PricingRow[] }>,
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(16);
  doc.text('Tabela de Preços — Sacaria Ráfia', 14, 15);
  doc.setFontSize(8);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 21);

  let startY = 26;

  for (const { band, rows } of bands) {
    doc.setFontSize(11);
    doc.text(band.label, 14, startY);
    doc.setFontSize(7);
    doc.text(
      `Lucro: ${(band.lucroPct * 100).toFixed(0)}%  |  Inverso: ${(band.inverse * 100).toFixed(0)}%  |  Acréscimo: ${(band.acrescimo * 100).toFixed(0)}%`,
      14,
      startY + 4,
    );

    autoTable(doc, {
      startY: startY + 7,
      head: [
        [
          'Tamanho',
          'Material',
          'Gram.',
          'C.Ráfia',
          'C.Linha',
          'C.Corte',
          'C.Impr.',
          'V.Liso',
          'Lucro Liso',
          'Imp.Fr.',
          'Lucro Fr.',
          'Imp.F/V',
          'Lucro F/V',
        ],
      ],
      body: rows.map((r) => [
        r.label,
        r.material,
        `${r.grammage}g`,
        fmt(r.custoRafia, 4),
        fmt(r.custoLinha, 4),
        fmt(r.custoCorte, 4),
        fmt(r.custoImpresso, 4),
        `R$ ${fmt(r.valorLiso)}`,
        fmt(r.lucroLiso, 4),
        `R$ ${fmt(r.valorImpressoFrente)}`,
        fmt(r.lucroImpressoFrente, 4),
        `R$ ${fmt(r.valorImpressoFrenteVerso)}`,
        fmt(r.lucroImpressoFrenteVerso, 4),
      ]),
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    if (startY > 170) {
      doc.addPage();
      startY = 15;
    }
  }

  doc.save(`tabela-precos-rafia-${new Date().toISOString().slice(0, 10)}.pdf`);
}
