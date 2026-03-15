import { useState } from 'react';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { PricingRow } from '../utils/calcEngine';

const fmt = (v: number, digits = 2) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

interface Props {
  rows: PricingRow[];
  onEdit?: (row: PricingRow) => void;
  onDelete?: (row: PricingRow) => void;
}

export function PricingCardMobile({ rows, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={`${row.label}-${row.material}`}>
          <AccordionCard row={row} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}

function AccordionCard({
  row,
  onEdit,
  onDelete,
}: {
  row: PricingRow;
  onEdit?: (row: PricingRow) => void;
  onDelete?: (row: PricingRow) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{row.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-medium">
              {row.material}
            </span>
            <span className="text-[10px] text-slate-400">{row.grammage}g</span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm font-bold text-emerald-700">
              Liso R$ {fmt(row.valorLiso)}
            </span>
            <span className="text-xs text-blue-600">
              Fr. R$ {fmt(row.valorImpressoFrente)}
            </span>
            <span className="text-xs text-purple-600">
              F/V R$ {fmt(row.valorImpressoFrenteVerso)}
            </span>
          </div>
        </div>
        <ChevronDown
          className={clsx('w-5 h-5 text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="Custo Ráfia" value={fmt(row.custoRafia, 4)} />
            <DetailItem label="Custo Linha" value={fmt(row.custoLinha, 4)} />
            <DetailItem label="Custo Corte" value={fmt(row.custoCorte, 4)} />
            <DetailItem label="Custo Impressão" value={fmt(row.custoImpresso, 4)} />
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-2">
            <PriceRow label="Valor Liso" price={row.valorLiso} profit={row.lucroLiso} color="emerald" />
            <PriceRow label="Impresso Frente" price={row.valorImpressoFrente} profit={row.lucroImpressoFrente} color="blue" />
            <PriceRow label="Impresso F/V" price={row.valorImpressoFrenteVerso} profit={row.lucroImpressoFrenteVerso} color="purple" />
          </div>

          <div className="h-px bg-slate-100" />

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Lucro: {(row.lucroPct * 100).toFixed(0)}%</span>
            <span>Inverso: {(row.inversoPct * 100).toFixed(0)}%</span>
            <span>Acréscimo: {(row.acrescimo * 100).toFixed(0)}%</span>
          </div>

          {(onEdit || onDelete) && (
            <div className="flex items-center gap-2 pt-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(row)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
      <p className="text-sm font-mono text-slate-700">{value}</p>
    </div>
  );
}

function PriceRow({
  label,
  price,
  profit,
  color,
}: {
  label: string;
  price: number;
  profit: number;
  color: 'emerald' | 'blue' | 'purple';
}) {
  const textColor = {
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700',
  }[color];
  const profitColor = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  }[color];

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className={clsx('text-sm font-bold tabular-nums', textColor)}>R$ {fmt(price)}</span>
        <span className={clsx('text-xs tabular-nums', profitColor)}>lucro {fmt(profit, 4)}</span>
      </div>
    </div>
  );
}
