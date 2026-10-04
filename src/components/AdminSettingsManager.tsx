import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Settings,
  Package,
  ClipboardList,
  Save,
  Upload,
  Trash2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  FileText,
  Building2,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Eye,
  Globe
} from 'lucide-react';
import { StoreSettings, DEFAULT_STORE_SETTINGS } from '../types';

interface AdminSettingsManagerProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onNavigateToProducts: () => void;
  onNavigateToOrders: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToCategories?: () => void;
  onBackToStore: () => void;
  hideTopNav?: boolean;
}

export const AdminSettingsManager: React.FC<AdminSettingsManagerProps> = ({
  settings,
  onSaveSettings,
  onNavigateToProducts,
  onNavigateToOrders,
  onNavigateToDashboard,
  onNavigateToCategories,
  onBackToStore,
  hideTopNav = false,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [logoPreview, setLogoPreview] = useState<string>(settings.storeLogo || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Handle image upload with FileReader
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন (JPEG, PNG, WebP, SVG)');
      return;
    }

    // Limit to 2MB to keep localStorage healthy
    if (file.size > 2 * 1024 * 1024) {
      alert('ছবির সাইজ ২MB এর চেয়ে কম হতে হবে');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
      setFormData((prev) => ({ ...prev, storeLogo: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setFormData((prev) => ({ ...prev, storeLogo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset store settings to default?')) {
      setFormData({ ...DEFAULT_STORE_SETTINGS });
      setLogoPreview(DEFAULT_STORE_SETTINGS.storeLogo);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('Settings reset to default values');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleaned: StoreSettings = {
      storeName: formData.storeName.trim() || 'China Direct BD',
      storeLogo: formData.storeLogo.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      whatsAppNumber: formData.whatsAppNumber.trim(),
      email: formData.email.trim(),
      facebookPage: formData.facebookPage.trim(),
      storeAddress: formData.storeAddress.trim(),
      shortDescription: formData.shortDescription.trim(),
    };

    onSaveSettings(cleaned);
    setIsSubmitting(false);
    showToast('Store settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200 border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      {!hideTopNav && (
        <div className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                id="admin-settings-back-to-store"
                onClick={onBackToStore}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Store</span>
              </button>

              {/* Admin Tabs */}
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                {onNavigateToDashboard && (
                  <button
                    onClick={onNavigateToDashboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <span>Dashboard</span>
                  </button>
                )}
                <button
                  id="tab-admin-products-from-settings"
                  onClick={onNavigateToProducts}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Products</span>
                </button>

                <button
                  id="tab-admin-orders-from-settings"
                  onClick={onNavigateToOrders}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Orders</span>
                </button>

                <button
                  id="tab-admin-settings-active"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-emerald-600 text-white shadow-xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Store Settings</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-slate-400 hover:text-slate-200 text-xs font-medium px-2 py-1 flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Title Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Store Settings
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Manage your store name, logo, contact numbers, social links, and address.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToStore}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>View live store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Store Branding (Name & Logo) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Store Identity & Branding</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Configures the branding displayed in the header, footer, and browser title.
              </p>
            </div>

            {/* Store Name */}
            <div>
              <label htmlFor="setting-store-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                id="setting-store-name"
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g. China Direct BD"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Appears in Header, Footer, and page titles.
              </p>
            </div>

            {/* Store Logo & Live Preview */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Store Logo
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {/* Upload Controls */}
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                    id="setting-logo-upload-input"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Logo Image</span>
                    </button>

                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Logo</span>
                      </button>
                    )}
                  </div>

                  {/* Or enter Image URL */}
                  <div className="pt-1">
                    <label htmlFor="setting-logo-url" className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Or Image URL:
                    </label>
                    <input
                      id="setting-logo-url"
                      type="text"
                      value={formData.storeLogo}
                      onChange={(e) => {
                        setFormData({ ...formData, storeLogo: e.target.value });
                        setLogoPreview(e.target.value);
                      }}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition font-mono"
                    />
                  </div>

                  <p className="text-[11px] text-gray-500 leading-normal">
                    Supported: PNG, JPG, SVG, WebP. Recommended height: 40-50px with transparent background.
                  </p>
                </div>

                {/* Live Preview Box */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center min-h-[120px] text-center">
                  <div className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Header Preview</span>
                  </div>

                  {logoPreview ? (
                    <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-xs flex items-center justify-center max-w-full">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-10 max-w-[200px] object-contain"
                        onError={() => {
                          setLogoPreview('');
                        }}
                      />
                    </div>
                  ) : (
                    /* Fallback Text-based store name */
                    <div className="p-3 bg-white rounded-xl border border-dashed border-gray-300 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {formData.storeName ? formData.storeName.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="text-left">
                        <div className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight leading-tight">
                          {formData.storeName || 'China Direct BD'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          (Text-based logo active)
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-500 mt-2">
                    {logoPreview
                      ? 'Custom logo will appear in the Header.'
                      : 'No logo uploaded — a stylish text store name will be shown automatically.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Social Information */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Contact Details & Social Links</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Used to power the Call, WhatsApp, and Facebook buttons and footer info.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Number */}
              <div>
                <label htmlFor="setting-phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Phone Number</span>
                </label>
                <input
                  id="setting-phone"
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="e.g. +880 1700-123456"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Powers the "Call" contact button and Header hotline.
                </p>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label htmlFor="setting-whatsapp" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                  <span>WhatsApp Number</span>
                </label>
                <input
                  id="setting-whatsapp"
                  type="text"
                  value={formData.whatsAppNumber}
                  onChange={(e) => setFormData({ ...formData, whatsAppNumber: e.target.value })}
                  placeholder="e.g. +8801700123456 or 01700123456"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Powers the 1-click WhatsApp customer chat button.
                </p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="setting-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email Address</span>
                </label>
                <input
                  id="setting-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. support@chinadirectbd.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Displayed in Footer & contact info section.
                </p>
              </div>

              {/* Facebook Page */}
              <div>
                <label htmlFor="setting-facebook" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook Page Link</span>
                </label>
                <input
                  id="setting-facebook"
                  type="url"
                  value={formData.facebookPage}
                  onChange={(e) => setFormData({ ...formData, facebookPage: e.target.value })}
                  placeholder="e.g. https://facebook.com/chinadirectbd"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Powers the Facebook button in the store.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Location & Description */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Store Address & About Description</span>
              </h2>
            </div>

            {/* Store Address */}
            <div>
              <label htmlFor="setting-address" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Store Address</span>
              </label>
              <input
                id="setting-address"
                type="text"
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                placeholder="e.g. Motijheel Commercial Area, Dhaka-1000, Bangladesh"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Displayed in the Footer contact section.
              </p>
            </div>

            {/* Short Store Description */}
            <div>
              <label htmlFor="setting-description" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Short Store Description</span>
              </label>
              <textarea
                id="setting-description"
                rows={3}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="e.g. Your trusted online shopping destination in Bangladesh for directly imported gadgets, fashion, shoes, toys, and lifestyle goods from China."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition leading-relaxed"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Displayed in the Footer & about section.
              </p>
            </div>
          </div>

          {/* Action Bar with Save Settings Button */}
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500 text-center sm:text-left">
              Changes will instantly update across Header, Footer, and contact buttons.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onBackToStore}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="save-settings-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
