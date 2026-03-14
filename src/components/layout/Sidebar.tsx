import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Calculator, 
  FileText, 
  ShoppingCart, 
  Factory, 
  Database, 
  DollarSign, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Clientes', path: '/customers' },
  { icon: Package, label: 'Produtos', path: '/products' },
  { icon: Layers, label: 'Materiais', path: '/materials' },
  { icon: Calculator, label: 'Precificação', path: '/pricing' },
  { icon: FileText, label: 'Orçamentos', path: '/quotations' },
  { icon: ShoppingCart, label: 'Pedidos', path: '/orders' },
  { icon: Factory, label: 'Produção', path: '/production' },
  { icon: Database, label: 'Estoque', path: '/inventory' },
  { icon: DollarSign, label: 'Financeiro', path: '/finance' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  return (
    <aside 
      className={clsx(
        "bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 relative z-20",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Factory className="text-white w-5 h-5" />
          </div>
          {isOpen && (
            <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">
              WillTech <span className="text-emerald-500">ERP</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              isActive 
                ? "bg-emerald-500/10 text-emerald-400 font-medium" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className={clsx(
              "w-5 h-5 flex-shrink-0 transition-colors",
              "group-hover:text-emerald-400"
            )} />
            {isOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            {!isOpen && (
              <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 flex items-center justify-center border-t border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </aside>
  );
}
