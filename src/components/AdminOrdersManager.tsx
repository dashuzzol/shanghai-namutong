import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  X,
  ClipboardList,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  MapPin,
  Calendar,
  Truck,
  Package,
  Check,
  Settings,
  Printer,
  XCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Order, StoreSettings, PaymentStatus } from '../types';
import { OrderInvoicePrint } from './OrderInvoicePrint';
import { generateOrderPdf } from '../utils/generateOrderPdf';

interface AdminOrdersManagerProps {
  orders: Order[];
  onUpdateOrderStatus: (orderNumber: string, newStatus: string) => void;
  onUpdatePaymentStatus?: (orderNumber: string, newPaymentStatus: PaymentStatus) => void;
  onNavigateToProducts: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToCategories?: () => void;
  onBackToStore: () => void;
  hideTopNav?: boolean;
  settings?: StoreSettings;
}

export const AdminOrdersManager: React.FC<AdminOrdersManagerProps> = ({
  orders,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onNavigateToProducts,
  onNavigateToSettings,
  onNavigateToDashboard,
  onNavigateToCategories,
  onBackToStore,
  hideTopNav = false,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  >('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Payment Pending' | 'Payment Confirmed' | 'Payment Rejected'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [downloadingOrderNumber, setDownloadingOrderNumber] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Helper to format date for display e.g. "19 September 2026"
  const formatDisplayDate = (ymd: string): string => {
    if (!ymd) return '';
    try {
      const [year, month, day] = ymd.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return ymd;
    }
  };

  // Helper to match order date with selected date picker value (YYYY-MM-DD)
  const isSameDate = (orderDateStr?: string, selectedYMD?: string): boolean => {
    if (!orderDateStr || !selectedYMD) return false;

    const trimmedOrderDate = orderDateStr.trim();
    if (trimmedOrderDate.startsWith(selectedYMD)) return true;

    const [selYearStr, selMonthStr, selDayStr] = selectedYMD.split('-');
    const selYear = parseInt(selYearStr, 10);
    const selMonth = parseInt(selMonthStr, 10); // 1-12
    const selDay = parseInt(selDayStr, 10); // 1-31

    if (isNaN(selYear) || isNaN(selMonth) || isNaN(selDay)) return false;

    // Try parsing date directly
    const parsed = new Date(trimmedOrderDate);
    if (!isNaN(parsed.getTime())) {
      const matchLocal =
        parsed.getFullYear() === selYear &&
        parsed.getMonth() + 1 === selMonth &&
        parsed.getDate() === selDay;
      const matchUtc =
        parsed.getUTCFullYear() === selYear &&
        parsed.getUTCMonth() + 1 === selMonth &&
        parsed.getUTCDate() === selDay;
      if (matchLocal || matchUtc) return true;
    }

    // Text / regex matching fallback for localized formats like 'Sep 19, 2026' or '19 September 2026'
    const lower = trimmedOrderDate.toLowerCase();
    const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthsFull = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
    ];

    const targetMonthShort = monthsShort[selMonth - 1];
    const targetMonthFull = monthsFull[selMonth - 1];

    const hasMonth = lower.includes(targetMonthShort) || lower.includes(targetMonthFull);
    const hasYear = lower.includes(selYear.toString());
    const dayRegex = new RegExp(`(^|\\D)${selDay}(\\D|$)`);
    const hasDay = dayRegex.test(lower);

    return hasMonth && hasYear && hasDay;
  };

  const handleDownloadPdf = async (order: Order) => {
    try {
      setDownloadingOrderNumber(order.orderNumber);
      await generateOrderPdf(order, settings);
      showToast(`PDF for order #${order.orderNumber} downloaded successfully.`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      showToast('Could not generate PDF. Please try again or use Print Order.');
    } finally {
      setDownloadingOrderNumber(null);
    }
  };

  // Helper to normalize payment status for existing orders
  const getNormalizedPaymentStatus = (status?: string): 'Payment Pending' | 'Payment Confirmed' | 'Payment Rejected' => {
    if (!status) return 'Payment Pending';
    const s = status.toLowerCase();
    if (s.includes('reject')) return 'Payment Rejected';
    if (s.includes('confirm') || s === 'paid') return 'Payment Confirmed';
    return 'Payment Pending';
  };

  const isPaymentConfirmed = (order: Order) => {
    return getNormalizedPaymentStatus(order.paymentStatus) === 'Payment Confirmed';
  };

  const handleOrderStatusChange = (order: Order, newStatus: string) => {
    // Enforcement rule: Only after payment is confirmed should the order status become Confirmed.
    if (newStatus === 'Confirmed' && !isPaymentConfirmed(order)) {
      showToast('Payment must be confirmed before marking order as Confirmed.');
      return;
    }

    onUpdateOrderStatus(order.orderNumber, newStatus);
    showToast(`Order #${order.orderNumber} status changed to ${newStatus}`);
    if (selectedOrder && selectedOrder.orderNumber === order.orderNumber) {
      setSelectedOrder({
        ...selectedOrder,
        orderStatus: newStatus,
      });
    }
  };

  const handlePaymentStatusChange = (order: Order, newPaymentStatus: PaymentStatus) => {
    if (onUpdatePaymentStatus) {
      onUpdatePaymentStatus(order.orderNumber, newPaymentStatus);
    }
    showToast(`Order #${order.orderNumber} payment updated to "${newPaymentStatus}"`);
    if (selectedOrder && selectedOrder.orderNumber === order.orderNumber) {
      setSelectedOrder({
        ...selectedOrder,
        paymentStatus: newPaymentStatus,
      });
    }
  };

  // Admin one-click to confirm payment and confirm order
  const handleConfirmPaymentAndOrder = (order: Order) => {
    if (onUpdatePaymentStatus) {
      onUpdatePaymentStatus(order.orderNumber, 'Payment Confirmed');
    }
    onUpdateOrderStatus(order.orderNumber, 'Confirmed');
    showToast(`Order #${order.orderNumber} payment confirmed & order marked as Confirmed!`);
    if (selectedOrder && selectedOrder.orderNumber === order.orderNumber) {
      setSelectedOrder({
        ...selectedOrder,
        paymentStatus: 'Payment Confirmed',
        orderStatus: 'Confirmed',
      });
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const currentPaymentStatus = getNormalizedPaymentStatus(order.paymentStatus);
    const currentOrderStatus = (order.orderStatus || 'Payment Pending').trim();

    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') {
        const isPending =
          currentOrderStatus === 'Pending' ||
          currentOrderStatus === 'Payment Pending' ||
          currentOrderStatus.toLowerCase().includes('pending') ||
          currentOrderStatus.toLowerCase().includes('verification');
        if (!isPending) return false;
      } else if (currentOrderStatus !== statusFilter) {
        return false;
      }
    }

    // Payment filter
    if (paymentFilter !== 'All' && currentPaymentStatus !== paymentFilter) {
      return false;
    }

    // Date filter
    if (selectedDate && !isSameDate(order.orderDate, selectedDate)) {
      return false;
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.mobileNumber.toLowerCase().includes(q) ||
      order.district.toLowerCase().includes(q)
    );
  });

  const pendingPaymentCount = orders.filter(
    (o) => getNormalizedPaymentStatus(o.paymentStatus) === 'Payment Pending'
  ).length;
  const paymentConfirmedCount = orders.filter(
    (o) => getNormalizedPaymentStatus(o.paymentStatus) === 'Payment Confirmed'
  ).length;
  const confirmedOrdersCount = orders.filter((o) => (o.orderStatus || '').toLowerCase() === 'confirmed').length;
  const getOrderSalesTotal = (o: Order) => {
    if (typeof o.subtotal === 'number' && o.subtotal > 0) return o.subtotal;
    const prodSum = o.products?.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);
    if (typeof prodSum === 'number' && prodSum > 0) return prodSum;
    const delivery = Number(o.deliveryCharge) || 0;
    return Math.max(0, (Number(o.totalAmount) || 0) - delivery);
  };
  const totalRevenue = orders.reduce((sum, o) => sum + getOrderSalesTotal(o), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      {!hideTopNav && (
        <div className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                id="admin-orders-back-to-store"
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
                  id="tab-admin-products-link"
                  onClick={onNavigateToProducts}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Products</span>
                </button>

                <button
                  id="tab-admin-orders-active"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-emerald-600 text-white shadow-xs"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Orders ({orders.length})</span>
                </button>

                {onNavigateToSettings && (
                  <button
                    id="tab-admin-settings-link"
                    onClick={onNavigateToSettings}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Store Settings</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-sm">
                Wholesale Order Management
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Orders Header Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Orders & Payment Management
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contact customers by phone to confirm payment. Only confirmed payments can be set to Confirmed order status.
              </p>
            </div>

            {/* Top Quick Stats */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] text-amber-700 font-bold block uppercase tracking-wider">
                  Payment Pending
                </span>
                <span className="text-base font-extrabold text-amber-900">
                  {pendingPaymentCount}
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">
                  Payment Confirmed
                </span>
                <span className="text-base font-extrabold text-emerald-900">
                  {paymentConfirmedCount}
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] text-blue-700 font-bold block uppercase tracking-wider">
                  Confirmed Orders
                </span>
                <span className="text-base font-extrabold text-blue-900">
                  {confirmedOrdersCount}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] text-slate-600 font-bold block uppercase tracking-wider">
                  Total Value
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  ৳{totalRevenue.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-5 space-y-3">
            <div className="relative">
              <input
                id="admin-order-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders by Order #, Customer Name, Mobile Number, or District..."
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs: Date Picker, Payment Status & Order Status */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
              {/* Date Filter */}
              <div className="flex items-center gap-2 flex-wrap bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-1.5 px-1.5 text-gray-700 font-bold text-xs">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Date:</span>
                </div>
                <input
                  id="admin-order-date-picker"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 font-medium focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs"
                  title="Filter orders by specific date"
                />
                {selectedDate ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {formatDisplayDate(selectedDate)}
                    </span>
                    <button
                      type="button"
                      id="btn-clear-date-filter"
                      onClick={() => setSelectedDate('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition border border-rose-200 cursor-pointer shadow-2xs active:scale-95"
                      title="Clear Date Filter"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear Date</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-400 italic px-1 hidden sm:inline">
                    (Showing all dates)
                  </span>
                )}
              </div>

              {/* Status Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 overflow-x-auto">
                {/* Payment Status Filters */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                  <span className="text-gray-500 font-bold px-2 uppercase text-[10px]">Payment:</span>
                  {(['All', 'Payment Pending', 'Payment Confirmed', 'Payment Rejected'] as const).map((pst) => (
                    <button
                      key={pst}
                      onClick={() => setPaymentFilter(pst)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                        paymentFilter === pst
                          ? pst === 'Payment Confirmed'
                            ? 'bg-emerald-600 text-white shadow-xs font-bold'
                            : pst === 'Payment Rejected'
                            ? 'bg-rose-600 text-white shadow-xs font-bold'
                            : 'bg-amber-500 text-white shadow-xs font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {pst}
                    </button>
                  ))}
                </div>

                {/* Order Status Filters */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                  <span className="text-gray-500 font-bold px-2 uppercase text-[10px]">Order:</span>
                  {(['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap text-xs ${
                        statusFilter === st
                          ? 'bg-white text-gray-900 shadow-xs font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters Summary Bar */}
            {(selectedDate || statusFilter !== 'All' || paymentFilter !== 'All' || searchQuery) && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-950 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-700">Active Filters:</span>
                  {selectedDate && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-emerald-300 text-emerald-800 rounded-md font-bold">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      <span>Date: {formatDisplayDate(selectedDate)}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedDate('')}
                        className="text-gray-400 hover:text-rose-600 cursor-pointer ml-0.5"
                        title="Remove date filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {paymentFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 text-gray-800 rounded-md font-medium">
                      <span>Payment: {paymentFilter}</span>
                      <button
                        type="button"
                        onClick={() => setPaymentFilter('All')}
                        className="text-gray-400 hover:text-rose-600 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 text-gray-800 rounded-md font-medium">
                      <span>Order: {statusFilter}</span>
                      <button
                        type="button"
                        onClick={() => setStatusFilter('All')}
                        className="text-gray-400 hover:text-rose-600 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 text-gray-800 rounded-md font-medium">
                      <span>Search: "{searchQuery}"</span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-gray-400 hover:text-rose-600 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 font-medium">
                    Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate('');
                      setStatusFilter('All');
                      setPaymentFilter('All');
                      setSearchQuery('');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders Table / List */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-3">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto" />
              <div>
                <p className="text-base font-bold text-gray-700">No orders found</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedDate
                    ? `No orders match the date: ${formatDisplayDate(selectedDate)}${
                        paymentFilter !== 'All' ? ` with Payment Status: ${paymentFilter}` : ''
                      }${statusFilter !== 'All' ? ` and Order Status: ${statusFilter}` : ''}.`
                    : orders.length === 0
                    ? 'No customer orders have been placed yet.'
                    : 'No orders match your search query or status filter.'}
                </p>
              </div>
              {selectedDate && (
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedDate('')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Date Filter</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Mobile Card List (md:hidden) */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const paymentStatus = getNormalizedPaymentStatus(order.paymentStatus);
                  const isConfirmedPaid = paymentStatus === 'Payment Confirmed';

                  return (
                    <div key={order.orderNumber} className="p-4 space-y-3 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-xs">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {order.orderDate}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {order.customerName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <a
                              href={`tel:${order.mobileNumber}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hover:bg-emerald-100"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{order.mobileNumber}</span>
                            </a>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Amount</div>
                          <div className="text-sm font-extrabold text-gray-900">
                            ৳{order.totalAmount.toLocaleString('en-US')}
                          </div>
                        </div>
                      </div>

                      {/* Payment Status & Controls */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">Payment Method:</span>
                          <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md text-[11px]">
                            {order.paymentMethod || 'bKash'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">Payment Status:</span>
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                              paymentStatus === 'Payment Confirmed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : paymentStatus === 'Payment Rejected'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {paymentStatus}
                          </span>
                        </div>

                        {/* Payment Update Action Buttons */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handlePaymentStatusChange(order, 'Payment Confirmed')}
                            className={`py-1 px-2 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                              paymentStatus === 'Payment Confirmed'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            Confirm Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePaymentStatusChange(order, 'Payment Pending')}
                            className={`py-1 px-2 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                              paymentStatus === 'Payment Pending'
                                ? 'bg-amber-600 text-white'
                                : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50'
                            }`}
                          >
                            Pending
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePaymentStatusChange(order, 'Payment Rejected')}
                            className={`py-1 px-2 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                              paymentStatus === 'Payment Rejected'
                                ? 'bg-rose-600 text-white'
                                : 'bg-white text-rose-700 border border-rose-300 hover:bg-rose-50'
                            }`}
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      {/* Order Status & Detail Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">Order:</span>
                          <select
                            value={order.orderStatus === 'Payment Pending' ? 'Pending' : (order.orderStatus || 'Pending')}
                            onChange={(e) => handleOrderStatusChange(order, e.target.value)}
                            className="bg-white border border-gray-300 text-xs font-semibold rounded-lg px-2 py-1 text-gray-800 focus:outline-hidden"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed" disabled={!isConfirmedPaid}>
                              Confirmed {!isConfirmedPaid ? '(Pay first)' : ''}
                            </option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(order)}
                            disabled={downloadingOrderNumber === order.orderNumber}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setOrderToPrint(order)}
                            className="p-1 text-gray-500 hover:text-gray-800 rounded-lg transition cursor-pointer"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table (hidden md:table) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3.5">Order #</th>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Customer & Phone</th>
                      <th className="px-4 py-3.5">Items</th>
                      <th className="px-4 py-3.5">Total</th>
                      <th className="px-4 py-3.5">Payment Method</th>
                      <th className="px-4 py-3.5">Payment Status</th>
                      <th className="px-4 py-3.5">Order Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => {
                      const paymentStatus = getNormalizedPaymentStatus(order.paymentStatus);
                      const isConfirmedPaid = paymentStatus === 'Payment Confirmed';
                      const currentOrderStatus = order.orderStatus || 'Payment Pending';

                      return (
                        <tr
                          key={order.orderNumber}
                          className="hover:bg-gray-50/70 transition"
                        >
                          {/* Order Number */}
                          <td className="px-4 py-3.5 font-mono font-bold text-gray-900">
                            #{order.orderNumber}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                            {order.orderDate}
                          </td>

                          {/* Customer & Phone with Click-to-Call */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-gray-900">{order.customerName}</div>
                            <a
                              href={`tel:${order.mobileNumber}`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:underline mt-0.5"
                              title="Click to Call Customer"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{order.mobileNumber}</span>
                            </a>
                            <div className="text-[10px] text-gray-400 truncate max-w-[150px]">
                              {order.district}
                            </div>
                          </td>

                          {/* Items Count */}
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-gray-800">
                              {order.quantities} pcs
                            </span>
                            <span className="text-[11px] text-gray-400 block">
                              ({order.products.length} {order.products.length === 1 ? 'item' : 'items'})
                            </span>
                          </td>

                          {/* Total */}
                          <td className="px-4 py-3.5 font-extrabold text-emerald-700 text-sm whitespace-nowrap">
                            ৳{order.totalAmount.toLocaleString('en-US')}
                          </td>

                          {/* Payment Method */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {order.paymentMethod || 'bKash'}
                            </span>
                          </td>

                          {/* Payment Status with Quick Manual Update */}
                          <td className="px-4 py-3.5">
                            <div className="space-y-1.5">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  paymentStatus === 'Payment Confirmed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : paymentStatus === 'Payment Rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {paymentStatus}
                              </span>

                              <div className="flex items-center gap-1">
                                <select
                                  id={`select-payment-status-${order.orderNumber}`}
                                  value={paymentStatus}
                                  onChange={(e) =>
                                    handlePaymentStatusChange(order, e.target.value as PaymentStatus)
                                  }
                                  className="text-[10px] bg-white border border-gray-300 rounded px-1.5 py-0.5 text-gray-700 font-medium focus:outline-hidden"
                                >
                                  <option value="Payment Pending">Payment Pending</option>
                                  <option value="Payment Confirmed">Payment Confirmed</option>
                                  <option value="Payment Rejected">Payment Rejected</option>
                                </select>
                              </div>
                            </div>
                          </td>

                          {/* Order Status */}
                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              <select
                                id={`select-order-status-${order.orderNumber}`}
                                value={currentOrderStatus === 'Payment Pending' ? 'Pending' : currentOrderStatus}
                                onChange={(e) => handleOrderStatusChange(order, e.target.value)}
                                className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition focus:outline-hidden ${
                                  currentOrderStatus === 'Confirmed'
                                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                                    : currentOrderStatus === 'Delivered'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                    : currentOrderStatus === 'Cancelled'
                                    ? 'bg-gray-100 border-gray-300 text-gray-700'
                                    : 'bg-amber-50 border-amber-300 text-amber-800'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed" disabled={!isConfirmedPaid}>
                                  Confirmed {!isConfirmedPaid ? '(Confirm payment first)' : ''}
                                </option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

                              {!isConfirmedPaid && currentOrderStatus !== 'Confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmPaymentAndOrder(order)}
                                  className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold block hover:underline cursor-pointer"
                                >
                                  ✓ Confirm Payment & Order
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                id={`btn-view-order-${order.orderNumber}`}
                                onClick={() => setSelectedOrder(order)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-xs transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-500" />
                                <span>Details</span>
                              </button>

                              <button
                                id={`btn-download-pdf-${order.orderNumber}`}
                                type="button"
                                onClick={() => handleDownloadPdf(order)}
                                disabled={downloadingOrderNumber === order.orderNumber}
                                className="p-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              <button
                                id={`btn-print-order-${order.orderNumber}`}
                                onClick={() => setOrderToPrint(order)}
                                className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                                title="Print Invoice"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Order Management
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 font-mono">
                  Order #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment & Order Status Control Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Manual Payment Status Control */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Payment Status (ম্যানুয়াল আপডেট)
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {(['Payment Pending', 'Payment Confirmed', 'Payment Rejected'] as const).map((pst) => (
                      <button
                        key={pst}
                        type="button"
                        onClick={() => handlePaymentStatusChange(selectedOrder, pst)}
                        className={`w-full py-1.5 px-3 rounded-lg font-bold text-left text-xs transition cursor-pointer flex items-center justify-between ${
                          getNormalizedPaymentStatus(selectedOrder.paymentStatus) === pst
                            ? pst === 'Payment Confirmed'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : pst === 'Payment Rejected'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span>{pst}</span>
                        {getNormalizedPaymentStatus(selectedOrder.paymentStatus) === pst && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Status Control */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Order Status
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((ost) => {
                      const currentModalStatus =
                        selectedOrder.orderStatus === 'Payment Pending' ? 'Pending' : (selectedOrder.orderStatus || 'Pending');
                      const isDisabled =
                        ost === 'Confirmed' &&
                        !isPaymentConfirmed(selectedOrder);

                      return (
                        <button
                          key={ost}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleOrderStatusChange(selectedOrder, ost)}
                          className={`w-full py-1.5 px-3 rounded-lg font-bold text-left text-xs transition cursor-pointer flex items-center justify-between ${
                            currentModalStatus === ost
                              ? 'bg-slate-900 text-white shadow-xs'
                              : isDisabled
                              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span>
                            {ost} {isDisabled ? '(Payment not confirmed)' : ''}
                          </span>
                          {currentModalStatus === ost && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {!isPaymentConfirmed(selectedOrder) && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-amber-800 font-medium">
                    Call customer to confirm payment: <strong>{selectedOrder.mobileNumber}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleConfirmPaymentAndOrder(selectedOrder)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                  >
                    Confirm Payment & Order
                  </button>
                </div>
              )}
            </div>

            {/* Customer Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Customer Information
                </span>
                <p className="font-bold text-gray-900 text-sm">{selectedOrder.customerName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={`tel:${selectedOrder.mobileNumber}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg hover:bg-emerald-100"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call: {selectedOrder.mobileNumber}</span>
                  </a>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Payment Method
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-300 shadow-2xs">
                  {selectedOrder.paymentMethod || 'bKash'}
                </span>
                <p className="text-gray-500 text-[11px] mt-1.5">
                  Status: <strong className="text-gray-800">{getNormalizedPaymentStatus(selectedOrder.paymentStatus)}</strong>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Delivery Destination
                </span>
                <p className="font-medium text-gray-800">{selectedOrder.address}</p>
                <p className="text-gray-600 font-semibold mt-0.5">{selectedOrder.district}</p>
              </div>
            </div>

            {/* Products List */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 uppercase tracking-wider flex justify-between">
                <span>Items ({selectedOrder.quantities} total pieces)</span>
                <span>Subtotal</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {selectedOrder.products.map((p, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-md object-cover border border-gray-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{p.name}</div>
                        {p.selectedOptions && Object.keys(p.selectedOptions).length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            {Object.entries(p.selectedOptions).map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-200"
                              >
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-gray-500 text-[11px] mt-0.5">
                          ৳{p.price.toLocaleString('en-US')} × {p.quantity} pcs
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      ৳{(p.price * p.quantity).toLocaleString('en-US')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    ৳{(selectedOrder.subtotal || getOrderSalesTotal(selectedOrder)).toLocaleString('en-US')}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-extrabold text-gray-900">
                  <span>Total Order Amount:</span>
                  <span className="text-emerald-700 text-base">
                    ৳{(selectedOrder.subtotal || getOrderSalesTotal(selectedOrder)).toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-details-download-pdf"
                  onClick={() => handleDownloadPdf(selectedOrder)}
                  disabled={downloadingOrderNumber === selectedOrder.orderNumber}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-70"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloadingOrderNumber === selectedOrder.orderNumber ? 'Generating PDF...' : 'Download PDF'}
                  </span>
                </button>

                <button
                  type="button"
                  id="btn-details-print-order"
                  onClick={() => setOrderToPrint(selectedOrder)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs transition cursor-pointer border border-gray-300"
                >
                  <Printer className="w-4 h-4 text-gray-600" />
                  <span>Print Order</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print Preview Modal */}
      {orderToPrint && (
        <OrderInvoicePrint
          order={orderToPrint}
          settings={settings}
          isModalPreview={true}
          onClose={() => setOrderToPrint(null)}
        />
      )}
    </div>
  );
};
