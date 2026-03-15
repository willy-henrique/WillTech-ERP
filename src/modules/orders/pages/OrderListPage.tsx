import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Clock, 
  Factory, 
  Truck, 
  CheckCircle2, 
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { clsx } from 'clsx';

export function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await orderService.getOrders();
        if (!cancelled) setOrders(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const productionCount = orders.filter((o) => o.status === 'production').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;

  const statusMap: Record<string, { label: string; icon: typeof Clock; variant: string }> = {
    pending: { label: 'Pendente', icon: Clock, variant: 'warning' },
    production: { label: 'Em Produção', icon: Factory, variant: 'info' },
    shipped: { label: 'Enviado', icon: Truck, variant: 'info' },
    delivered: { label: 'Entregue', icon: CheckCircle2, variant: 'success' },
    cancelled: { label: 'Cancelado', icon: XCircle, variant: 'danger' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos de Venda</h1>
          <p className="text-slate-500">Gestão de carteira e fluxo de entrega.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="Total Pedidos" value={String(orders.length)} color="blue" />
        <StatCard icon={Clock} label="Aguardando" value={String(pendingCount)} color="amber" />
        <StatCard icon={Factory} label="Em Produção" value={String(productionCount)} color="emerald" />
        <StatCard icon={Truck} label="Em Trânsito" value={String(shippedCount)} color="indigo" />
      </div>

      {/* List */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar pedido ou cliente..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros Avançados
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data Pedido</TableHead>
              <TableHead>Previsão Entrega</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="animate-pulse h-20 bg-slate-50/50"><TableCell colSpan={6}></TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                  Nenhum pedido de venda cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const status = statusMap[order.status];
                return (
                  <TableRow key={order.id} className="cursor-pointer">
                    <TableCell className="text-sm font-bold text-slate-900">{order.id}</TableCell>
                    <TableCell className="text-sm text-slate-700 font-medium">{order.customerName}</TableCell>
                    <TableCell className="text-sm text-slate-500">{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-sm text-slate-500">{new Date(order.deliveryDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-sm font-bold text-slate-900">R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant as any} className="gap-1.5">
                        <status.icon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <Card className="p-4 flex items-center gap-4">
      <div className={clsx("p-3 rounded-lg", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </Card>
  );
}
