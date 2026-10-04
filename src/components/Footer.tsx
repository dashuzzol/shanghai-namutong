import React from 'react';
import { Truck, ShieldCheck, Phone, Mail, MapPin, MessageCircle, Facebook, ExternalLink } from 'lucide-react';
import { CategoryType, StoreSettings } from '../types';
import { getCategoryDisplayName } from '../utils/productUtils';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onSelectCategory: (category: CategoryType) => void;
  categories: CategoryType[];
  onOpenAdminDashboard?: () => void;
  onOpenAdmin?: () => void;
  onOpenAdminOrders?: () => void;
  onOpenAdminCategories?: () => void;
  onOpenAdminSettings?: () => void;
  settings?: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  categories,
  onOpenAdminDashboard,
  onOpenAdmin,
  onOpenAdminOrders,
  onOpenAdminCategories,
  onOpenAdminSettings,
  settings,
}) => {
  const { language, t } = useLanguage();
  const storeName = settings?.storeName || 'China Direct BD';
  const description =
    settings?.shortDescription ||
    (language === 'bn'
      ? 'চীন থেকে সরাসরি আমদানিকৃত সেরা কোয়ালিটির পাইকারি ও বাল্ক পণ্য—গ্যাজেট, ইলেকট্রনিক্স, পোশাক, জুতা ও কিচেন আইটেম সারা বাংলাদেশে দ্রুত ডেলিভারি।'
      : 'Direct wholesale imports from China — electronics, gadgets, apparel, footwear, and kitchenware delivered fast across Bangladesh.');
  const phoneNumber = settings?.phoneNumber || '+880 1700-123456';
  const email = settings?.email || 'support@chinadirectbd.com';
  const address = settings?.storeAddress || 'Motijheel Commercial Area, Dhaka-1000, Bangladesh';
  const whatsAppNumber = settings?.whatsAppNumber || '';
  const facebookPage = settings?.facebookPage || '';

  // Clean links
  const cleanPhone = phoneNumber ? phoneNumber.replace(/[^\d+]/g, '') : '';

  let cleanWhatsApp = whatsAppNumber ? whatsAppNumber.replace(/\D/g, '') : '';
  if (cleanWhatsApp.startsWith('01')) {
    cleanWhatsApp = '88' + cleanWhatsApp;
  }
  const whatsAppUrl = cleanWhatsApp ? `https://wa.me/${cleanWhatsApp}` : '';

  let fbUrl = facebookPage ? facebookPage.trim() : '';
  if (fbUrl && !fbUrl.startsWith('http://') && !fbUrl.startsWith('https://')) {
    fbUrl = 'https://' + fbUrl;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 border-t border-gray-800">
      {/* Service Highlights */}
      <div className="border-b border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/50 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{t('সারা বাংলাদেশে ডেলিভারি', 'Nationwide Delivery')}</div>
              <div className="text-xs text-gray-400">{t('৬৪ জেলায় দ্রুত হোম ডেলিভারি সুবিধা', 'Fast home delivery across 64 districts')}</div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/50 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{t('চীন থেকে সরাসরি আমদানি', 'Direct China Import')}</div>
              <div className="text-xs text-gray-400">{t('১০০% ফ্যাক্টরি চেক করা খাঁটি কোয়ালিটি', '100% factory inspected authentic quality')}</div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/50 text-emerald-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{t('গ্রাহক সহায়তা সেবা', 'Customer Support')}</div>
              <div className="text-xs text-gray-400">{t('প্রতিদিন সকাল ১০:০০ - রাত ১০:০০', 'Everyday 10:00 AM - 10:00 PM')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        {/* About */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {settings?.storeLogo ? (
              <img
                src={settings.storeLogo}
                alt={storeName}
                className="h-10 max-w-[220px] object-contain rounded bg-white/10 p-1"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                S
              </div>
            )}
            <span className="text-base font-bold text-white tracking-tight">
              {storeName}
            </span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            {description}
          </p>

          {/* Direct Contact Buttons in Footer */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {t('সরাসরি যোগাযোগ ও চ্যাট', 'Direct Contact & Chat')}
            </div>
            <div className="flex flex-wrap gap-2">
              {cleanPhone && (
                <a
                  id="footer-btn-call"
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('কল করুন', 'Call Us')}</span>
                </a>
              )}
              {whatsAppUrl && (
                <a
                  id="footer-btn-whatsapp"
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/90 hover:bg-[#25D366] text-white rounded-lg text-xs font-semibold transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>{t('হোয়াটসঅ্যাপ চ্যাট', 'WhatsApp Chat')}</span>
                </a>
              )}
              {fbUrl && (
                <a
                  id="footer-btn-facebook"
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2]/90 hover:bg-[#1877F2] text-white rounded-lg text-xs font-semibold transition"
                >
                  <Facebook className="w-3.5 h-3.5 fill-white" />
                  <span>{t('ফেসবুক পেজ', 'Facebook Page')}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-sm font-bold text-white mb-3">{t('পণ্যের ক্যাটাগরি', 'Product Categories')}</h4>
          <ul className="space-y-2">
            {categories
              .filter((c) => c !== 'All Products')
              .map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-gray-400 hover:text-emerald-400 transition cursor-pointer"
                  >
                    {getCategoryDisplayName(cat, language)}
                  </button>
                </li>
              ))}
          </ul>
        </div>

        {/* How to Buy / Policy */}
        <div>
          <h4 className="text-sm font-bold text-white mb-3">{t('অর্ডার করার নিয়ম', 'How to Order')}</h4>
          <ul className="space-y-2 text-gray-400">
            <li>{t('১. আপনার পছন্দের পণ্য বেছে নিন', '1. Select your desired product')}</li>
            <li>{t('২. "অর্ডার করুন" বাটনে চাপ দিন', '2. Click "Order Now"')}</li>
            <li>{t('৩. নাম, মোবাইল নম্বর ও ঠিকানা লিখুন', '3. Enter your name, phone & address')}</li>
            <li>{t('৪. পেমেন্ট মাধ্যম নির্বাচন করে অর্ডার কনফার্ম করুন', '4. Choose payment method and confirm order')}</li>
            <li className="text-emerald-400 font-semibold pt-1">
              {t('✓ পেমেন্ট ও অর্ডার নিশ্চিত করতে প্রতিনিধি কল করবে', '✓ Our team will call you to verify payment & order')}
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white mb-3">{t('যোগাযোগের ঠিকানা', 'Contact Information')}</h4>
          {address && (
            <div className="flex items-start gap-2 text-gray-400">
              <MapPin className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{address}</span>
            </div>
          )}
          {phoneNumber && (
            <div className="flex items-center gap-2 text-gray-400">
              <Phone className="w-4 h-4 shrink-0 text-emerald-400" />
              <a href={`tel:${cleanPhone}`} className="hover:text-emerald-400 transition">
                {phoneNumber}
              </a>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 text-gray-400">
              <Mail className="w-4 h-4 shrink-0 text-emerald-400" />
              <a href={`mailto:${email}`} className="hover:text-emerald-400 transition">
                {email}
              </a>
            </div>
          )}
          {facebookPage && (
            <div className="flex items-center gap-2 text-gray-400">
              <Facebook className="w-4 h-4 shrink-0 text-emerald-400" />
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition flex items-center gap-1"
              >
                <span>{t('ফেসবুক পেজ', 'Facebook Page')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Copyright & Admin Link */}
      <div className="border-t border-gray-800 py-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto text-[11px] text-gray-500">
        <div>
          © {new Date().getFullYear()} {storeName}. {t('সর্বস্বত্ব সংরক্ষিত। চীন সরাসরি আমদানিকৃত পণ্য শপ (বাংলাদেশ)।', 'All rights reserved. Direct China wholesale imports in Bangladesh.')}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {onOpenAdminDashboard && (
            <button
              id="footer-admin-dashboard-link"
              onClick={onOpenAdminDashboard}
              className="text-gray-400 hover:text-emerald-400 font-medium transition cursor-pointer underline underline-offset-2"
            >
              Admin: Dashboard (/admin)
            </button>
          )}
          {onOpenAdminOrders && (
            <button
              id="footer-admin-orders-link"
              onClick={onOpenAdminOrders}
              className="text-gray-400 hover:text-emerald-400 font-medium transition cursor-pointer underline underline-offset-2"
            >
              Admin: Orders (/admin/orders)
            </button>
          )}
          {onOpenAdminCategories && (
            <button
              id="footer-admin-categories-link"
              onClick={onOpenAdminCategories}
              className="text-gray-400 hover:text-emerald-400 font-medium transition cursor-pointer underline underline-offset-2"
            >
              Admin: Categories (/admin/categories)
            </button>
          )}
          {onOpenAdmin && (
            <button
              id="footer-admin-link"
              onClick={onOpenAdmin}
              className="text-gray-400 hover:text-emerald-400 font-medium transition cursor-pointer underline underline-offset-2"
            >
              Admin: Products (/admin/products)
            </button>
          )}
          {onOpenAdminSettings && (
            <button
              id="footer-admin-settings-link"
              onClick={onOpenAdminSettings}
              className="text-gray-400 hover:text-emerald-400 font-medium transition cursor-pointer underline underline-offset-2"
            >
              Admin: Settings (/admin/settings)
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

