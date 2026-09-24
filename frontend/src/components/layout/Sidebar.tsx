import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Receipt,
  Wallet,
  Tags,
  CreditCard,
  Banknote,
  PieChart,
  BarChart3,
  Users,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import logo from '../../assets/logos/smash-and-stack.jpg';
import { cn } from '../../utils/cn';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/permissions';
import { SidebarNavSkeleton } from '../common/LoadingSpinner';

const NAV = [
  {
    label: 'Dashboard',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_READ }],
  },
  {
    label: 'Management',
    items: [
      { to: '/stores', label: 'Stores', icon: Store, permission: PERMISSIONS.STORES_READ },
      { to: '/sales', label: 'Sales Income', icon: Receipt, permission: PERMISSIONS.SALES_READ },
      { to: '/expenses', label: 'Expenses', icon: Wallet, permission: PERMISSIONS.EXPENSES_READ },
      { to: '/expense-categories', label: 'Expense Category', icon: Tags, permission: PERMISSIONS.EXPENSES_READ },
      { to: '/payment-methods', label: 'Payment Method', icon: CreditCard, permission: PERMISSIONS.EXPENSES_READ },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/profit-loss', label: 'Profit & Loss', icon: PieChart, permission: PERMISSIONS.REPORTS_READ },
      { to: '/reports', label: 'Reports', icon: BarChart3, permission: PERMISSIONS.REPORTS_READ },
      { to: '/tender-types', label: 'Tender Types', icon: Banknote, permission: PERMISSIONS.REPORTS_READ },
    ],
  },
  {
    label: 'Team',
    items: [
      { to: '/users', label: 'Users', icon: Users, permission: PERMISSIONS.USERS_READ },
      { to: '/roles', label: 'Roles & Permissions', icon: Shield, permission: PERMISSIONS.ROLES_READ },
    ],
  },
  {
    label: 'System',
    items: [{ to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.SETTINGS_READ }],
  },
];

export function Sidebar({
  collapsed,
  onToggle,
  mobile = false,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}) {
  const { can, isSuperAdmin, user } = usePermissions();

  return (
    <div
      className={cn(
        'sticky top-0 z-30 h-screen shrink-0',
        mobile ? 'block' : 'hidden lg:block',
        collapsed ? 'w-[88px]' : 'w-[268px]'
      )}
    >
      <aside
        className={cn(
          'relative flex h-full flex-col overflow-hidden border-r border-ink-900/10 bg-white text-ink-900 transition-all duration-300',
          collapsed ? 'w-[88px]' : 'w-[268px]'
        )}
      >
        <div className="flex items-center gap-3 bg-brand-red px-4 py-4 text-white">
          <img src={logo} alt="Smash & Stack" className="h-12 w-12 rounded-md bg-white object-contain p-0.5" />
          {!collapsed ? (
            <div>
              <p className="text-lg font-normal leading-none">Smash & Stack</p>
              <p className="mt-1 text-[11px] font-normal text-white/80">Burgers N More</p>
            </div>
          ) : null}
        </div>

        <nav className="sidebar-scroll flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {!user ? (
            <SidebarNavSkeleton collapsed={collapsed} />
          ) : (
            NAV.map((group) => {
              if (group.label === 'Team' && !isSuperAdmin) return null;
              const items = group.items.filter((item) => can(item.permission));
              if (!items.length) return null;
              return (
                <div key={group.label}>
                  {!collapsed ? (
                    <p className="mb-2 px-3 text-[11px] font-normal text-brand-blue">
                      {group.label}
                    </p>
                  ) : null}
                  <div className="space-y-1">
                    {items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-normal text-ink-800/70 transition hover:bg-cream-50 hover:text-ink-900',
                            isActive && 'bg-cream-50 text-brand-red shadow-[inset_4px_0_0_0_#2F6BFF]'
                          )
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed ? <span>{item.label}</span> : null}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </nav>
      </aside>

      {!mobile ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
          title={collapsed ? 'Open sidebar' : 'Close sidebar'}
          className="absolute -right-3 top-[92px] z-40 flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-blue bg-white text-brand-blue shadow-md transition hover:bg-brand-blue hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      ) : null}
    </div>
  );
}
