import { useState, useEffect } from 'react';
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
import { orderService } from '../../orders/services/orderService';
import { getInventoryItems } from '../../inventory/services/inventoryService';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function DashboardPage() {
  const [orders, setOrders] = useState<{ total: number; pending: number; totalAmount: number }>({ total: 0, pending: 0, totalAmount: 0 });
  const [criticalCount, setCriticalCount] = useState(0);
  const [inventoryAlerts, setInventoryAlerts] = useState<Array<{ item: string; stock: string; min: string; status: 'critical' | 'warning' }>>([]);
  const [chartData, setChartData] = useState<Array<{ name: string; vendas: number }>>([]);

  useEffect(() => {
    orderService.getOrders().then((list) => {
      const pending = list.filter((o) => o.status === 'pending' || o.status === 'production').length;
      const totalAmount = list.reduce((acc, o) => acc + (o.totalAmount ?? 0), 0);
      setOrders({ total: list.length, pending, totalAmount });
      setChartData([]);
    });
    getInventoryItems().then((items) => {
      setCriticalCount(items.filter((i) => i.minQuantity > 0 && i.quantity <= i.minQuantity).length);
      const alerts = items
        .filter((i) => i.minQuantity > 0 && i.quantity <= i.minQuantity)
        .map((i) => ({
          item: i.name ?? i.id,
          stock: `${i.quantity} ${i.unit}`,
          min: `${i.minQuantity} ${i.unit}`,
          status: (i.quantity <= i.minQuantity * 0.5 ? 'critical' : 'warning') as 'critical' | 'warning',
        }));
      setInventoryAlerts(alerts);
    });
  }, []);

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
          title="Faturamento (Pedidos)" 
          value={orders.totalAmount > 0 ? `R$ ${orders.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'} 
          change="" 
          isPositive={true} 
          icon={TrendingUp} 
          color="emerald"
        />
        <StatCard 
          title="Pedidos em Aberto" 
          value={String(orders.pending)} 
          change={orders.total > 0 ? `${orders.total} total` : ''} 
          isPositive={false} 
          icon={ShoppingCart} 
          color="blue"
        />
        <StatCard 
          title="Margem Média" 
          value="—" 
          change="" 
          isPositive={true} 
          icon={BarChart3} 
          color="amber"
        />
        <StatCard 
          title="Estoque Crítico" 
          value={`${criticalCount} itens`} 
          change={criticalCount > 0 ? 'Atenção' : ''} 
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
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="vendas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVendas)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sem dados de vendas no período.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Mix de Produtos</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <p className="text-slate-400 text-sm">Sem dados de mix. Integre pedidos ou produção para exibir.</p>
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
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Nenhuma ordem de produção em andamento. Os dados virão do módulo de produção quando integrado.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-6">Alertas de Estoque</h3>
          <div className="space-y-4">
            {inventoryAlerts.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">Nenhum alerta de estoque. Itens abaixo do mínimo aparecerão aqui.</p>
            ) : (
            inventoryAlerts.map((alert, i) => (
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
            ))
            )}
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
