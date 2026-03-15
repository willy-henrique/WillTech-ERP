import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Calculator,
  ShoppingCart,
  Factory,
  Database,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  TableProperties,
  X,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { MODULES } from '../../lib/permissions';

const pathIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '/dashboard': LayoutDashboard,
  '/customers': Users,
  '/products': Package,
  '/materials': Layers,
  '/pricing/table': TableProperties,
  '/pricing': Calculator,
  '/configurar-precos': TrendingUp,
  '/orders': ShoppingCart,
  '/inventory': Database,
  '/finance': DollarSign,
  '/settings': Settings,
  '/admin': Shield,
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, setIsOpen, isMobile }: SidebarProps) {
  const { allowedModules } = useAuth();
  const menuItems = MODULES.filter((m) => allowedModules.includes(m.id)).map((mod) => ({
    icon: pathIcons[mod.path] ?? Settings,
    label: mod.label,
    path: mod.path,
  }));

  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
        {/* Drawer */}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:hidden',
            isOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                <Factory className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                WillTech <span className="text-emerald-500">ERP</span>
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                      : 'hover:bg-slate-800 hover:text-white',
                  )
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      </>
    );
  }

  return (
    <aside
      className={clsx(
        'hidden md:flex bg-slate-900 text-slate-300 flex-col transition-all duration-300 ease-in-out border-r border-slate-800 relative z-20',
        isOpen ? 'w-64' : 'w-20',
      )}
    >
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <Factory className="text-white w-5 h-5" />
          </div>
          {isOpen && (
            <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">
              WillTech <span className="text-emerald-500">ERP</span>
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'hover:bg-slate-800 hover:text-white',
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0 transition-colors group-hover:text-emerald-400" />
            {isOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            {!isOpen && (
              <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 flex items-center justify-center border-t border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </aside>
  );
}
