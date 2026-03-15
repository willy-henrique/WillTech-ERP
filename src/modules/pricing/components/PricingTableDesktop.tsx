import type { PricingRow, BandConfig } from '../utils/calcEngine';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Edit2, Trash2 } from 'lucide-react';

const fmt = (v: number, digits = 2) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

interface Props {
  rows: PricingRow[];
  band: BandConfig;
  onEdit?: (row: PricingRow) => void;
  onDelete?: (row: PricingRow) => void;
}

export function PricingTableDesktop({ rows, band, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="sticky left-0 bg-slate-50 z-10 min-w-[100px]">Tamanho</TableHead>
            <TableHead>Material</TableHead>
            <TableHead className="text-right">Gram.</TableHead>
            <TableHead className="text-right">C.Ráfia</TableHead>
            <TableHead className="text-right">C.Linha</TableHead>
            <TableHead className="text-right">C.Corte</TableHead>
            <TableHead className="text-right">C.Impr.</TableHead>
            <TableHead className="text-right bg-emerald-50 font-bold">V.Liso</TableHead>
            <TableHead className="text-right bg-emerald-50">Lucro Liso</TableHead>
            <TableHead className="text-right bg-blue-50 font-bold">Imp.Frente</TableHead>
            <TableHead className="text-right bg-blue-50">Lucro Fr.</TableHead>
            <TableHead className="text-right bg-purple-50 font-bold">Imp.F/V</TableHead>
            <TableHead className="text-right bg-purple-50">Lucro F/V</TableHead>
            {(onEdit || onDelete) && <TableHead className="w-20"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.label}-${row.material}`} className="hover:bg-slate-50/50">
              <TableCell className="sticky left-0 bg-white font-bold text-slate-900 z-10">
                {row.label}
              </TableCell>
              <TableCell className="text-xs text-slate-500">{row.material}</TableCell>
              <TableCell className="text-right text-sm tabular-nums">{row.grammage}g</TableCell>
              <TableCell className="text-right text-sm tabular-nums text-slate-600">
                {fmt(row.custoRafia, 4)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-slate-600">
                {fmt(row.custoLinha, 4)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-slate-600">
                {fmt(row.custoCorte, 4)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-slate-600">
                {fmt(row.custoImpresso, 4)}
              </TableCell>
              <TableCell className="text-right font-bold text-emerald-700 bg-emerald-50/50 tabular-nums">
                R$ {fmt(row.valorLiso)}
              </TableCell>
              <TableCell className="text-right text-sm text-emerald-600 bg-emerald-50/50 tabular-nums">
                {fmt(row.lucroLiso, 4)}
              </TableCell>
              <TableCell className="text-right font-bold text-blue-700 bg-blue-50/50 tabular-nums">
                R$ {fmt(row.valorImpressoFrente)}
              </TableCell>
              <TableCell className="text-right text-sm text-blue-600 bg-blue-50/50 tabular-nums">
                {fmt(row.lucroImpressoFrente, 4)}
              </TableCell>
              <TableCell className="text-right font-bold text-purple-700 bg-purple-50/50 tabular-nums">
                R$ {fmt(row.valorImpressoFrenteVerso)}
              </TableCell>
              <TableCell className="text-right text-sm text-purple-600 bg-purple-50/50 tabular-nums">
                {fmt(row.lucroImpressoFrenteVerso, 4)}
              </TableCell>
              {(onEdit || onDelete) && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>{rows.length} tamanhos</span>
        <span>
          Faixa: {band.label} | Inverso: {(band.inverse * 100).toFixed(0)}% | Lucro:{' '}
          {(band.lucroPct * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
