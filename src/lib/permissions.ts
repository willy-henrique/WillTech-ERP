/**
 * Módulos do sistema e acesso por perfil (role).
 * Usado para controlar menu lateral e acesso às rotas.
 */

export type ModuleId =
  | 'dashboard'
  | 'customers'
  | 'products'
  | 'materials'
  | 'pricing-table'
  | 'pricing'
  | 'configurar-precos'
  | 'orders'
  | 'inventory'
  | 'finance'
  | 'settings'
  | 'admin';

export interface ModuleDef {
  id: ModuleId;
  path: string;
  label: string;
}

export const MODULES: ModuleDef[] = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard' },
  { id: 'customers', path: '/customers', label: 'Clientes' },
  { id: 'products', path: '/products', label: 'Produtos' },
  { id: 'materials', path: '/materials', label: 'Materiais' },
  { id: 'pricing-table', path: '/pricing/table', label: 'Tabela de Preços' },
  { id: 'pricing', path: '/pricing', label: 'Calculadora' },
  { id: 'configurar-precos', path: '/configurar-precos', label: 'Configurar Preços' },
  { id: 'orders', path: '/orders', label: 'Pedidos' },
  { id: 'inventory', path: '/inventory', label: 'Estoque' },
  { id: 'finance', path: '/finance', label: 'Financeiro' },
  { id: 'settings', path: '/settings', label: 'Configurações' },
  { id: 'admin', path: '/admin', label: 'Administração' },
];

/** Perfis que têm acesso total a todos os módulos do sistema. */
export const ADMIN_ROLES = ['administrador', 'admin'] as const;

function isAdminRole(role: string | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role.toLowerCase() as (typeof ADMIN_ROLES)[number]);
}

/** Módulos que cada perfil pode acessar. Administrador tem acesso a tudo. */
const ROLE_MODULE_ACCESS: Record<string, ModuleId[]> = {
  administrador: MODULES.map((m) => m.id),
  admin: MODULES.map((m) => m.id),
  comercial: [
    'dashboard',
    'customers',
    'products',
    'materials',
    'pricing-table',
    'pricing',
    'orders',
    'inventory',
    'finance',
    'settings',
  ],
  vendedor: [
    'dashboard',
    'customers',
    'products',
    'materials',
    'pricing-table',
    'pricing',
    'orders',
    'inventory',
    'finance',
    'settings',
  ],
  usuario: ['dashboard', 'customers', 'products', 'orders', 'inventory', 'settings'],
  user: ['dashboard', 'customers', 'products', 'orders', 'inventory', 'settings'],
};

/**
 * Retorna os IDs dos módulos permitidos para o perfil.
 * Administrador (admin/administrador) tem sempre acesso a todos os módulos.
 */
export function getAllowedModuleIds(role: string | null): ModuleId[] {
  if (!role) return [];
  if (isAdminRole(role)) return MODULES.map((m) => m.id);
  const lower = role.toLowerCase();
  return ROLE_MODULE_ACCESS[lower] ?? ROLE_MODULE_ACCESS['usuario'] ?? [];
}

export function canAccessModule(role: string | null, moduleId: ModuleId): boolean {
  return getAllowedModuleIds(role).includes(moduleId);
}

export function getModulesForRole(role: string): ModuleDef[] {
  const ids = getAllowedModuleIds(role);
  return MODULES.filter((m) => ids.includes(m.id));
}
