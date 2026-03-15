import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Shield, Sliders, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { queryAuditLogs } from '../services/auditService';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import { PricingParamsForm } from '../components/PricingParamsForm';
import type { AuditLogEntry } from '../services/auditService';

type TabId = 'profile' | 'params' | 'audit';

export function SettingsPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam === 'params' ? 'params' : tabParam === 'audit' ? 'audit' : 'profile',
  );
  const { user } = useAuth();

  useEffect(() => {
    if (tabParam === 'params') setActiveTab('params');
    if (tabParam === 'audit') setActiveTab('audit');
  }, [tabParam]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500">Gerencie preferências do sistema e parâmetros globais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-1 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          <SettingsTab icon={User} label="Perfil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SettingsTab icon={Shield} label="Segurança" active={false} onClick={() => setActiveTab('profile')} />
          <SettingsTab icon={Sliders} label="Precificação" active={activeTab === 'params'} onClick={() => setActiveTab('params')} />
          <SettingsTab icon={FileText} label="Auditoria" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'params' && <ParamsTab />}
          {activeTab === 'audit' && <AuditTab />}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof User;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left whitespace-nowrap ${
        active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
      {label}
    </button>
  );
}

function ProfileTab({ user }: { user: { email?: string | null; displayName?: string | null } | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xl md:text-2xl font-bold border-2 border-emerald-200">
            {(user?.displayName || user?.email?.[0] || 'U').toString().toUpperCase()}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <p className="text-sm text-slate-800">{user?.email ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
            <p className="text-sm text-slate-800">{user?.displayName ?? '—'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ParamsTab() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm text-slate-600">
          Use o módulo <strong>Configurar Preços</strong> para alterar custos e faixas que impactam a Calculadora e a Tabela de Preços.
        </p>
        <Link to="/configurar-precos">
          <Button variant="outline" size="sm" className="gap-2">
            Abrir Configurar Preços
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      <PricingParamsForm />
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuditTab
// ---------------------------------------------------------------------------

function AuditTab() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await queryAuditLogs({ limit: 50 });
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Card className="p-6">Carregando auditoria...</Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Auditoria</CardTitle>
        <p className="text-xs text-slate-500 mt-1">Últimas ações no sistema.</p>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead className="hidden md:table-cell">ID</TableHead>
              <TableHead>Usuário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-slate-500 text-sm">
                  Nenhum registro.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, i) => (
                <TableRow key={(log as { id?: string }).id ?? i}>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                    {typeof log.timestamp === 'number'
                      ? new Date(log.timestamp).toLocaleString('pt-BR')
                      : String(log.timestamp)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{log.action}</TableCell>
                  <TableCell className="text-sm">{log.entityType}</TableCell>
                  <TableCell className="text-sm text-slate-500 font-mono hidden md:table-cell">
                    {log.entityId?.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-sm">{log.userEmail ?? log.userId ?? '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
