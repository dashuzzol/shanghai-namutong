import React from 'react';
import { Search, Truck, Phone, X, Settings, ClipboardList, Package, LayoutDashboard, Layers, Globe } from 'lucide-react';
import { CategoryType, StoreSettings } from '../types';
import { getCategoryDisplayName } from '../utils/productUtils';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  onGoHome: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenAdmin?: () => void;
  onOpenAdminOrders?: () => void;
  onOpenAdminCategories?: () => void;
  onOpenAdminSettings?: () => void;
  settings?: StoreSettings;
  categories?: CategoryType[];
}

export const CATEGORIES: CategoryType[] = [
  'All Products',
  'Mobile & Electronics',
  'Clothing',
  'Shoes',
  'Kids & Toys',
  'Home & Kitchen',
  'Other Products',
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onGoHome,
  onOpenAdminDashboard,
  onOpenAdmin,
  onOpenAdminOrders,
  onOpenAdminCategories,
  onOpenAdminSettings,
  settings,
  categories: dynamicCategories,
}) => {
  const { language, setLanguage, isBangla, t } = useLanguage();
  const [logoError, setLogoError] = React.useState(false);
  const categoryList = dynamicCategories && dynamicCategories.length > 0
    ? (dynamicCategories.includes('All Products') ? dynamicCategories : ['All Products', ...dynamicCategories])
    : CATEGORIES;
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Utility Announcement Bar */}
      <div className="bg-emerald-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 font-medium">
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span>
              {t(
                'সারা বাংলাদেশে বিশ্বস্ত অনলাইন শপিং (bKash/Nagad/Rocket) | Direct China Import',
                'Trusted Wholesale & Online Shopping in BD (bKash/Nagad/Rocket) | Direct China Import'
              )}
            </span>
          </div>
          <div className="flex items-center gap-3 text-emerald-100 flex-wrap justify-center">
            {settings?.phoneNumber && (
              <a
                href={`tel:${settings.phoneNumber.replace(/\s+/g, '')}`}
                className="flex items-center gap-1 hover:text-white transition"
              >
                <Phone className="w-3 h-3" />
                {t('হটলাইন: ', 'Hotline: ')}{settings.phoneNumber}
              </a>
            )}

            {/* Quick Language Toggle in Topbar */}
            <div className="flex items-center bg-emerald-800/90 rounded-md p-0.5 border border-emerald-600/60 text-[11px]">
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition font-medium ${
                  isBangla ? 'bg-white text-emerald-900 font-bold' : 'text-emerald-100 hover:text-white'
                }`}
                title="বাংলা"
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition font-medium ${
                  !isBangla ? 'bg-white text-emerald-900 font-bold' : 'text-emerald-100 hover:text-white'
                }`}
                title="English"
              >
                English
              </button>
            </div>

            {onOpenAdminDashboard && (
              <button
                id="topbar-admin-dashboard-link"
                onClick={onOpenAdminDashboard}
                className="hover:text-white underline underline-offset-2 flex items-center gap-1 text-[11px] font-bold bg-emerald-800/90 hover:bg-emerald-900 px-2 py-0.5 rounded cursor-pointer transition"
              >
                <LayoutDashboard className="w-3 h-3 text-emerald-300" />
                Admin (/admin)
              </button>
            )}
            {onOpenAdminOrders && (
              <button
                id="topbar-admin-orders-link"
                onClick={onOpenAdminOrders}
                className="hover:text-white underline underline-offset-2 flex items-center gap-1 text-[11px] font-semibold bg-emerald-800/90 hover:bg-emerald-900 px-2 py-0.5 rounded cursor-pointer transition"
              >
                <ClipboardList className="w-3 h-3 text-emerald-300" />
                Orders
              </button>
            )}
            {onOpenAdmin && (
              <button
                id="topbar-admin-link"
                onClick={onOpenAdmin}
                className="hover:text-white underline underline-offset-2 flex items-center gap-1 text-[11px] font-medium cursor-pointer transition"
              >
                <Package className="w-3 h-3" />
                Products
              </button>
            )}
            {onOpenAdminCategories && (
              <button
                id="topbar-admin-categories-link"
                onClick={onOpenAdminCategories}
                className="hover:text-white underline underline-offset-2 flex items-center gap-1 text-[11px] font-medium cursor-pointer transition"
              >
                <Layers className="w-3 h-3 text-emerald-300" />
                Categories
              </button>
            )}
            {onOpenAdminSettings && (
              <button
                id="topbar-admin-settings-link"
                onClick={onOpenAdminSettings}
                className="hover:text-white underline underline-offset-2 flex items-center gap-1 text-[11px] font-medium cursor-pointer transition"
              >
                <Settings className="w-3 h-3" />
                Settings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Store Logo / Name */}
          <button
            id="store-logo-btn"
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-hidden cursor-pointer"
          >
            {settings?.storeLogo && !logoError ? (
              <img
                src={settings.storeLogo}
                alt={settings.storeName || 'Shanghai Namutong'}
                onError={() => setLogoError(true)}
                className="h-10 sm:h-12 max-w-[240px] sm:max-w-[320px] object-contain"
              />
            ) : (
              /* If no logo is uploaded, show a simple text-based store name */
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  {settings?.storeName ? settings.storeName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="font-extrabold text-base sm:text-lg text-gray-900 tracking-tight leading-tight flex items-center gap-1.5">
                    {settings?.storeName || 'Shanghai Namutong Int Trade Co. Ltd'}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium tracking-wide">
                    {t('সরাসরি পাইকারি ও চীন আমদানি বিডি', 'Direct Wholesale & Import BD')}
                  </div>
                </div>
              </div>
            )}
          </button>

          {/* Desktop & Tablet Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                id="search-input-desktop"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t(
                  'পণ্য খুঁজুন (যেমন: জুতা, ঘড়ি, চার্জার, ব্যাগ)...',
                  'Search products (e.g. shoes, watch, charger, bag)...'
                )}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons: Language Switcher & Admin */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Main Language Switcher */}
            <div
              id="language-switcher-pill"
              className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500 ml-1.5 mr-1 shrink-0" />
              <button
                id="lang-btn-bn"
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-2 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                  isBangla
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
                title="বাংলা ভাষা নির্বাচন করুন"
              >
                বাংলা
              </button>
              <button
                id="lang-btn-en"
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                  !isBangla
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
                title="Switch to English"
              >
                English
              </button>
            </div>

            {onOpenAdmin && (
              <button
                id="header-admin-btn"
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition cursor-pointer"
                title="Manage Products (/admin/products)"
              >
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 sm:hidden">
          <div className="relative w-full">
            <input
              id="search-input-mobile"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('পণ্য খুঁজুন (যেমন: জুতা, হেডফোন)...', 'Search products (e.g. shoes, headphone)...')}
              className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-hidden focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Menu */}
      <nav className="bg-gray-50/90 border-t border-gray-200 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 py-2 min-w-max">
          {categoryList.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`cat-tab-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => {
                  onSelectCategory(cat);
                  onGoHome();
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                {getCategoryDisplayName(cat, language)}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
