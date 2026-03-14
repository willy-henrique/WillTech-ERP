import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  ShoppingBag,
  History,
  Edit2
} from 'lucide-react';
import { customerService } from '../services/customerService';
import { Customer } from '../types';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomer() {
      setLoading(true);
      try {
        // In a real app, we'd have a getCustomerById service
        const all = await customerService.getCustomers({});
        const found = all.find(c => c.id === id);
        setCustomer(found || null);
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-800">Cliente não encontrado</h2>
        <Button variant="ghost" onClick={() => navigate('/customers')} className="mt-4">
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/customers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Profile Card */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card>
            <CardContent className="pt-8 text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-3xl font-bold border-4 border-emerald-50 mx-auto mb-4">
                {customer.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
              <p className="text-sm text-slate-500 mb-4">{customer.document}</p>
              <Badge variant={customer.status === 'active' ? 'success' : 'default'}>
                {customer.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
              
              <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 text-left">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  (11) 98765-4321
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {customer.city}, {customer.state}
                </div>
              </div>
            </CardContent>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <Button variant="outline" className="w-full gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resumo Comercial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Total de Pedidos</span>
                <span className="font-bold text-slate-900">{customer.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Volume Total</span>
                <span className="font-bold text-slate-900">125.000 un</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Ticket Médio</span>
                <span className="font-bold text-slate-900">R$ 15.200,00</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details & History */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total Faturado" value="R$ 185.400" icon={CreditCard} color="emerald" />
            <StatCard title="Pedidos Ativos" value="3" icon={ShoppingBag} color="blue" />
            <StatCard title="Última Compra" value="12/03/2026" icon={History} color="slate" />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Histórico de Pedidos</CardTitle>
              <Button variant="ghost" size="sm">Ver todos</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-3">ID Pedido</th>
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3">Valor</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <OrderRow id="PED-2026-001" date="12/03/2026" value="R$ 12.500,00" status="Produção" />
                    <OrderRow id="PED-2026-002" date="05/03/2026" value="R$ 8.200,00" status="Entregue" />
                    <OrderRow id="PED-2025-985" date="20/02/2026" value="R$ 15.000,00" status="Entregue" />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    slate: 'bg-slate-50 text-slate-600',
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-black text-slate-800">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function OrderRow({ id, date, value, status }: any) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4 text-sm font-bold text-slate-900">{id}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{date}</td>
      <td className="px-6 py-4 text-sm font-medium text-slate-900">{value}</td>
      <td className="px-6 py-4">
        <Badge variant={status === 'Entregue' ? 'success' : 'info'}>{status}</Badge>
      </td>
    </tr>
  );
}
