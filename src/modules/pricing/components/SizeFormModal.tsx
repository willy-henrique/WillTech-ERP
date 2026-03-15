import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { RafiaSize } from '../services/rafiaSizeService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<RafiaSize, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<RafiaSize>;
  existingLabels: string[];
  nextOrder: number;
}

export function SizeFormModal({ open, onClose, onSave, initialData, existingLabels, nextOrder }: Props) {
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState({
    label: '',
    widthCm: 0,
    lengthCm: 0,
    material: 'LAMINADO' as 'LAMINADO' | 'CONVENCIONAL',
    grammage: 60,
    order: nextOrder,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          label: initialData.label ?? '',
          widthCm: initialData.widthCm ?? 0,
          lengthCm: initialData.lengthCm ?? 0,
          material: initialData.material ?? 'LAMINADO',
          grammage: initialData.grammage ?? 60,
          order: initialData.order ?? nextOrder,
        });
      } else {
        setForm({
          label: '',
          widthCm: 0,
          lengthCm: 0,
          material: 'LAMINADO',
          grammage: 60,
          order: nextOrder,
        });
      }
      setError('');
    }
  }, [open, initialData, nextOrder]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.label.trim()) {
      setError('Informe o tamanho (ex: 45X55)');
      return;
    }
    if (form.widthCm <= 0 || form.lengthCm <= 0) {
      setError('Largura e comprimento devem ser maiores que zero');
      return;
    }
    if (form.grammage <= 0) {
      setError('Gramatura deve ser maior que zero');
      return;
    }
    if (!isEdit && existingLabels.includes(form.label.toUpperCase())) {
      setError(`O tamanho "${form.label}" já existe`);
      return;
    }

    onSave({
      label: form.label.toUpperCase(),
      widthCm: form.widthCm,
      lengthCm: form.lengthCm,
      material: form.material,
      grammage: form.grammage,
      active: true,
      order: form.order,
    });
  }

  /** Auto-gera label a partir de largura x comprimento */
  function autoLabel() {
    if (form.widthCm > 0 && form.lengthCm > 0) {
      setForm((f) => ({ ...f, label: `${f.widthCm}X${f.lengthCm}` }));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Tamanho' : 'Novo Tamanho'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Tamanho (Label)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="45X55"
              className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={autoLabel}
              className="px-3 py-2 text-xs font-medium bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors whitespace-nowrap"
            >
              Auto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Largura (cm)
            </label>
            <input
              type="number"
              value={form.widthCm || ''}
              onChange={(e) => setForm({ ...form, widthCm: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Comprimento (cm)
            </label>
            <input
              type="number"
              value={form.lengthCm || ''}
              onChange={(e) => setForm({ ...form, lengthCm: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Material</label>
          <div className="grid grid-cols-2 gap-2">
            {(['LAMINADO', 'CONVENCIONAL'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm({ ...form, material: m })}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  form.material === m
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Gramatura (g/m²)
          </label>
          <input
            type="number"
            value={form.grammage || ''}
            onChange={(e) => setForm({ ...form, grammage: Number(e.target.value) })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Ordem na tabela
          </label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            {isEdit ? 'Salvar Alterações' : 'Adicionar Tamanho'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
