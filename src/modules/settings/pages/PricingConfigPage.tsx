import { TrendingUp } from 'lucide-react';
import { PricingParamsForm } from '../components/PricingParamsForm';

export function PricingConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          Configurar Preços
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Ajuste aqui os parâmetros que podem mudar: preço do PP (ráfia), custos de costura, corte, impressão e imposto.
          Toda alteração passa a valer na Calculadora e na Tabela de Preços.
        </p>
      </div>

      <PricingParamsForm />
    </div>
  );
}
