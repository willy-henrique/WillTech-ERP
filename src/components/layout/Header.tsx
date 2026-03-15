import { useState } from 'react';
import { Menu, Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  administrador: 'Administrador',
  comercial: 'Comercial',
  pcp: 'PCP',
  estoque: 'Estoque',
  financeiro: 'Financeiro',
  gerencia: 'Gerência',
};

export function Header({ toggleSidebar }: HeaderProps) {
  const { user, role, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const roleLabel = role ? roleLabels[role] ?? role : '—';

  return (
    <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 md:hidden"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-64 lg:w-96 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar no sistema..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 relative">
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1" />

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-none">{displayName}</p>
              <p className="text-xs text-slate-500 mt-1">{roleLabel}</p>
            </div>
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-200 group-hover:border-emerald-500 transition-all overflow-hidden">
              <User className="w-5 h-5" />
            </div>
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-20">
                <button
                  onClick={() => { signOut(); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
