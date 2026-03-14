import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  CheckCircle,
  Clock,
  XCircle,
  ArrowRightLeft
} from 'lucide-react';
import { MOCK_QUOTATIONS } from '../mocks';
import { Quotation } from '../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { clsx } from 'clsx';

export function QuotationListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento
    setTimeout(() => {
      setQuotations(MOCK_QUOTATIONS);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orçamentos</h1>
          <p className="text-slate-500">Acompanhe propostas comerciais e conversões.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID / Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Margem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse h-16 bg-slate-50/50">
                  <TableCell colSpan={6}></TableCell>
                </TableRow>
              ))
            ) : (
              quotations.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded text-slate-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{q.id}</p>
                        <p className="text-xs text-slate-500">{new Date(q.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700 font-medium">
                    {q.customerName}
                  </TableCell>
                  <TableCell className="text-sm font-bold text-slate-900">
                    R$ {q.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <span className={clsx(
                      "text-xs font-bold",
                      q.margin >= 18 ? "text-emerald-600" : "text-amber-600"
                    )}>
                      {q.margin}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      q.status === 'approved' ? 'success' :
                      q.status === 'sent' ? 'info' :
                      q.status === 'rejected' ? 'danger' :
                      'default'
                    }>
                      {q.status === 'sent' ? 'Enviado' : 
                       q.status === 'approved' ? 'Aprovado' : 
                       q.status === 'rejected' ? 'Rejeitado' : 'Rascunho'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="p-1.5" title="Visualizar">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {q.status === 'approved' && (
                        <Button variant="ghost" size="sm" className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" title="Converter em Pedido">
                          <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="p-1.5">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
