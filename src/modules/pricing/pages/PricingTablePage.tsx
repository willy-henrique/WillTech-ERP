import { useState, useEffect, useMemo } from 'react';
import { TableProperties, Plus, Search, Download, Upload, AlertCircle, FileSpreadsheet, FileDown } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TierTabs } from '../components/TierTabs';
import { PricingTableDesktop } from '../components/PricingTableDesktop';
import { PricingCardMobile } from '../components/PricingCardMobile';
import { SizeFormModal } from '../components/SizeFormModal';
import { rafiaSizeService, type RafiaSize } from '../services/rafiaSizeService';
import { pricingParametersService, type PricingParametersRecord } from '../../settings/services/pricingParametersService';
import { DEFAULT_RAFIA_SIZES } from '../utils/seedData';
import {
  calcularTabelaCompleta,
  DEFAULT_CONFIG,
  DEFAULT_BANDS,
  type PricingConfig,
  type BandConfig,
  type PricingRow,
  type SizeInput,
} from '../utils/calcEngine';
import { exportPricingTablePdf } from '../utils/exportPdf';
import { exportPricingTableExcel } from '../utils/exportExcel';

export function PricingTablePage() {
  const [sizes, setSizes] = useState<RafiaSize[]>([]);
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_CONFIG);
  const [bands, setBands] = useState<BandConfig[]>(DEFAULT_BANDS);
  const [activeParams, setActiveParams] = useState<PricingParametersRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeBand, setActiveBand] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<RafiaSize | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sizesData, paramsData] = await Promise.all([
        rafiaSizeService.getAll(),
        pricingParametersService.getActive(),
      ]);
      setSizes(sizesData);

      if (paramsData) {
        setActiveParams(paramsData);
        setConfig({
          rafiaPricePerKg: paramsData.rafiaPricePerKg,
          lineCost: paramsData.lineCost,
          cutCost: paramsData.cutCost,
          cutCostLarge: paramsData.cutCostLarge,
          printCostPerSide: paramsData.printCostPerSide,
          taxFactor: paramsData.taxFactor,
        });
        if (paramsData.quantityBands?.length) {
          setBands(paramsData.quantityBands);
        }
      } else {
        setActiveParams(null);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  const sizeInputs: SizeInput[] = useMemo(() => {
    const planilha = activeParams?.planilhaExtras;
    return sizes.map((s) => {
      const grammage =
        s.grammage && s.grammage > 0
          ? s.grammage
          : planilha
            ? s.material === 'LAMINADO'
              ? planilha.grammageLaminado
              : planilha.grammageConventional
            : s.material === 'LAMINADO'
              ? 60
              : 58;
      return {
        label: s.label,
        widthCm: s.widthCm,
        lengthCm: s.lengthCm,
        material: s.material,
        grammage,
      };
    });
  }, [sizes, activeParams]);

  const table = useMemo(
    () => calcularTabelaCompleta(sizeInputs, config, bands),
    [sizeInputs, config, bands],
  );

  const filteredTable = useMemo(() => {
    if (!search.trim()) return table;
    const q = search.toLowerCase();
    return {
      bands: table.bands.map((b) => ({
        ...b,
        rows: b.rows.filter(
          (r) =>
            r.label.toLowerCase().includes(q) ||
            r.material.toLowerCase().includes(q),
        ),
      })),
    };
  }, [table, search]);

  function handleEdit(row: PricingRow) {
    const size = sizes.find((s) => s.label === row.label && s.material === row.material);
    if (size) {
      setEditingSize(size);
      setModalOpen(true);
    }
  }

  function handleDelete(row: PricingRow) {
    const size = sizes.find((s) => s.label === row.label && s.material === row.material);
    if (size && confirm(`Excluir tamanho ${row.label} ${row.material}?`)) {
      rafiaSizeService.softDelete(size.id).then(loadData);
    }
  }

  async function handleSeed() {
    if (!confirm('Carregar tamanhos padrão? Isso adicionará os tamanhos pré-configurados.')) return;
    setSeeding(true);
    try {
      await rafiaSizeService.bulkCreate(DEFAULT_RAFIA_SIZES);
      await loadData();
    } finally {
      setSeeding(false);
    }
  }

  function handleSaveSize(data: Omit<RafiaSize, 'id' | 'createdAt' | 'updatedAt'>) {
    const promise = editingSize
      ? rafiaSizeService.update(editingSize.id, data)
      : rafiaSizeService.create(data);

    promise.then(() => {
      setModalOpen(false);
      setEditingSize(null);
      loadData();
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TableProperties className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            Tabela de Preços
          </h1>
          <p className="text-sm text-slate-500">
            Todos os tamanhos e preços por faixa de quantidade.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {sizes.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportPricingTablePdf(table.bands)}
                className="gap-1.5"
                title="Exportar PDF"
              >
                <FileDown className="w-4 h-4" /> <span className="hidden lg:inline">PDF</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportPricingTableExcel(table.bands)}
                className="gap-1.5"
                title="Exportar Excel"
              >
                <FileSpreadsheet className="w-4 h-4" /> <span className="hidden lg:inline">Excel</span>
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingSize(null);
              setModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Adicionar</span>
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {sizes.length === 0 ? (
        <Card className="p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhum tamanho cadastrado</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Cadastre os tamanhos de saco ou carregue os tamanhos padrão para começar a visualizar a tabela de preços.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={handleSeed} disabled={seeding} className="gap-2">
              <Upload className="w-4 h-4" />
              {seeding ? 'Carregando...' : 'Carregar Tamanhos Padrão'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingSize(null);
                setModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Manualmente
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tamanho ou material..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Tier tabs with table/cards */}
          <TierTabs
            bands={filteredTable.bands}
            activeBand={activeBand}
            onBandChange={setActiveBand}
            renderContent={(rows, band) => (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <PricingTableDesktop
                    rows={rows}
                    band={band}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
                {/* Mobile cards */}
                <div className="md:hidden">
                  <PricingCardMobile
                    rows={rows}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              </>
            )}
          />

          {/* Info footer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span>Preço Ráfia/kg: <b>R$ {config.rafiaPricePerKg.toFixed(2)}</b></span>
              <span>Corte: <b>R$ {config.cutCost.toFixed(2)}</b></span>
              <span>Impressão/lado: <b>R$ {config.printCostPerSide.toFixed(3)}</b></span>
              <span>Imposto NF: <b>{((1 - config.taxFactor) * 100).toFixed(1)}%</b></span>
            </div>
          </div>
        </>
      )}

      {/* Size form modal */}
      <SizeFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSize(null);
        }}
        onSave={handleSaveSize}
        initialData={editingSize ?? undefined}
        existingLabels={sizes.map((s) => s.label)}
        nextOrder={sizes.length + 1}
      />
    </div>
  );
}
