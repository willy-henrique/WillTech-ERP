import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  Users,
  Package,
  DollarSign
} from 'lucide-react';

export function ReportsPage() {
  const salesData: Array<{ month: string; vendas: number; meta: number }> = [];
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios Gerenciais</h1>
          <p className="text-slate-500">Análise de performance, vendas e indicadores industriais.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Últimos 6 meses
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Ticket Médio" value="—" change="" icon={DollarSign} />
        <KpiCard title="Novos Clientes" value="—" change="" icon={Users} />
        <KpiCard title="Eficiência Produtiva" value="—" change="" icon={TrendingUp} />
        <KpiCard title="Volume Produzido" value="—" change="" icon={Package} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Vendas vs Meta</h3>
          <div className="h-80 w-full flex items-center justify-center">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="vendas" name="Vendas Reais" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="meta" name="Meta Estipulada" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">Sem dados de vendas. Integre pedidos ou CRM para exibir gráficos.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Evolução da Margem</h3>
          <div className="h-80 w-full flex items-center justify-center">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip />
                  <Line type="monotone" dataKey="vendas" name="Margem %" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">Sem dados de margem.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, icon: Icon }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{change}</span>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-xl font-black text-slate-800 mt-1">{value}</p>
    </div>
  );
}
