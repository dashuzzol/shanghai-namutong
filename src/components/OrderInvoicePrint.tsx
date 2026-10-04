import React, { useState } from 'react';
import { Order, StoreSettings } from '../types';
import { Printer, Download, X, CheckCircle2, Phone, MapPin, Calendar, Package } from 'lucide-react';
import { generateOrderPdf } from '../utils/generateOrderPdf';

interface OrderInvoicePrintProps {
  order: Order;
  settings?: StoreSettings;
  onClose?: () => void;
  isModalPreview?: boolean;
}

export const OrderInvoicePrint: React.FC<OrderInvoicePrintProps> = ({
  order,
  settings,
  onClose,
  isModalPreview = false,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const storeName = settings?.storeName || 'Shanghai Namutong International Trade Co. Ltd';
  const storeLogo = settings?.storeLogo || '/shanghai_namutong_logo.svg';
  const storePhone = settings?.phoneNumber || '+880 1711-234567';
  const storeEmail = settings?.email || 'info@shanghainamutong.com';
  const storeAddress = settings?.storeAddress || 'Level 7, Suite 702, Trade Tower, Dilkusha C/A, Dhaka-1000, Bangladesh';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await generateOrderPdf(order, settings);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const invoiceContent = (
    <div
      id="printable-order-invoice"
      className="bg-white text-gray-900 p-8 sm:p-10 max-w-[210mm] mx-auto text-sm print:p-0 print:max-w-none print:w-full print:m-0 print:border-none print:shadow-none font-sans"
    >
      {/* Printable CSS style for clean A4 printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-order-invoice,
          #printable-order-invoice * {
            visibility: visible !important;
          }
          #printable-order-invoice {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
            z-index: 9999999 !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* Invoice Header: Two-Column Layout (Left: Store details, Right: Order invoice & meta) */}
      <div className="flex items-start justify-between gap-8 border-b-2 border-slate-900 pb-5 mb-6">
        {/* LEFT SIDE: Store Logo, Store Name, Full Address, Phone, Email */}
        <div className="flex-1 min-w-0 max-w-[62%] sm:max-w-[65%]">
          <div className="flex items-start gap-3.5">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={storeName}
                referrerPolicy="no-referrer"
                className="h-12 sm:h-14 w-auto max-w-[130px] object-contain rounded-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg tracking-wider shrink-0 shadow-xs">
                {storeName
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('') || 'CD'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight break-words">
                {storeName}
              </h1>
              <div className="mt-1 space-y-0.5 text-xs text-slate-600 leading-relaxed break-words">
                <p className="break-words text-slate-600 font-normal">{storeAddress}</p>
                <p className="break-words">
                  <span className="text-slate-500 font-medium">Phone:</span>{' '}
                  <strong className="text-slate-900 font-semibold">{storePhone}</strong>
                </p>
                <p className="break-words">
                  <span className="text-slate-500 font-medium">Email:</span>{' '}
                  <span className="text-slate-800 font-medium break-all">{storeEmail}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: ORDER INVOICE, Order Number, Order Date */}
        <div className="w-[180px] sm:w-[210px] shrink-0 text-right flex flex-col items-end min-w-0">
          <div className="inline-block px-3.5 py-1 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-md shadow-2xs">
            ORDER INVOICE
          </div>

          <div className="mt-2.5">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
              Order Number
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight block">
              #{order.orderNumber}
            </span>
          </div>

          <div className="mt-1.5">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
              Order Date
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              {order.orderDate}
            </span>
          </div>

          <div className="mt-2">
            <span
              className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                order.orderStatus === 'Confirmed'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : order.orderStatus === 'Delivered'
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              Status: {order.orderStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Customer Info & Order Details */}
      <div className="grid grid-cols-2 gap-6 bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 text-xs">
        <div>
          <h2 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
            Customer Information / গ্রাহকের তথ্য
          </h2>
          <div className="space-y-1 text-gray-700">
            <div>
              <span className="text-gray-500 font-medium">Customer Name:</span>{' '}
              <strong className="text-gray-900 text-sm font-bold block sm:inline">
                {order.customerName}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Mobile Number:</span>{' '}
              <strong className="text-gray-900 font-bold">{order.mobileNumber}</strong>
            </div>
            <div>
              <span className="text-gray-500 font-medium">District:</span>{' '}
              <strong className="text-gray-900">{order.district}</strong>
            </div>
            <div className="pt-1">
              <span className="text-gray-500 font-medium">Delivery Address:</span>{' '}
              <span className="text-gray-900 font-semibold">{order.address}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
            Order & Delivery Info / ডেলিভারি বিবরণ
          </h2>
          <div className="space-y-1 text-gray-700">
            <div>
              <span className="text-gray-500 font-medium">Payment Method:</span>{' '}
              <strong className="text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-sm">
                {order.paymentMethod || 'Phone Confirmation'}
              </strong>
            </div>
            {order.paymentStatus && (
              <div>
                <span className="text-gray-500 font-medium">Payment Status:</span>{' '}
                <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500 font-medium">Delivery Type:</span>{' '}
              <span className="text-gray-900 font-semibold">
                Home Delivery ({order.district === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Order Status:</span>{' '}
              <span className="text-gray-900 font-bold">{order.orderStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Products Table */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Ordered Products / পণ্যের তালিকা
        </h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b border-gray-200 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-center w-20">Qty</th>
                <th className="py-2.5 px-3 text-right w-28">Product Price</th>
                <th className="py-2.5 px-3 text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.products.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 text-center font-medium text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 object-cover rounded-md border border-gray-200 shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-bold text-gray-900 line-clamp-2 leading-tight">
                          {item.name}
                        </div>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                            {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          SKU: {item.productId || `ITM-${idx + 1}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-gray-700 font-mono">
                    ৳{item.price.toLocaleString('en-US')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900 font-mono">
                    ৳{(item.price * item.quantity).toLocaleString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Box & Calculation */}
      <div className="flex justify-end mb-8">
        <div className="w-72 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span className="font-bold text-gray-900 font-mono">
              ৳{(order.subtotal || order.totalAmount).toLocaleString('en-US')}
            </span>
          </div>
          <div className="border-t-2 border-gray-800 pt-2 flex justify-between items-center text-sm font-black text-gray-900">
            <span>Total Amount:</span>
            <span className="text-base text-emerald-800 font-mono font-black">
              ৳{(order.subtotal || order.totalAmount).toLocaleString('en-US')}
            </span>
          </div>
          <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-200 flex justify-between">
            <span>Payment Method:</span>
            <span className="font-bold text-gray-800">{order.paymentMethod || 'Mobile Banking'}</span>
          </div>
        </div>
      </div>

      {/* Invoice Footer / Signatures */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="grid grid-cols-2 gap-8 text-center text-xs text-gray-600 mb-6">
          <div className="pt-8 border-t border-dashed border-gray-400">
            <span className="font-semibold text-gray-700 block">Customer Signature</span>
            <span className="text-[10px] text-gray-500">গ্রাহকের স্বাক্ষর</span>
          </div>
          <div className="pt-8 border-t border-dashed border-gray-400">
            <span className="font-semibold text-gray-700 block">Authorized Signature</span>
            <span className="text-[10px] text-gray-500">অনুমোদিত স্বাক্ষর ({storeName})</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700">
            Thank you for shopping with {storeName}!
          </p>
          <p>
            For any queries or support, please call: <strong>{storePhone}</strong> or email:{' '}
            <strong>{storeEmail}</strong>
          </p>
          <p className="text-[10px] text-gray-400">
            Printed from Shanghai Namutong International Trade Co. Ltd Order Management System.
          </p>
        </div>
      </div>
    </div>
  );

  if (isModalPreview) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
        <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 my-4 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
          {/* Header Action Bar */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm">
                অর্ডার চালান / Invoice #{order.orderNumber} (A4)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-trigger-download-pdf"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-75"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
              </button>

              <button
                id="btn-trigger-print"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 border border-slate-600"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable invoice container */}
          <div className="overflow-y-auto p-4 sm:p-6 bg-gray-100 flex-1 print:p-0 print:bg-white">
            <div className="bg-white shadow-md rounded-xl overflow-hidden print:shadow-none print:rounded-none">
              {invoiceContent}
            </div>
          </div>

          {/* Footer controls */}
          <div className="px-5 py-3 bg-white border-t border-gray-200 flex items-center justify-between shrink-0 print:hidden">
            <span className="text-xs text-gray-500">
              A4 ফরম্যাট • প্রিন্ট অথবা PDF ডাউনলোড করুন
            </span>
            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  বন্ধ করুন (Close)
                </button>
              )}
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-75"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন (Print)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return invoiceContent;
};
