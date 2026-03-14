import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Database,
  Save
} from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Gerencie preferências do sistema e parâmetros globais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-1">
          <SettingsTab icon={User} label="Perfil" active />
          <SettingsTab icon={Shield} label="Segurança & Permissões" />
          <SettingsTab icon={Bell} label="Notificações" />
          <SettingsTab icon={Globe} label="Regional" />
          <SettingsTab icon={Database} label="Integrações" />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Informações do Perfil</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl font-bold border-2 border-emerald-200">
                  HW
                </div>
                <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Alterar Foto</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                  <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" defaultValue="Henrique Willy" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                  <input type="email" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" defaultValue="henrique@agrorafia.com.br" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Cargo</label>
                  <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" defaultValue="Administrador" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                  <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" defaultValue="(11) 99999-9999" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm">
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Preferências do Sistema</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-slate-800">Modo Escuro</p>
                  <p className="text-xs text-slate-500">Alternar interface para cores escuras.</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-slate-800">Notificações por Email</p>
                  <p className="text-xs text-slate-500">Receber alertas de estoque crítico e novos pedidos.</p>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon: Icon, label, active }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
    }`}>
      <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
      {label}
    </button>
  );
}
