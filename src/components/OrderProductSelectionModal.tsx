import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductOption } from '../types';
import { getProductPricing, getMinOrderQuantity } from '../utils/productUtils';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Package,
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface OrderProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  allProducts: Product[];
  initialQuantity?: number;
  initialOptions?: Record<string, string>;
  onContinueToOrder: (
    product: Product,
    quantity: number,
    selectedOptions?: Record<string, string>
  ) => void;
}

export const OrderProductSelectionModal: React.FC<OrderProductSelectionModalProps> = ({
  isOpen,
  onClose,
  product: initialProduct,
  allProducts,
  initialQuantity,
  initialOptions,
  onContinueToOrder,
}) => {
  const { language, t } = useLanguage();

  // Selected product (customer can switch if desired)
  const [currentProduct, setCurrentProduct] = useState<Product>(initialProduct);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(() => getMinOrderQuantity(initialProduct));
  const [quantityInput, setQuantityInput] = useState<string>(() =>
    getMinOrderQuantity(initialProduct).toString()
  );
  const [warningMsg, setWarningMsg] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Sync state when initialProduct changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentProduct(initialProduct);
      setIsProductDropdownOpen(false);
    }
  }, [isOpen, initialProduct]);

  // When currentProduct changes, reset options and quantity
  useEffect(() => {
    const minQty = getMinOrderQuantity(currentProduct);
    const startQty =
      initialQuantity && initialQuantity >= minQty && initialQuantity <= currentProduct.stock
        ? initialQuantity
        : minQty;

    setQuantity(startQty);
    setQuantityInput(startQty.toString());
    setWarningMsg('');

    // Pre-select first value for each available option or initialOptions
    const initOptions: Record<string, string> = {};
    if (currentProduct.options && currentProduct.options.length > 0) {
      for (const opt of currentProduct.options) {
        if (initialOptions && initialOptions[opt.name]) {
          initOptions[opt.name] = initialOptions[opt.name];
        } else if (opt.values && opt.values.length > 0) {
          initOptions[opt.name] = opt.values[0];
        }
      }
    }
    setSelectedOptions(initOptions);
  }, [currentProduct, initialQuantity, initialOptions]);

  const minQty = getMinOrderQuantity(currentProduct);
  const pricing = getProductPricing(currentProduct);
  const hasVariants = Boolean(currentProduct.options && currentProduct.options.length > 0);

  // Validation function enforcing whole numbers, minQty and stock
  const validateQuantity = (val: number): boolean => {
    if (isNaN(val) || val < minQty) {
      setWarningMsg(
        language === 'bn'
          ? `ন্যূনতম অর্ডারের পরিমাণ ${minQty} টি। (Minimum order quantity is ${minQty} pieces.)`
          : `Minimum order quantity is ${minQty} pieces.`
      );
      return false;
    }
    if (val > currentProduct.stock) {
      setWarningMsg(
        language === 'bn'
          ? `বর্তমানে মাত্র ${currentProduct.stock} টি উপলব্ধ আছে। (Only ${currentProduct.stock} pieces are currently available.)`
          : `Only ${currentProduct.stock} pieces are currently available.`
      );
      return false;
    }
    setWarningMsg('');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const fallback = Math.min(minQty, Math.max(1, currentProduct.stock));
      setQuantity(fallback);
      setQuantityInput(fallback.toString());
      setWarningMsg(
        language === 'bn'
          ? `ন্যূনতম অর্ডারের পরিমাণ ${minQty} টি। (Minimum order quantity is ${minQty} pieces.)`
          : `Minimum order quantity is ${minQty} pieces.`
      );
      return;
    }
    if (num > currentProduct.stock) {
      num = currentProduct.stock;
      setQuantity(num);
      setQuantityInput(num.toString());
      setWarningMsg(
        language === 'bn'
          ? `বর্তমানে মাত্র ${currentProduct.stock} টি উপলব্ধ আছে। (Only ${currentProduct.stock} pieces are currently available.)`
          : `Only ${currentProduct.stock} pieces are currently available.`
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
    if (quantity >= currentProduct.stock) {
      setWarningMsg(
        language === 'bn'
          ? `বর্তমানে মাত্র ${currentProduct.stock} টি উপলব্ধ আছে। (Only ${currentProduct.stock} pieces are currently available.)`
          : `Only ${currentProduct.stock} pieces are currently available.`
      );
      return;
    }
    const nextVal = Math.min(currentProduct.stock, quantity + 1);
    setQuantity(nextVal);
    setQuantityInput(nextVal.toString());
    validateQuantity(nextVal);
  };

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Quick preset quantities (e.g. 50, 100, 150, 200)
  const presetQuantities = useMemo(() => {
    const list: number[] = [];
    const multipliers = [1, 2, 3, 4, 5, 10];
    for (const m of multipliers) {
      const val = minQty * m;
      if (val <= currentProduct.stock && !list.includes(val)) {
        list.push(val);
      }
    }
    return list.slice(0, 5);
  }, [minQty, currentProduct.stock]);

  const handleSelectPreset = (val: number) => {
    if (val > currentProduct.stock) {
      setWarningMsg(
        language === 'bn'
          ? `বর্তমানে মাত্র ${currentProduct.stock} টি উপলব্ধ আছে।`
          : `Only ${currentProduct.stock} pieces are currently available.`
      );
      return;
    }
    setQuantity(val);
    setQuantityInput(val.toString());
    validateQuantity(val);
  };

  const handleContinue = () => {
    if (currentProduct.stock <= 0) {
      setWarningMsg(t('দুঃখিত, পণ্যটির স্টক শেষ।', 'Sorry, this product is out of stock.'));
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
    if (quantity > currentProduct.stock) {
      setWarningMsg(
        language === 'bn'
          ? `বর্তমানে মাত্র ${currentProduct.stock} টি উপলব্ধ আছে।`
          : `Only ${currentProduct.stock} pieces are currently available.`
      );
      return;
    }

    const finalOptions = hasVariants ? selectedOptions : undefined;
    onContinueToOrder(currentProduct, quantity, finalOptions);
  };

  if (!isOpen) return null;

  const totalAmount = pricing.currentPrice * (quantity || 0);

  // Formatted string of selected options for display
  const selectedOptionsList = Object.entries(selectedOptions).map(
    ([key, val]) => `${key}: ${val}`
  );

  return (
    <div
      id="order-product-selection-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {t('অর্ডার প্রডাক্ট ও অপশন নির্বাচন', 'Order Now — Product Selection')}
              </h2>
              <p className="text-[11px] text-slate-300">
                {t('ভ্যারিয়েন্ট ও পরিমাণ নিশ্চিত করে অর্ডারে এগিয়ে যান', 'Select product variant and wholesale quantity before checkout')}
              </p>
            </div>
          </div>
          <button
            id="btn-close-selection-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 divide-y divide-gray-100 flex-1">
          {/* 1. Product Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('নির্বাচিত পণ্য (Selected Product)', 'Selected Product')}</span>
              </label>

              {allProducts.length > 1 && (
                <div className="relative">
                  <button
                    id="btn-switch-product"
                    type="button"
                    onClick={() => setIsProductDropdownOpen((prev) => !prev)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('পণ্য পরিবর্তন করুন', 'Change Product')}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isProductDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-72 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 divide-y divide-gray-100">
                      {allProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setCurrentProduct(p);
                            setIsProductDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 text-left flex items-center gap-2.5 hover:bg-emerald-50/60 transition cursor-pointer text-xs ${
                            currentProduct.id === p.id ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-gray-800'
                          }`}
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-md object-cover border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold">{p.name}</div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              ৳{getProductPricing(p).currentPrice.toLocaleString('en-US')}
                            </div>
                          </div>
                          {currentProduct.id === p.id && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Card Overview */}
            <div className="flex items-center gap-3.5 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <img
                src={currentProduct.image}
                alt={currentProduct.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg object-cover border border-gray-200 shrink-0 bg-white"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block mb-1">
                  {currentProduct.category}
                </span>
                <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">
                  {currentProduct.name}
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-emerald-700 font-mono">
                    ৳{pricing.currentPrice.toLocaleString('en-US')}
                  </span>
                  {pricing.hasDiscount && (
                    <span className="text-xs text-gray-400 line-through font-mono">
                      ৳{pricing.regularPrice.toLocaleString('en-US')}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-500">
                    / {t('প্রতি পিস', 'piece')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Product Variant/Option Selection (Only if available) */}
          {hasVariants ? (
            <div id="product-variants-selection" className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {t('পণ্যের অপশন / ভ্যারিয়েন্ট (Product Options):', 'Product Options / Variants:')}
                </label>
                <span className="text-[11px] text-gray-500">
                  {t('পছন্দের অপশন সিলেক্ট করুন', 'Choose your preferred option')}
                </span>
              </div>

              {currentProduct.options!.map((opt: ProductOption, idx: number) => {
                const currentVal = selectedOptions[opt.name] || opt.values[0] || '';
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800">
                        {opt.name}: <strong className="text-emerald-800 font-extrabold">{currentVal}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {opt.values.map((val) => {
                        const isSelected = currentVal === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleOptionSelect(opt.name, val)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-600/30'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            <span>{val}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* 3. Quantity Selection */}
          <div className="pt-4 space-y-3">
            {/* Badges: Available Stock & Minimum Order Quantity */}
            <div className="flex flex-wrap items-center gap-2.5">
              {currentProduct.stock > 0 ? (
                <div
                  id="selection-available-stock-badge"
                  className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300/80 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {t('উপলব্ধ স্টক:', 'Available Stock:')}{' '}
                    <strong className="text-emerald-950 font-bold">{currentProduct.stock} {t('টি', 'pieces')}</strong>
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                  <span>{t('স্টক শেষ (Out of Stock)', 'Out of Stock')}</span>
                </div>
              )}

              <div
                id="selection-minimum-order-badge"
                className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300/80 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs"
              >
                <Package className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  {t('কমপক্ষে অর্ডার:', 'Minimum Order Quantity:')}{' '}
                  <strong className="text-amber-950 font-bold">{minQty} {t('টি', 'pieces')}</strong>
                </span>
              </div>
            </div>

            {/* Order Quantity Input Field */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="selection-order-quantity-input" className="block text-xs font-bold text-gray-900">
                  {t('অর্ডারের পরিমাণ (Order Quantity):', 'Order Quantity:')}
                </label>
                <span className="text-[11px] text-amber-800 font-semibold bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md">
                  {t(`কমপক্ষে ${minQty} টি আবশ্যক`, `Min: ${minQty} pieces`)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center border-2 border-gray-300 focus-within:border-emerald-600 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    id="btn-selection-qty-decrease"
                    type="button"
                    onClick={handleDecrease}
                    disabled={quantity <= minQty}
                    className="p-2.5 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                    title={t(`কমপক্ষে ${minQty} টি`, `Min ${minQty} pieces`)}
                    aria-label="Decrease quantity"
                  >
                    <span className="text-base font-bold text-gray-700 leading-none">−</span>
                  </button>

                  <input
                    id="selection-order-quantity-input"
                    type="number"
                    min={minQty}
                    max={currentProduct.stock}
                    step="1"
                    value={quantityInput}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="w-24 text-center font-extrabold text-base text-gray-900 focus:outline-hidden py-2"
                    aria-label="Order Quantity"
                  />

                  <button
                    id="btn-selection-qty-increase"
                    type="button"
                    onClick={handleIncrease}
                    disabled={quantity >= currentProduct.stock}
                    className="p-2.5 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                    title={t('পরিমাণ বাড়ান', 'Increase quantity')}
                    aria-label="Increase quantity"
                  >
                    <span className="text-base font-bold text-gray-700 leading-none">+</span>
                  </button>
                </div>

                <span className="text-xs text-gray-500 font-medium">
                  {t(`(${minQty} বা তার বেশি যেকোনো পূর্ণসংখ্যা)`, `(${minQty} or more, whole number only)`)}
                </span>
              </div>

              {/* Quick Batch Presets */}
              {presetQuantities.length > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-semibold text-gray-600">
                    {t('দ্রুত সিলেক্ট:', 'Quick Select:')}
                  </span>
                  {presetQuantities.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        quantity === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {preset} {t('টি', 'pcs')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Validation Warning */}
            {warningMsg && (
              <div
                id="selection-quantity-warning"
                className="text-xs font-bold text-rose-700 bg-rose-50 border-2 border-rose-300 rounded-xl px-3.5 py-2.5 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{warningMsg}</span>
              </div>
            )}
          </div>

          {/* 4. Before Checkout Clear Summary */}
          <div id="selection-summary-box" className="pt-4 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
              {t('অর্ডার সংক্ষেপ (Order Summary):', 'Order Summary:')}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-500 font-medium">{t('পণ্যের নাম:', 'Product Name:')}</span>
                <span className="font-bold text-gray-900 text-right">{currentProduct.name}</span>
              </div>

              {hasVariants && selectedOptionsList.length > 0 && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500 font-medium">{t('নির্বাচিত ভ্যারিয়েন্ট:', 'Selected Variant/Options:')}</span>
                  <span className="font-bold text-emerald-800 text-right bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                    {selectedOptionsList.join(' | ')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">{t('পরিমাণ (Quantity):', 'Quantity:')}</span>
                <span className="font-bold text-gray-900 font-mono">{quantity || 0} {t('টি', 'pieces')}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">{t('একক মূল্য (Price):', 'Price:')}</span>
                <span className="font-semibold text-gray-800 font-mono">
                  ৳{pricing.currentPrice.toLocaleString('en-US')} / {t('পিস', 'pc')}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm">
                <span className="font-black text-gray-900">{t('মোট মূল্য (Total Amount):', 'Total Amount:')}</span>
                <span className="font-black text-emerald-800 font-mono text-base">
                  ৳{totalAmount.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Action */}
        <div className="p-4 border-t border-gray-200 bg-white shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {t('বাতিল', 'Cancel')}
          </button>

          <button
            id="btn-continue-to-order"
            type="button"
            onClick={handleContinue}
            disabled={currentProduct.stock <= 0 || quantity < minQty || quantity > currentProduct.stock}
            className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>
              {t('অর্ডারে এগিয়ে যান (Continue to Order)', 'Continue to Order')}
              {' — ৳'}{totalAmount.toLocaleString('en-US')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
