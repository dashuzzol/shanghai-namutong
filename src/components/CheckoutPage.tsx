import React, { useState } from 'react';
import { CartItem, Order, StoreSettings, PaymentMethodOption } from '../types';
import { getProductPricing, getMinOrderQuantity } from '../utils/productUtils';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Phone,
  AlertCircle,
  Clock,
  CheckCircle2,
  Package,
  CreditCard,
  Building,
  Banknote,
  Smartphone,
} from 'lucide-react';

interface CheckoutPageProps {
  items: CartItem[];
  settings?: StoreSettings;
  onPlaceOrder: (order: Order) => void | Promise<void>;
  onBack: () => void;
  onContinueShopping?: () => void;
}

const POPULAR_DISTRICTS_BN = [
  'ঢাকা (Dhaka)',
  'চট্টগ্রাম (Chattogram)',
  'সিলেট (Sylhet)',
  'রাজশাহী (Rajshahi)',
  'খুলনা (Khulna)',
  'বরিশাল (Barishal)',
  'রংপুর (Rangpur)',
  'ময়মনসিংহ (Mymensingh)',
  'কুমিল্লা (Cumilla)',
  'গাজীপুর (Gazipur)',
  'নারায়ণগঞ্জ (Narayanganj)',
  'বগুড়া (Bogura)',
  'যশোর (Jessore)',
  "কক্সবাজার (Cox's Bazar)",
  'অন্যান্য জেলা (Other District)',
];

