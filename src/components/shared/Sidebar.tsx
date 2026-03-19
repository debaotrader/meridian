'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Box,
  Sparkles,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
} from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';

interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_KEYS: NavItem[] = [
  { key: 'kanban', href: '/kanban', icon: LayoutDashboard },
  { key: 'office', href: '/office', icon: Building2 },
  { key: 'office3d', href: '/office/3d', icon: Box },
  { key: 'vibe', href: '/vibe', icon: Sparkles },
  { key: 'analytics', href: '/analytics', icon: BarChart3 },
  { key: 'settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation('nav');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string): boolean => {
    if (href === '/kanban') return pathname === '/kanban' || pathname === '/';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className={clsx(
        'flex items-center h-13 px-4 border-b border-border-subtle',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-text-inverse text-xs font-bold">M</span>
        </div>
        {!collapsed && (
          <span className="font-display font-semibold text-sm text-text-primary truncate">
            Meridian
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_KEYS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-accent-subtle text-accent font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              )}
            >
              <Icon className={clsx('w-[18px] h-[18px] flex-shrink-0', active && 'text-accent')} />
              {!collapsed && (
                <span>{t(item.key)}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto badge badge-info text-[10px]">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Connection Status */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-border-subtle">
          <ConnectionStatus />
        </div>
      )}

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:block px-2 py-3 border-t border-border-subtle">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-2 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-surface-1 border border-border-default text-text-secondary hover:text-text-primary"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-surface-1 border-r border-border-default z-50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-text-tertiary hover:text-text-primary"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'hidden lg:block fixed left-0 top-0 bottom-0 bg-surface-1 border-r border-border-default z-30 transition-all duration-200',
          collapsed ? 'w-15' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}

export default Sidebar;
