import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const data = [
  { name: 'Jan', vendas: 4000, margem: 2400 },
  { name: 'Fev', vendas: 3000, margem: 1398 },
  { name: 'Mar', vendas: 2000, margem: 9800 },
  { name: 'Abr', vendas: 2780, margem: 3908 },
  { name: 'Mai', vendas: 1890, margem: 4800 },
  { name: 'Jun', vendas: 2390, margem: 3800 },
];

const pieData = [
  { name: 'Saco Convencional', value: 400 },
  { name: 'Saco Laminado', value: 300 },
  { name: 'Saco Impresso', value: 300 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Executivo</h1>
          <p className="text-slate-500">Bem-vindo ao WillTech ERP. Aqui está o resumo da sua fábrica.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md">Hoje</button>
          <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors">Semana</button>
          <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors">Mês</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Faturamento Mensal" 
          value="R$ 452.890" 
          change="+12.5%" 
          isPositive={true} 
          icon={TrendingUp} 
          color="emerald"
        />
        <StatCard 
          title="Pedidos em Aberto" 
          value="24" 
          change="-2" 
          isPositive={false} 
          icon={ShoppingCart} 
          color="blue"
        />
        <StatCard 
          title="Margem Média" 
          value="18.4%" 
          change="+0.8%" 
          isPositive={true} 
          icon={BarChart3} 
          color="amber"
        />
        <StatCard 
          title="Estoque Crítico" 
          value="5 itens" 
          change="Atenção" 
          isPositive={false} 
          icon={AlertTriangle} 
          color="red"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Vendas por Período</h3>
            <select className="text-xs border-slate-200 rounded-md bg-slate-50 p-1 outline-none">
              <option>Últimos 6 meses</option>
              <option>Último ano</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="vendas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVendas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Mix de Produtos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Produção em Andamento</h3>
            <button className="text-xs text-emerald-600 font-medium hover:underline">Ver tudo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-medium">OP</th>
                  <th className="px-6 py-3 font-medium">Produto</th>
                  <th className="px-6 py-3 font-medium">Progresso</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: 'OP-1024', product: 'Saco Ráfia 50x70', progress: 75, status: 'Produção' },
                  { id: 'OP-1025', product: 'Saco Laminado 60x90', progress: 30, status: 'Início' },
                  { id: 'OP-1026', product: 'Saco Conv. 40x60', progress: 95, status: 'Finalizando' },
                  { id: 'OP-1027', product: 'Saco Impresso 50x80', progress: 0, status: 'Aguardando' },
                ].map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{op.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{op.product}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${op.progress}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        op.status === 'Produção' ? 'bg-blue-50 text-blue-600' :
                        op.status === 'Finalizando' ? 'bg-emerald-50 text-emerald-600' :
                        op.status === 'Início' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {op.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-6">Alertas de Estoque</h3>
          <div className="space-y-4">
            {[
              { item: 'Polipropileno Virgem', stock: '450kg', min: '1000kg', status: 'critical' },
              { item: 'Tinta Branca Ráfia', stock: '12un', min: '20un', status: 'warning' },
              { item: 'Linha de Costura 20/3', stock: '5un', min: '15un', status: 'critical' },
              { item: 'Solvente Especial', stock: '8L', min: '10L', status: 'warning' },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${alert.status === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{alert.item}</p>
                    <p className="text-xs text-slate-500">Mínimo: {alert.min}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${alert.status === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>{alert.stock}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Saldo Atual</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon: Icon, color }: any) {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