const POPULAR_DISTRICTS_EN = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cumilla',
  'Gazipur',
  'Narayanganj',
  'Bogura',
  'Jessore',
  "Cox's Bazar",
  'Other District',
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  settings,
  onPlaceOrder,
  onBack,
  onContinueShopping,
}) => {
  const { language, isBangla, t } = useLanguage();
  const districtList = isBangla ? POPULAR_DISTRICTS_BN : POPULAR_DISTRICTS_EN;
  const otherDistrictValue = isBangla ? 'অন্যান্য জেলা (Other District)' : 'Other District';

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [district, setDistrict] = useState(districtList[0]);
  const [customDistrict, setCustomDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption | ''>('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const pricing = getProductPricing(item.product);
    return sum + pricing.currentPrice * item.quantity;
  }, 0);

  const deliveryCharge = 0;
  const total = subtotal;
  const totalQuantities = items.reduce((sum, item) => sum + item.quantity, 0);

  const PAYMENT_METHODS = [
    {
      id: 'bKash' as PaymentMethodOption,
      name: t('বিকাশ (bKash)', 'bKash'),
      badge: t('মোবাইল ব্যাংকিং', 'Mobile Banking'),
      badgeColor: 'bg-[#D12053]/10 text-[#D12053] border border-[#D12053]/20',
      description: t(
        'বিকাশ পার্সোনাল বা মার্চেন্ট একাউন্ট। অর্ডার করার পর আমাদের টিম পেমেন্ট গ্রহণের জন্য কল করবে।',
        'bKash personal or merchant account. Our team will call you to complete payment.'
      ),
      icon: <Smartphone className="w-4 h-4 text-[#D12053]" />,
    },
    {
      id: 'Nagad' as PaymentMethodOption,
      name: t('নগদ (Nagad)', 'Nagad'),
      badge: t('মোবাইল ব্যাংকিং', 'Mobile Banking'),
      badgeColor: 'bg-[#F7931E]/10 text-[#D46B08] border border-[#F7931E]/20',
      description: t(
        'নগদ পার্সোনাল বা মার্চেন্ট একাউন্ট। অর্ডার করার পর আমাদের টিম পেমেন্ট গ্রহণের জন্য কল করবে।',
        'Nagad personal or merchant account. Our team will call you to complete payment.'
      ),
      icon: <Smartphone className="w-4 h-4 text-[#F7931E]" />,
    },
    {
      id: 'Bank Transfer' as PaymentMethodOption,
      name: t('ব্যাংক ট্রান্সফার (Bank Transfer)', 'Bank Transfer'),
      badge: t('ব্যাংক একাউন্ট', 'Bank Account'),
      badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
      description: t(
        'সরাসরি ব্যাংক ডিপোজিট বা ট্রান্সফার। অ্যাকাউন্ট নম্বর জানিয়ে আপনাকে কল করা হবে।',
        'Direct bank deposit or wire transfer. We will provide account details by phone.'
      ),
      icon: <Building className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'Cash Payment' as PaymentMethodOption,
      name: t('ক্যাশ পেমেন্ট (Direct Cash)', 'Direct Cash Payment'),
      badge: t('সরাসরি ক্যাশ', 'Direct Cash'),
      badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      description: t(
        'আমাদের অফিস বা শোরুমে সরাসরি ক্যাশ প্রদান (পাইকারি অর্ডার কনফার্মেশনের জন্য)।',
        'Direct cash at our office or upon order verification.'
      ),
      icon: <Banknote className="w-4 h-4 text-emerald-600" />,
    },
  ];

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xs">
          <p className="text-gray-800 font-bold text-lg mb-2">{t('কোনো পণ্য নির্বাচন করা হয়নি', 'No products selected')}</p>
          <p className="text-xs text-gray-500 mb-6">
            {t('অনুগ্রহ করে পছন্দের পণ্য নির্বাচন করে অর্ডার করুন বাটনে ক্লিক করুন।', 'Please browse products and click Order Now.')}
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {t('পণ্য দেখুন (Browse Products)', 'Browse Products')}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError(t('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।', 'Please enter your full name.'));
      return;
    }

    const cleanPhone = mobileNumber.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(t('অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)।', 'Please enter a valid phone number (e.g. 017xxxxxxxx).'));
      return;
    }

    const finalDistrict = district === otherDistrictValue || district.includes('Other')
      ? customDistrict.trim()
      : district;
    if (!finalDistrict) {
      setError(t('অনুগ্রহ করে আপনার জেলা উল্লেখ করুন।', 'Please specify your district.'));
      return;
    }

    if (!address.trim()) {
      setError(t('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।', 'Please enter your complete delivery address.'));
      return;
    }

    if (!paymentMethod) {
      setError(t('অর্ডার সম্পন্ন করতে অনুগ্রহ করে একটি পেমেন্ট মাধ্যম সিলেক্ট করুন।', 'Please select a payment method.'));
      return;
    }

    // Verify all items meet Minimum Order Quantity and Available Stock
    for (const item of items) {
      const minQty = getMinOrderQuantity(item.product);
      if (item.quantity < minQty) {
        setError(
          language === 'bn'
            ? `"${item.product.name}" পণ্যের জন্য ন্যূনতম অর্ডারের পরিমাণ ${minQty} টি।`
            : `Minimum order quantity is ${minQty} pieces.`
        );
        return;
      }
      if (item.quantity > item.product.stock) {
        setError(
          language === 'bn'
            ? `"${item.product.name}" পণ্যের জন্য বর্তমানে মাত্র ${item.product.stock} টি উপলব্ধ আছে।`
            : `Only ${item.product.stock} pieces are currently available.`
        );
        return;
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        setError(
          language === 'bn'
            ? 'অর্ডারের পরিমাণ একটি পূর্ণসংখ্যা হতে হবে।'
            : 'Quantity must always be a whole number.'
        );
        return;
      }
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `BD-${randomSuffix}`;

    const orderData: Order = {
      orderNumber,
      customerName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      district: finalDistrict,
      address: orderNotes.trim() ? `${address.trim()} (${t('নোট', 'Note')}: ${orderNotes.trim()})` : address.trim(),
      products: items.map((item) => {
        const pricing = getProductPricing(item.product);
        return {
          productId: item.product.id,
          name: item.product.name,
          price: pricing.currentPrice,
          quantity: item.quantity,
          image: item.product.image,
          selectedOptions: item.selectedOptions,
        };
      }),
      quantities: totalQuantities,
      subtotal,
      deliveryCharge,
      totalAmount: total,
      paymentMethod: paymentMethod,
      paymentStatus: 'Payment Pending',
      orderStatus: 'Payment Pending',
      orderDate: new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    // Re-enable the button if sending fails, so the customer can try again.
    Promise.resolve(onPlaceOrder(orderData)).finally(() => setIsSubmitting(false));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Header Back Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          id="checkout-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('← পণ্য তালিকায় ফিরুন', '← Back to Products')}</span>
        </button>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {t('অর্ডার চেকআউট', 'Order Checkout')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Customer Delivery Form */}
        <div className="lg:col-span-7">
          <form
            id="checkout-order-form"
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5"
          >
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                {t('পাইকারি অর্ডারের তথ্য (Wholesale Order)', 'Wholesale Order Information')}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {t(
                  'আপনার সঠিক তথ্য দিয়ে অর্ডার সম্পন্ন করুন। পেমেন্ট কনফার্মেশনের জন্য আমরা আপনাকে কল করব।',
                  'Please enter your accurate details. Our team will contact you to verify order & payment.'
                )}
              </p>
            </div>

            {error && (
              <div
                id="checkout-error-banner"
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('আপনার নাম (Full Name) *', 'Full Name *')}
                </label>
                <input
                  id="checkout-input-name"
                  type="text"
                  required
                  placeholder={t('যেমন: তানভীর আহমেদ', 'e.g. Tanvir Ahmed')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('মোবাইল নম্বর (Mobile Number) *', 'Mobile Number *')}
                </label>
                <div className="relative">
                  <input
                    id="checkout-input-phone"
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {t(
                    'এই নম্বরে কল করে আপনার পাইকারি অর্ডার ও পেমেন্ট নিশ্চিত করা হবে।',
                    'We will call this number to confirm your order and payment details.'
                  )}
                </p>
              </div>

              {/* District & Location */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('জেলা (District) *', 'District *')}
                </label>
                <select
                  id="checkout-select-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                >
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {(district === otherDistrictValue || district.includes('Other')) && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('জেলার নাম লিখুন (District Name) *', 'Specify District Name *')}
                  </label>
                  <input
                    id="checkout-input-custom-district"
                    type="text"
                    required
                    placeholder={t('আপনার জেলার নাম লিখুন', 'Enter your district name')}
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 transition"
                  />
                </div>
              )}

              {/* Detailed Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('সম্পূর্ণ ডেলিভারি ঠিকানা (Full Address) *', 'Full Delivery Address *')}
                </label>
                <textarea
                  id="checkout-input-address"
                  required
                  rows={3}
                  placeholder={t(
                    'বাসা/দোকান নম্বর, রোড/সেক্টর, থানা, এলাকা ও পরিচিত ল্যান্ডমার্ক...',
                    'Shop/House number, road/sector, thana, area, nearby landmark...'
                  )}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('অর্ডার নোট / বিশেষ নির্দেশনা (ঐচ্ছিক)', 'Order Notes (Optional)')}
                </label>
                <input
                  id="checkout-input-notes"
                  type="text"
                  placeholder={t('ডেলিভারি বা যোগাযোগের জন্য বিশেষ কোনো তথ্য থাকলে লিখুন', 'Any special delivery instructions...')}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 transition"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                  {t('পেমেন্ট পদ্ধতি (Payment Method) *', 'Payment Method *')}
                </label>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {paymentMethod
                    ? `${t('নির্বাচিত:', 'Selected:')} ${paymentMethod}`
                    : t('একটি মাধ্যম বেছে নিন', 'Choose one')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.map((opt) => {
                  const isSelected = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      id={`payment-method-${opt.id.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => {
                        setPaymentMethod(opt.id);
                        if (error && (error.includes('পেমেন্ট') || error.includes('payment'))) {
                          setError('');
                        }
                      }}
                      className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex items-start gap-3 relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                            isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <div className="flex items-center gap-1.5">
                            {opt.icon}
                            <span className="text-xs font-bold text-gray-900">{opt.name}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${opt.badgeColor}`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-snug">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Clarification note */}
              <p className="text-[11px] text-gray-500 italic">
                {t(
                  '* এখনই কোনো ট্রানজেকশন আইডি বা ওটিপি দিতে হবে না। অর্ডার প্লেস করার পর আমরা কল করে পেমেন্ট সম্পন্ন করতে সাহায্য করব।',
                  '* No transaction ID or OTP is required right now. We will call you to facilitate the payment after placing the order.'
                )}
              </p>
            </div>

            {/* Wholesale Payment Process Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-amber-950">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{t('পেমেন্ট প্রক্রিয়া কিভাবে কাজ করে', 'How Payment Processing Works')}</span>
              </div>
              <p className="leading-relaxed">
                {isBangla ? (
                  <>
                    ১. উপরে আপনার পছন্দের পেমেন্ট মাধ্যম বেছে নিয়ে অর্ডার নিশ্চিত করুন।<br />
                    ২. আপনার অর্ডারটি <strong>Payment Pending</strong> স্ট্যাটাসে গৃহীত হবে।<br />
                    ৩. আমাদের সেলস প্রতিনিধি আপনাকে ফোনে কল করে পেমেন্ট যাচাই করবেন এবং পণ্য ডেলিভারির ব্যবস্থা করবেন।
                  </>
                ) : (
                  <>
                    1. Select your preferred payment method above and confirm order.<br />
                    2. Your order will be placed with <strong>Payment Pending</strong> status.<br />
                    3. Our sales representative will call your phone to verify payment and dispatch your package.
                  </>
                )}
              </p>
            </div>

            <button
              id="checkout-btn-place-order"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>
                {isSubmitting
                  ? t('অর্ডার প্রসেস হচ্ছে...', 'Processing Order...')
                  : t(`অর্ডার নিশ্চিত করুন (৳${total.toLocaleString('en-US')})`, `Confirm Order (৳${total.toLocaleString('en-US')})`)}
              </span>
            </button>
          </form>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">
                {t(`অর্ডার সারাংশ (${totalQuantities} টি পিস)`, `Order Summary (${totalQuantities} pcs)`)}
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                {t(`${items.length} টি পণ্য`, `${items.length} items`)}
              </span>
            </div>

            {/* Products List */}
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => {
                const pricing = getProductPricing(item.product);
                const minQty = getMinOrderQuantity(item.product);
                return (
                  <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 truncate">{item.product.name}</div>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-0.5">
                            {Object.entries(item.selectedOptions).map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.2 rounded border border-emerald-200"
                              >
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-gray-600 text-[11px] mt-0.5 space-y-0.5">
                          <div>
                            {t('হিসাব: ', 'Calc: ')}
                            <span className="font-semibold text-gray-800">৳{pricing.currentPrice.toLocaleString('en-US')} × {item.quantity}</span>
                            {' = '}
                            <strong className="text-emerald-800 font-bold">৳{(pricing.currentPrice * item.quantity).toLocaleString('en-US')}</strong>
                          </div>
                          <div className="text-amber-800 font-medium">
                            {t('ন্যূনতম অর্ডার (MOQ):', 'Minimum Order (MOQ):')} {minQty} {t('টি', 'pieces')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 shrink-0 text-sm">
                      ৳{(pricing.currentPrice * item.quantity).toLocaleString('en-US')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Calculation */}
            <div className="border-t border-gray-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{t('সাবটোটাল:', 'Subtotal:')}</span>
                <span className="font-bold text-gray-900">৳{subtotal.toLocaleString('en-US')}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-base font-extrabold text-gray-900">
                <span>{t('সর্বমোট মূল্য:', 'Total Amount:')}</span>
                <span className="text-emerald-700 text-lg">৳{total.toLocaleString('en-US')}</span>
              </div>
            </div>

            {/* Phone support notice */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2.5 text-xs text-gray-600">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {t('যেকোনো তথ্যে কল করুন: ', 'Call us anytime: ')}
                <strong>{settings?.phoneNumber || '+880 1700-123456'}</strong>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
