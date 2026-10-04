import React from 'react';
import { Truck, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BannerProps {
  onBrowseClick: () => void;
}

export const Banner: React.FC<BannerProps> = ({ onBrowseClick }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl overflow-hidden shadow-sm relative my-4 sm:my-6">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-5 py-7 sm:py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            {t(
              'Shanghai Namutong • সরাসরি চীন থেকে পাইকারি ও বাল্ক ইমপোর্ট',
              'Shanghai Namutong • Direct China Wholesale & Bulk Import'
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2 sm:mb-3">
            {t('চীন থেকে বিশ্বস্ত পাইকারি পণ্য, ', 'Direct Factory Wholesale from China, ')}
            <br className="hidden sm:inline" />
            <span className="text-emerald-400">
              {t('সারা বাংলাদেশে সরাসরি দ্রুত সরবরাহ', 'Fast Supply Across Bangladesh')}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mb-5 leading-relaxed">
            {t(
              'ইলেকট্রনিক্স, পোশাক, জুতা, খেলনা ও হোম কিচেন পণ্য সরাসরি ফ্যাক্টরি পাইকারি মূল্যে। সহজ ও নির্ভরযোগ্য পেমেন্টে নিশ্চিন্তে অর্ডার করুন।',
              'Electronics, clothing, shoes, toys & kitchen goods at direct factory wholesale prices. Seamless ordering & safe payments nationwide.'
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              id="banner-shop-now-btn"
              onClick={onBrowseClick}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-lg text-sm shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {t('সব পণ্য দেখুন (Shop Now)', 'Shop All Products')}
            </button>
            <div className="text-xs text-gray-300 font-medium py-1 px-2.5 rounded-md bg-white/10">
              {t('⚡ ২ - ৪ দিনে দ্রুত ডেলিভারি', '⚡ Fast 2 - 4 Days Delivery')}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full md:w-auto grid grid-cols-3 md:grid-cols-1 gap-2 sm:gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {t('নিরাপদ পেমেন্ট', 'Secure Payment')}
              </div>
              <div className="text-[11px] text-gray-300 hidden sm:block">
                {t('bKash, Nagad ও Rocket', 'bKash, Nagad & Rocket')}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <span className="font-bold text-sm">৳</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {t('সেরা পাইকারি মূল্য ৳', 'Best Wholesale Price ৳')}
              </div>
              <div className="text-[11px] text-gray-300 hidden sm:block">
                {t('কোনো লুকানো চার্জ নেই', 'No Hidden Charges')}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {t('১০০% কোয়ালিটি চেক', '100% Quality Checked')}
              </div>
              <div className="text-[11px] text-gray-300 hidden sm:block">
                {t('যাচাইকৃত অরিজিনাল পণ্য', 'Verified Factory Goods')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
