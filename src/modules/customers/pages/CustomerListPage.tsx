import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { customerService } from '../services/customerService';
import { Customer, CustomerFilters } from '../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '../../../components/ui/Table';

export function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CustomerFilters>({ search: '', status: '' });

  useEffect(() => {
    loadCustomers();
  }, [filters]);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await customerService.getCustomers(filters);
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500">Gerencie a base de clientes e parceiros comerciais.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CNPJ ou email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          >
            <option value="">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="blocked">Bloqueados</option>
          </select>
          <Button variant="outline" size="sm" className="p-2">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="p-2">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Table Area */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={6}>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                  Nenhum cliente encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{customer.document}</TableCell>
                  <TableCell>{customer.city} - {customer.state}</TableCell>
                  <TableCell>
                    <Badge variant={
                      customer.status === 'active' ? 'success' : 
                      customer.status === 'inactive' ? 'default' : 'danger'
                    }>
                      {customer.status === 'active' ? 'Ativo' : 
                       customer.status === 'inactive' ? 'Inativo' : 'Bloqueado'}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm" className="p-1.5 h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="p-1.5 h-8 w-8 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1.5 h-8 w-8 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Mostrando <span className="font-medium text-slate-700">{customers.length}</span> de <span className="font-medium text-slate-700">{customers.length}</span> clientes
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="p-1 h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" className="h-8 w-8 p-0">1</Button>
            <Button variant="outline" size="sm" className="p-1 h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
