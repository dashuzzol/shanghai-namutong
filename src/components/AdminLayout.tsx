import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ClipboardList,
  Settings,
  Store,
  Menu,
  X,
  ArrowLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { StoreSettings } from '../types';

export type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'settings';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  onBackToStore: () => void;
  onLogout?: () => void;
  pendingOrdersCount?: number;
  settings?: StoreSettings;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onNavigate,
  onBackToStore,
  onLogout,
  pendingOrdersCount = 0,
  settings,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    path: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      path: '/admin/products',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Layers,
      path: '/admin/categories',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ClipboardList,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      path: '/admin/orders',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
  };

  const storeName = settings?.storeName || 'China Direct BD';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-30 bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            id="admin-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              {storeName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight block leading-tight">
                {storeName}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onLogout && (
            <button
              id="admin-mobile-logout-btn"
              onClick={onLogout}
              className="flex items-center gap-1 text-xs font-semibold text-red-300 hover:text-white bg-red-950/60 hover:bg-red-900/80 px-2.5 py-1.5 rounded-lg border border-red-800/60 transition cursor-pointer"
              title="Log Out from Admin"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Logout</span>
            </button>
          )}

          <button
            id="admin-mobile-back-to-store"
            onClick={onBackToStore}
            className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Store</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Persistent & Mobile Slide Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out shrink-0 ${
          isMobileMenuOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {storeName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-white leading-snug break-words tracking-tight">
                {storeName}
              </h2>
              <div className="text-[11px] text-emerald-400 font-medium">
                Admin Control Center
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Links (Dashboard, Products, Categories, Orders, Settings) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Navigation Menu
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-emerald-700'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Logout & Back to Store */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          {onLogout && (
            <button
              id="admin-sidebar-logout-btn"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white text-xs font-bold transition border border-red-800/40 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Log Out</span>
            </button>
          )}

          <button
            id="sidebar-back-to-store"
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Back to Storefront</span>
          </button>
          <div className="text-[10px] text-center text-slate-400 pt-1">
            Online Payments & Verification
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
