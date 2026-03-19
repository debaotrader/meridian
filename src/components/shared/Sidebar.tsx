'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Building2,
  Box,
  Zap,
  BarChart2,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Kanban', href: '/kanban', icon: <LayoutGrid size={18} /> },
  { label: 'Office 2D', href: '/office', icon: <Building2 size={18} /> },
  { label: 'Office 3D', href: '/office/3d', icon: <Box size={18} /> },
  { label: 'Vibe', href: '/vibe', icon: <Zap size={18} /> },
  { label: 'Analytics', href: '/analytics', icon: <BarChart2 size={18} /> },
  { label: 'Settings', href: '/settings', icon: <Settings size={18} /> },
];

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    item.href === '/kanban'
      ? pathname === '/kanban' || pathname === '/'
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 group relative',
        isActive
          ? 'bg-accent/10 text-accent'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r" />
      )}
      <span className={cn('shrink-0', isActive && 'text-accent')}>{item.icon}</span>
      {!collapsed && (
        <motion.span
          initial={false}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className="overflow-hidden whitespace-nowrap font-medium"
        >
          {item.label}
        </motion.span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  const pathname = usePathname();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Header */}
      <div className={cn('flex items-center h-14 px-3 border-b border-border-subtle shrink-0', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <span className="text-text-primary font-semibold tracking-tight">
            <span className="text-accent">M</span>eridian
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors hidden md:flex"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            size={16}
            className={cn('transition-transform duration-200', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-border-subtle">
          <p className="text-2xs text-text-muted">Meridian v0.1</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 56 : 220 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-surface-1 border-r border-border-subtle shrink-0 overflow-hidden h-screen sticky top-0"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-surface-1 border border-border-default text-text-secondary hover:text-text-primary"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[220px] bg-surface-1 border-r border-border-subtle md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded text-text-muted hover:text-text-primary"
              >
                <X size={16} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
