import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Zap, Truck, ShieldCheck, RefreshCw, Minus, Plus, MessageCircle, Eye, AlertCircle, Package } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { getProductPricing, getMinOrderQuantity, getCategoryDisplayName } from '../utils/productUtils';
import { useLanguage } from '../context/LanguageContext';

interface ProductPageProps {
  product: Product;
  onBack: () => void;
  onOrderNow: (product: Product, quantity: number, selectedOptions?: Record<string, string>) => void;
  settings?: StoreSettings;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  onBack,
  onOrderNow,
  settings,
}) => {
  const { language, t } = useLanguage();
  const minQty = getMinOrderQuantity(product);
  const [quantity, setQuantity] = useState<number>(() => getMinOrderQuantity(product));
  const [quantityInput, setQuantityInput] = useState<string>(() => getMinOrderQuantity(product).toString());
  const [warningMsg, setWarningMsg] = useState('');
  const [imgError, setImgError] = useState(false);
  const pricing = getProductPricing(product);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      for (const opt of product.options) {
        if (opt.values && opt.values.length > 0) {
          init[opt.name] = opt.values[0];
        }
      }
    }
    return init;
  });

  // Sync quantity, input, and options if product changes
  useEffect(() => {
    const min = getMinOrderQuantity(product);
    setQuantity(min);
    setQuantityInput(min.toString());
    setWarningMsg('');

    const init: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      for (const opt of product.options) {
        if (opt.values && opt.values.length > 0) {
          init[opt.name] = opt.values[0];
        }
      }
    }
    setSelectedOptions(init);
  }, [product.id, product.minOrderQuantity, product.options]);

  const allImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      const list = [...product.images];
      if (product.image && !list.includes(product.image)) {
        list.unshift(product.image);
      }
      return list;
    }
    return product.image ? [product.image] : [];
  }, [product.image, product.images]);

  const [activeImage, setActiveImage] = useState<string>(product.image || allImages[0] || '');

  useEffect(() => {
    setActiveImage(product.image || allImages[0] || '');
    setImgError(false);
  }, [product.id, product.image, allImages]);

  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  let cleanWhatsApp = settings?.whatsAppNumber ? settings.whatsAppNumber.replace(/\D/g, '') : '';
  if (cleanWhatsApp.startsWith('01')) {
    cleanWhatsApp = '88' + cleanWhatsApp;
  }
  const whatsAppChatUrl = cleanWhatsApp
    ? `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
        `আসসালামু আলাইকুম! আমি "${product.name}" (মূল্য: ৳${pricing.currentPrice}) পণ্যটি সম্পর্কে বিস্তারিত জানতে চাচ্ছি এবং পাইকারি অর্ডার করতে আগ্রহী।`
      )}`
    : '';

  // Preset wholesale order quantity batches (e.g. 50, 100, 150, 200)
  const presetQuantities = useMemo(() => {
    const list: number[] = [];
    const multipliers = [1, 2, 3, 4, 5, 10];
    for (const m of multipliers) {
      const val = minQty * m;
      if (val <= product.stock && !list.includes(val)) {
        list.push(val);
      }
    }
    return list.slice(0, 5);
  }, [minQty, product.stock]);

  // Validation function enforcing whole numbers, minQty and stock
  const validateQuantity = (val: number) => {
    if (isNaN(val) || val < minQty) {
      setWarningMsg(
        language === 'bn'
          ? `ন্যূনতম অর্ডারের পরিমাণ ${minQty} টি। (Minimum order quantity is ${minQty} pieces.)`
          : `Minimum order quantity is ${minQty} pieces.`
      );
      return false;
    }
    if (val > product.stock) {
      setWarningMsg(
        language === 'bn'
          ? `বর্তমানে মাত্র ${product.stock} টি উপলব্ধ আছে। (Only ${product.stock} pieces are currently available.)`
          : `Only ${product.stock} pieces are currently available.`
      );
      return false;
    }
    setWarningMsg('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Quantity must always be a whole number
    const clean = e.target.value.replace(/[^\d]/g, '');
    setQuantityInput(clean);

    if (clean === '') {
      setWarningMsg(
        language === 'bn'
          ? `ন্যূনতম অর্ডারের পরিমাণ ${minQty} টি। (Minimum order quantity is ${minQty} pieces.)`
          : `Minimum order quantity is ${minQty} pieces.`
      );
      setQuantity(0);
      return;
    }

    const num = parseInt(clean, 10);
    setQuantity(num);
    validateQuantity(num);
  };

  const handleInputBlur = () => {
    let num = parseInt(quantityInput, 10);
    if (isNaN(num) || num < minQty) {
      const fallback = Math.min(minQty, Math.max(1, product.stock));
      setQuantity(fallback);
      setQuantityInput(fallback.toString());
      setWarningMsg(
        language === 'bn'
          ? `ন্যূনতম অর্ডারের পরিমাণ ${minQty} টি। (Minimum order quantity is ${minQty} pieces.)`
          : `Minimum order quantity is ${minQty} pieces.`
      );
      return;
    }
    if (num > product.stock) {
      num = product.stock;
      setQuantity(num);
      setQuantityInput(num.toString());
      setWarningMsg(
        language === 'bn'
          ? `বর্তমানে মাত্র ${product.stock} টি উপলব্ধ আছে। (Only ${product.stock} pieces are currently available.)`
          : `Only ${product.stock} pieces are currently available.`
      );
      return;
    }
    setQuantity(num);
    setQuantityInput(num.toString());
    validateQuantity(num);
  };

  const handleDecrease = () => {
    if (quantity <= minQty) {
      setWarningMsg(
        language === 'bn'
          ? `ন্যূনতম অর্ডারের পরিমাণ ${minQty} টি। (Minimum order quantity is ${minQty} pieces.)`
          : `Minimum order quantity is ${minQty} pieces.`
      );
      return;
    }
    const nextVal = Math.max(minQty, quantity - 1);
    setQuantity(nextVal);
    setQuantityInput(nextVal.toString());
    validateQuantity(nextVal);
  };

  const handleIncrease = () => {
    if (quantity >= product.stock) {
      setWarningMsg(
        language === 'bn'
          ? `বর্তমানে মাত্র ${product.stock} টি উপলব্ধ আছে। (Only ${product.stock} pieces are currently available.)`
          : `Only ${product.stock} pieces are currently available.`
      );
      return;
    }
    const nextVal = Math.min(product.stock, quantity + 1);
    setQuantity(nextVal);
    setQuantityInput(nextVal.toString());
    validateQuantity(nextVal);
  };

  const handleSelectPreset = (val: number) => {
    if (val > product.stock) {
      setWarningMsg(
        language === 'bn'
          ? `বর্তমানে মাত্র ${product.stock} টি উপলব্ধ আছে। (Only ${product.stock} pieces are currently available.)`
          : `Only ${product.stock} pieces are currently available.`
      );
      return;
    }
    setQuantity(val);
    setQuantityInput(val.toString());
    validateQuantity(val);
  };

  const handleOrderNow = () => {
    if (product.stock <= 0) {
      setWarningMsg(t('দুঃখিত, এই পণ্যটির স্টক বর্তমানে শেষ।', 'Sorry, this product is currently out of stock.'));
      return;
    }
    if (quantity < minQty) {
      setWarningMsg(
        language === 'bn'
          ? `ন্যূনতম অর্ডারের পরিমাণ ${minQty} টি। (Minimum order quantity is ${minQty} pieces.)`
          : `Minimum order quantity is ${minQty} pieces.`
      );
      return;
    }
    if (quantity > product.stock) {
      setWarningMsg(
        language === 'bn'
          ? `বর্তমানে মাত্র ${product.stock} টি উপলব্ধ আছে। (Only ${product.stock} pieces are currently available.)`
          : `Only ${product.stock} pieces are currently available.`
      );
      return;
    }
    onOrderNow(
      product,
      quantity,
      product.options && product.options.length > 0 ? selectedOptions : undefined
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-8">
      {/* Back Button */}
      <button
        id="btn-back-to-products"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-700 mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>{t('← সব পণ্যের তালিকায় ফিরুন', '← Back to Products')}</span>
      </button>

      {/* Main Product Container */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
          {/* Left Column: Large Product Image & Thumbnails */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-square w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-2xs">
              <img
                src={imgError ? fallbackImage : (activeImage || product.image)}
                alt={product.name}
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-200"
              />
              {pricing.hasDiscount && (
                <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                  {pricing.discountPercentage}% {t('ছাড়', 'OFF')}
                </span>
              )}
              <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-md">
                {t('চীন থেকে সরাসরি আমদানি', 'Direct China Import')}
              </span>
              {allImages.length > 1 && (
                <span className="absolute bottom-3 right-3 bg-gray-900/75 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{allImages.indexOf(activeImage) + 1} / {allImages.length}</span>
                </span>
              )}
            </div>

            {/* Multiple Product Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span>{t(`পণ্যের ছবি (${allImages.length} টি)`, `Product Photos (${allImages.length})`)}</span>
                  <span className="text-[10px] text-gray-400">{t('ক্লিক করে দেখুন', 'Click to view')}</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
                  {allImages.map((img, idx) => {
                    const isSelected = activeImage === img;
                    const isMain = img === product.image;
                    return (
                      <button
                        key={`${idx}-${img.slice(-25)}`}
                        type="button"
                        id={`btn-product-thumb-${idx}`}
                        onClick={() => {
                          setActiveImage(img);
                          setImgError(false);
                        }}
                        className={`relative w-16 h-16 sm:w-18 sm:h-18 shrink-0 rounded-lg overflow-hidden border-2 bg-gray-50 transition cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs'
                            : 'border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100'
                        }`}
                        title={isMain ? (t('মূল ছবি', 'Main Image')) : (t(`ছবি ${idx + 1}`, `Image ${idx + 1}`))}
                      >
                        <img
                          src={img}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isMain && (
                          <span className="absolute bottom-1 right-1 bg-emerald-700 text-white text-[8px] font-bold px-1 py-0.2 rounded-xs shadow-xs">
                            {t('মূল ছবি', 'Main')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <Truck className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                <div className="text-[11px] font-semibold text-gray-800">{t('সারা দেশে ডেলিভারি', 'Nationwide Delivery')}</div>
                <div className="text-[10px] text-gray-500">{t('ঢাকা ও সকল জেলা', 'All 64 Districts')}</div>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <ShieldCheck className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                <div className="text-[11px] font-semibold text-gray-800">{t('যাচাইকৃত কোয়ালিটি', 'Quality Verified')}</div>
                <div className="text-[10px] text-gray-500">{t('১০০% অরিজিনাল', '100% Authentic')}</div>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <RefreshCw className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                <div className="text-[11px] font-semibold text-gray-800">{t('দ্রুত সরবরাহ', 'Fast Dispatch')}</div>
                <div className="text-[10px] text-gray-500">{t('২-৪ কার্যদিবস', '2-4 Working Days')}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category */}
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
                {getCategoryDisplayName(product.category, language)}
              </div>

              {/* Product Name */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mb-3">
                {product.name}
              </h1>

              {/* Price in ৳ & Discount */}
              <div className="flex items-baseline gap-3 py-3 border-y border-gray-100 my-4 flex-wrap">
                {pricing.hasDiscount ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">{t('মূল্য:', 'Price:')}</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                        ৳{pricing.currentPrice.toLocaleString('en-US')}
                      </span>
                    </div>
                    {pricing.regularPrice && (
                      <span className="text-base text-gray-400 line-through">
                        ৳{pricing.regularPrice.toLocaleString('en-US')}
                      </span>
                    )}
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      ৳{pricing.discountAmount.toLocaleString('en-US')} {t('ছাড়', 'OFF')} ({pricing.discountPercentage}%)
                    </span>
                  </>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">{t('মূল্য:', 'Price:')}</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                      ৳{pricing.currentPrice.toLocaleString('en-US')}
                    </span>
                  </div>
                )}
              </div>

              {/* Available Stock & Minimum Order Quantity */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {product.stock > 0 ? (
                  <div
                    id="product-available-stock-badge"
                    className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-300/80 px-3.5 py-2 rounded-xl text-sm font-semibold shadow-xs"
                  >
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {t('উপলব্ধ স্টক:', 'Available Stock:')}{' '}
                      <strong className="text-emerald-950 font-bold">{product.stock} {t('টি', 'pieces')}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-sm font-bold shadow-xs">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>{t('স্টক শেষ (Out of Stock)', 'Out of Stock')}</span>
                  </div>
                )}

                <div
                  id="product-minimum-order-badge"
                  className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-300/80 px-3.5 py-2 rounded-xl text-sm font-semibold shadow-xs"
                >
                  <Package className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    {t('কমপক্ষে অর্ডার:', 'Minimum Order:')}{' '}
                    <strong className="text-amber-950 font-bold">{minQty} {t('টি', 'pieces')}</strong>
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  {t('প্রোডাক্টের বিবরণ (Product Details)', 'Product Details')}
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {product.description}
                </p>
              </div>

              {/* Product Options / Variants (if available) */}
              {product.options && product.options.length > 0 && (
                <div id="product-page-options" className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      {t('পণ্যের অপশন / ভ্যারিয়েন্ট (Variants)', 'Product Variants / Options')}
                    </h2>
                    <span className="text-[11px] text-gray-500">
                      {t('পছন্দমত অপশন নির্বাচন করুন', 'Select your options')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {product.options.map((opt, idx) => {
                      const currentVal = selectedOptions[opt.name] || opt.values[0] || '';
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-700">
                              {opt.name}: <strong className="text-emerald-800 font-bold">{currentVal}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {opt.values.map((val) => {
                              const isSelected = currentVal === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() =>
                                    setSelectedOptions((prev) => ({ ...prev, [opt.name]: val }))
                                  }
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-600/30'
                                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Wholesale Order Quantity Section */}
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="order-quantity-input" className="block text-sm font-bold text-gray-900">
                    {t('অর্ডারের পরিমাণ (Order Quantity):', 'Order Quantity:')}
                  </label>
                  <span className="text-xs text-amber-800 font-semibold bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md">
                    {t(`কমপক্ষে ${minQty} টি আবশ্যক`, `Min: ${minQty} pieces`)}
                  </span>
                </div>

                {/* Input & Step Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center border-2 border-gray-300 focus-within:border-emerald-600 rounded-xl bg-white overflow-hidden shadow-xs">
                    <button
                      id="btn-qty-decrease"
                      type="button"
                      onClick={handleDecrease}
                      disabled={quantity <= minQty}
                      className="p-3 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                      title={t(`কমপক্ষে ${minQty} টি`, `Min ${minQty} pieces`)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 text-gray-700" />
                    </button>

                    <input
                      id="order-quantity-input"
                      type="number"
                      min={minQty}
                      max={product.stock}
                      step="1"
                      value={quantityInput}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="w-24 text-center font-extrabold text-base text-gray-900 focus:outline-hidden py-2"
                      aria-label="Order Quantity"
                    />

                    <button
                      id="btn-qty-increase"
                      type="button"
                      onClick={handleIncrease}
                      disabled={quantity >= product.stock}
                      className="p-3 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                      title={t('পরিমাণ বাড়ান', 'Increase quantity')}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  <span className="text-xs text-gray-500 font-medium">
                    {t(`(${minQty} বা তার বেশি যেকোনো পূর্ণসংখ্যা)`, `(${minQty} or more, whole number only)`)}
                  </span>
                </div>

                {/* Preset wholesale quantity batch buttons (e.g. 50, 100, 150, 200) */}
                {presetQuantities.length > 1 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-600">
                      {t('দ্রুত সিলেক্ট:', 'Quick Select:')}
                    </span>
                    {presetQuantities.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          quantity === preset
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {preset} {t('টি', 'pcs')}
                      </button>
                    ))}
                  </div>
                )}

                {/* Real-time Order Calculation */}
                <div className="mt-4 bg-white border border-emerald-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {t('অর্ডার হিসাব (Order Calculation)', 'Order Calculation')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      ৳{pricing.currentPrice.toLocaleString('en-US')} × {quantity || 0}
                    </span>
                    <span className="text-base font-extrabold text-emerald-800 font-mono">
                      ৳{(pricing.currentPrice * (quantity || 0)).toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium border-t border-gray-100 mt-2 pt-1 flex items-center justify-between">
                    <span>{t('পণ্যের মূল্য × অর্ডারের পরিমাণ = মোট মূল্য', 'Product Price × Order Quantity = Total Amount')}</span>
                    <span className="font-bold">Total: ৳{(pricing.currentPrice * (quantity || 0)).toLocaleString('en-US')}</span>
                  </div>
                </div>

                {/* Validation Warning Message */}
                {warningMsg && (
                  <div
                    id="product-moq-warning-msg"
                    className="mt-3 text-xs font-bold text-rose-700 bg-rose-50 border-2 border-rose-300 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{warningMsg}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button: Order Now */}
            <div className="pt-4 border-t border-gray-200">
              <button
                id="btn-product-order-now"
                type="button"
                onClick={handleOrderNow}
                disabled={product.stock <= 0 || quantity < minQty || quantity > product.stock}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>
                  {product.stock <= 0
                    ? t('স্টক শেষ (Out of Stock)', 'Out of Stock')
                    : quantity < minQty
                    ? t(`ন্যূনতম ${minQty} টি অর্ডার করতে হবে`, `Minimum order quantity is ${minQty} pieces.`)
                    : t(
                        `এখনই অর্ডার করুন (৳${(pricing.currentPrice * (quantity || 0)).toLocaleString('en-US')})`,
                        `Order Now (৳${(pricing.currentPrice * (quantity || 0)).toLocaleString('en-US')})`
                      )}
                </span>
              </button>
            </div>

            {/* Direct WhatsApp Chat for this product */}
            {whatsAppChatUrl && (
              <a
                id="btn-product-whatsapp-chat"
                href={whatsAppChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-3 py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] border border-[#25D366]/40 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                <span>{t('হোয়াটসঅ্যাপে চ্যাট করুন (পণ্য সম্পর্কে জানতে)', 'Chat on WhatsApp (Inquire About Product)')}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
