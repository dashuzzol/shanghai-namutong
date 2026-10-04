import React, { useState } from 'react';
import { Order, StoreSettings } from '../types';
import {
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Printer,
  Clock,
} from 'lucide-react';
import { OrderInvoicePrint } from './OrderInvoicePrint';
import { useLanguage } from '../context/LanguageContext';

interface OrderConfirmationPageProps {
  order: Order;
  settings?: StoreSettings;
  onContinueShopping: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  settings,
  onContinueShopping,
}) => {
  const { t } = useLanguage();
  const [showPrintModal, setShowPrintModal] = useState(false);

  const storePhone = settings?.phoneNumber || '+880 1700-123456';
  const cleanPhone = storePhone.replace(/[^\d+]/g, '');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Top Header */}
        <div className="bg-emerald-700 p-6 sm:p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!', 'Your order has been placed successfully!')}
          </h1>
          {/* User Required Message */}
          <p className="text-emerald-100 text-sm sm:text-base mt-2 font-medium max-w-xl mx-auto bg-emerald-800/60 py-2.5 px-4 rounded-xl border border-emerald-600/50">
            {t(
              '"আপনার অর্ডারটি আমরা পেয়েছি। পেমেন্ট ও অর্ডার নিশ্চিত করতে আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবে।"',
              '"We have received your order. Our representative will contact you by phone shortly to confirm payment and delivery."'
            )}
          </p>
        </div>

        {/* Status and Action Ribbon */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs text-amber-950">
              <div className="flex items-center gap-2 flex-wrap">
                <span>{t('অর্ডার স্ট্যাটাস', 'Order Status')}: <strong className="text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">Payment Pending</strong></span>
                <span>•</span>
                <span>{t('পেমেন্ট মাধ্যম', 'Payment Method')}: <strong className="text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">{order.paymentMethod || 'bKash'}</strong></span>
              </div>
              <p className="text-amber-800 text-[11px] mt-1">
                {t(
                  'পেমেন্ট ও অর্ডার নিশ্চিত করতে আমাদের সেলস টিম আপনার সাথে ফোনে কথা বলবে।',
                  'Our sales team will call you to confirm payment and dispatch.'
                )}
              </p>
            </div>
          </div>

          {/* User Required Call Us Button */}
          {cleanPhone && (
            <a
              id="confirmation-call-us-btn"
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer shrink-0"
            >
              <Phone className="w-4 h-4 fill-white" />
              <span>{t('কল করুন', 'Call Us')}: {storePhone}</span>
            </a>
          )}
        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Highlighted Order Number, Total Amount & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/50 border-2 border-emerald-100 rounded-xl p-5">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                {t('অর্ডার নম্বর (Order No.)', 'Order Number')}
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-800 font-mono">
                #{order.orderNumber}
              </span>
              <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{order.orderDate}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                {t('পেমেন্ট মাধ্যম', 'Payment Method')}
              </span>
              <span className="text-base font-extrabold text-gray-900 block mt-0.5">
                {order.paymentMethod || 'bKash'}
              </span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                Payment Pending
              </span>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-center">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                {t('সর্বমোট মূল্য', 'Total Amount')}
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                ৳{order.totalAmount.toLocaleString('en-US')}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 rounded-xl p-5 text-xs">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                {t('গ্রাহকের বিবরণ (Customer Details)', 'Customer Information')}
              </span>
              <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
              <p className="text-gray-700 font-medium flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {order.mobileNumber}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                {t('ডেলিভারি ঠিকানা (Delivery Address)', 'Delivery Address')}
              </span>
              <p className="text-gray-800 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{order.address}, {order.district}</span>
              </p>
            </div>
          </div>

          {/* Ordered Products Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span>{t(`অর্ডারকৃত পণ্যসমূহ (মোট ${order.quantities} টি)`, `Ordered Items (${order.quantities} total)`)}</span>
              <span>{t('মোট মূল্য', 'Total Price')}</span>
            </div>

            <div className="divide-y divide-gray-100">
              {order.products.map((p, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        ৳{p.price.toLocaleString('en-US')} × {p.quantity} {t('টি', 'pcs')}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-bold text-gray-900 shrink-0">
                    ৳{(p.price * p.quantity).toLocaleString('en-US')}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Calculation */}
            <div className="bg-gray-50/80 p-4 border-t border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{t('সাবটোটাল', 'Subtotal')}</span>
                <span className="font-semibold text-gray-900">
                  ৳{order.subtotal.toLocaleString('en-US')}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-extrabold text-gray-900">
                <span>{t('সর্বমোট মূল্য', 'Total Amount')}</span>
                <span className="text-emerald-700 text-lg">
                  ৳{order.totalAmount.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Call Us, Continue Shopping & Print Invoice */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {cleanPhone && (
              <a
                id="confirmation-call-us-bottom-btn"
                href={`tel:${cleanPhone}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-xs cursor-pointer active:scale-95"
              >
                <Phone className="w-4 h-4 fill-white" />
                <span>{t(`সরাসরি কল করুন (${storePhone})`, `Call Us Directly (${storePhone})`)}</span>
              </a>
            )}

            <button
              id="confirmation-continue-shopping-btn"
              onClick={onContinueShopping}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl transition border border-gray-300 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('আরও পণ্য দেখুন', 'Browse More Products')}</span>
            </button>

            <button
              id="confirmation-print-invoice-btn"
              onClick={() => setShowPrintModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl transition border border-gray-300 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>{t('চালান প্রিন্ট করুন (Print)', 'Print Invoice')}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Print Order Modal Preview */}
      {showPrintModal && (
        <OrderInvoicePrint
          order={order}
          settings={settings}
          isModalPreview={true}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
