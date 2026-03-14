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

const salesData = [
  { month: 'Set', vendas: 320000, meta: 300000 },
  { month: 'Out', vendas: 350000, meta: 320000 },
  { month: 'Nov', vendas: 380000, meta: 350000 },
  { month: 'Dez', vendas: 420000, meta: 400000 },
  { month: 'Jan', vendas: 390000, meta: 410000 },
  { month: 'Fev', vendas: 450000, meta: 420000 },
];

export function ReportsPage() {
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
        <KpiCard title="Ticket Médio" value="R$ 12.450" change="+5.2%" icon={DollarSign} />
        <KpiCard title="Novos Clientes" value="12" change="+2" icon={Users} />
        <KpiCard title="Eficiência Produtiva" value="94.2%" change="+1.5%" icon={TrendingUp} />
        <KpiCard title="Volume Produzido" value="452k un" change="+12k" icon={Package} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Vendas vs Meta</h3>
          <div className="h-80 w-full">
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
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Evolução da Margem</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip />
                <Line type="monotone" dataKey="vendas" name="Margem %" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
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
