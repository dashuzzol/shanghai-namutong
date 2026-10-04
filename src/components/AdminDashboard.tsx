import React, { useState } from 'react';
import {
  Package,
  ClipboardList,
  Clock,
  CheckCircle2,
  Banknote,
  Plus,
  Layers,
  Settings,
  ArrowRight,
  Eye,
  AlertTriangle,
  X,
  Phone,
  MapPin,
  Calendar,
  Truck,
  Check,
  Printer,
  Download,
} from 'lucide-react';
import { Product, Order, StoreSettings, PaymentStatus } from '../types';
import { OrderInvoicePrint } from './OrderInvoicePrint';
import { generateOrderPdf } from '../utils/generateOrderPdf';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  settings?: StoreSettings;
  onNavigateToProducts: () => void;
  onNavigateToAddProduct: () => void;
  onNavigateToOrders: () => void;
  onNavigateToCategories: () => void;
  onNavigateToSettings: () => void;
  onViewProduct?: (product: Product) => void;
  onUpdateOrderStatus?: (orderNumber: string, newStatus: string) => void;
  onUpdatePaymentStatus?: (orderNumber: string, newPaymentStatus: PaymentStatus) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  settings,
  onNavigateToProducts,
  onNavigateToAddProduct,
  onNavigateToOrders,
  onNavigateToCategories,
  onNavigateToSettings,
  onViewProduct,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async (order: Order) => {
    try {
      setIsDownloadingPdf(true);
      await generateOrderPdf(order, settings);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // 1. Calculations for 5 summary cards (using real data, defaulting to 0)
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => {
    const s = (o.orderStatus || '').toLowerCase();
    const p = (o.paymentStatus || '').toLowerCase();
    return s.includes('pending') || p.includes('pending') || s.includes('verification');
  }).length;
  const deliveredOrders = orders.filter(
    (o) => (o.orderStatus || '').toLowerCase() === 'delivered'
  ).length;

  // Calculate total sales from all orders in the system (Product Price × Quantity = Total Amount, excluding delivery charge)
  const getOrderSalesAmount = (o: Order) => {
    if (typeof o.subtotal === 'number' && o.subtotal > 0) return o.subtotal;
    const prodSum = o.products?.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);
    if (typeof prodSum === 'number' && prodSum > 0) return prodSum;
    const delivery = Number(o.deliveryCharge) || 0;
    return Math.max(0, (Number(o.totalAmount) || 0) - delivery);
  };
  const totalSales = orders.reduce((sum, o) => sum + getOrderSalesAmount(o), 0);

  // 2. Products stock counts
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  // 3. Low stock list for section 6 (products with stock <= 5, sorted by lowest stock first)
  const lowStockList = products
    .filter((p) => p.stock <= 5)
    .sort((a, b) => a.stock - b.stock);

  // 4. Recent 5 orders (latest first)
  const recentOrders = [...orders].slice(-5).reverse();

  const isOrderPaymentConfirmed = (order: Order) => {
    const ps = (order.paymentStatus || '').toLowerCase();
    return ps.includes('confirm') || ps === 'paid';
  };

  const handleStatusUpdate = (orderNumber: string, status: string) => {
    if (selectedOrder) {
      if (status === 'Confirmed' && !isOrderPaymentConfirmed(selectedOrder)) {
        alert('Payment must be confirmed before setting order to Confirmed.');
        return;
      }
    }
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderNumber, status);
    }
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder({
        ...selectedOrder,
        orderStatus: status,
      });
    }
  };

  const handlePaymentUpdate = (orderNumber: string, paymentStatus: PaymentStatus) => {
    if (onUpdatePaymentStatus) {
      onUpdatePaymentStatus(orderNumber, paymentStatus);
    }
    if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
      setSelectedOrder({
        ...selectedOrder,
        paymentStatus,
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Store overview, recent orders, inventory alerts & quick management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="dash-quick-add-product"
            onClick={onNavigateToAddProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          <button
            id="dash-quick-view-orders"
            onClick={onNavigateToOrders}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
          >
            <ClipboardList className="w-4 h-4 text-gray-500" />
            <span>Manage Orders</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: 5 SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Products */}
        <div
          id="summary-card-total-products"
          onClick={onNavigateToProducts}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs hover:border-emerald-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 tracking-wide">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {totalProducts}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1">
            <span>In catalog</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div
          id="summary-card-total-orders"
          onClick={onNavigateToOrders}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs hover:border-emerald-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 tracking-wide">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {totalOrders}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            <span>Customer orders</span>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div
          id="summary-card-pending-orders"
          onClick={onNavigateToOrders}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs hover:border-amber-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 tracking-wide">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {pendingOrders}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            <span>Needs confirmation</span>
          </div>
        </div>

        {/* Card 4: Delivered Orders */}
        <div
          id="summary-card-delivered-orders"
          onClick={onNavigateToOrders}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs hover:border-emerald-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 tracking-wide">
              Delivered Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {deliveredOrders}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            <span>Completed deliveries</span>
          </div>
        </div>

        {/* Card 5: Total Sales */}
        <div
          id="summary-card-total-sales"
          className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 tracking-wide">
              Total Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight truncate">
            ৳{totalSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            <span>Gross revenue</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: QUICK ACTIONS */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
          <button
            id="quick-action-add-product"
            onClick={onNavigateToAddProduct}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Add Product</div>
              <div className="text-[10px] text-gray-500">New item to store</div>
            </div>
          </button>

          <button
            id="quick-action-manage-products"
            onClick={onNavigateToProducts}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Manage Products</div>
              <div className="text-[10px] text-gray-500">{totalProducts} products</div>
            </div>
          </button>

          <button
            id="quick-action-manage-orders"
            onClick={onNavigateToOrders}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Manage Orders</div>
              <div className="text-[10px] text-gray-500">{totalOrders} orders</div>
            </div>
          </button>

          <button
            id="quick-action-categories"
            onClick={onNavigateToCategories}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Categories</div>
              <div className="text-[10px] text-gray-500">6 main categories</div>
            </div>
          </button>

          <button
            id="quick-action-settings"
            onClick={onNavigateToSettings}
            className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Settings</div>
              <div className="text-[10px] text-gray-500">Logo, phone, info</div>
            </div>
          </button>
        </div>
      </div>

      {/* TWO COLUMN SECTION: PRODUCTS SUMMARY + LOW STOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 3: PRODUCTS SUMMARY */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-gray-900">
                  Products Overview
                </h2>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                Catalog
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-medium text-gray-600">
                  Total Products
                </span>
                <span className="text-sm font-extrabold text-gray-900">
                  {totalProducts}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-medium text-amber-900">
                    Low Stock Products (≤ 5)
                  </span>
                </div>
                <span className="text-sm font-extrabold text-amber-700">
                  {lowStockProducts.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs font-medium text-rose-900">
                    Out of Stock Products (0)
                  </span>
                </div>
                <span className="text-sm font-extrabold text-rose-700">
                  {outOfStockProducts.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <button
              id="dash-btn-manage-products"
              onClick={onNavigateToProducts}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Manage Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SECTION 6: LOW STOCK PRODUCTS */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-gray-900">
                  Low Stock Inventory
                </h2>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">
                Rule: ≤ 5 Low Stock | 0 Out of Stock
              </span>
            </div>

            {lowStockList.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">
                  All products are well stocked!
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  No items currently have 5 or fewer units in inventory.
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>Product Name</span>
                  <div className="flex items-center gap-10 sm:gap-14">
                    <span>Stock</span>
                    <span className="w-12 text-right">Action</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 max-h-[220px] overflow-y-auto">
                  {lowStockList.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    return (
                      <div
                        key={product.id}
                        className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50/70 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-8 h-8 rounded-md object-cover border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-gray-900 truncate">
                              {product.name}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {product.category}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 sm:gap-10 shrink-0">
                          <div>
                            {isOutOfStock ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700">
                                0 (Out of Stock)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                                {product.stock} units (Low)
                              </span>
                            )}
                          </div>

                          <button
                            id={`low-stock-view-${product.id}`}
                            onClick={() => {
                              if (onViewProduct) {
                                onViewProduct(product);
                              } else {
                                onNavigateToProducts();
                              }
                            }}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer w-12 justify-end"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {lowStockList.length} items needing attention
            </span>
            <button
              onClick={onNavigateToProducts}
              className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
            >
              Update stock in Products →
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: RECENT ORDERS */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <span>Recent Orders (Latest 5)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest customer purchase requests and order statuses
            </p>
          </div>

          <button
            id="dash-btn-view-all-orders"
            onClick={onNavigateToOrders}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer self-start sm:self-auto"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <ClipboardList className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">No orders placed yet</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Customer orders will automatically appear here in real time.
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 min-w-[560px]">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Order Number</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const status = (order.orderStatus || 'Pending').toLowerCase();
                  return (
                    <tr
                      key={order.orderNumber}
                      className="hover:bg-gray-50/60 transition"
                    >
                      <td className="px-4 py-3 font-bold text-gray-900">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {order.customerName}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-emerald-700">
                        ৳{(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {status === 'delivered' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Delivered
                          </span>
                        ) : status === 'confirmed' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            Confirmed
                          </span>
                        ) : status === 'shipped' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            Shipped
                          </span>
                        ) : status === 'cancelled' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-medium">
                        {order.orderDate || 'Today'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          id={`dash-view-order-${order.orderNumber}`}
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-700 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Order Details
                </span>
                <h3 className="text-lg font-extrabold text-gray-900">
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

            <div className="py-4 space-y-4 text-xs">
              {/* Payment Status Selector */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Payment Status:</span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {selectedOrder.paymentStatus || 'Payment Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Payment Pending', 'Payment Confirmed', 'Payment Rejected'] as const).map((pst) => (
                    <button
                      key={pst}
                      type="button"
                      onClick={() => handlePaymentUpdate(selectedOrder.orderNumber, pst)}
                      className={`px-2 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer text-center ${
                        (selectedOrder.paymentStatus || 'Payment Pending') === pst
                          ? pst === 'Payment Confirmed'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : pst === 'Payment Rejected'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {pst === 'Payment Pending' ? 'Pending' : pst === 'Payment Confirmed' ? 'Confirmed' : 'Rejected'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Status Selector */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Order Status:</span>
                  <span className="text-[11px] font-bold text-gray-600">
                    {selectedOrder.orderStatus || 'Payment Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Payment Pending', 'Confirmed', 'Delivered'] as const).map((st) => {
                    const isDisabled = st === 'Confirmed' && !isOrderPaymentConfirmed(selectedOrder);
                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleStatusUpdate(selectedOrder.orderNumber, st)}
                        className={`px-2 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer text-center ${
                          (selectedOrder.orderStatus || 'Payment Pending') === st
                            ? 'bg-slate-900 text-white shadow-xs'
                            : isDisabled
                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {st === 'Payment Pending' ? 'Pending' : st}
                        {isDisabled && ' (Pay first)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-800 mb-1">Customer Information</div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-semibold">NAME</span>
                    <span className="font-bold text-gray-900">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-semibold">PHONE</span>
                    <a
                      href={`tel:${selectedOrder.mobileNumber}`}
                      className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {selectedOrder.mobileNumber}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-semibold">PAYMENT METHOD</span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block text-xs">
                      {selectedOrder.paymentMethod || 'bKash'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-semibold">PAYMENT STATUS</span>
                    <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block text-xs">
                      {selectedOrder.paymentStatus || 'Payment Pending'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[10px] font-semibold">DELIVERY ADDRESS</span>
                    <span className="font-medium text-gray-800">
                      {selectedOrder.address}, {selectedOrder.district}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <div className="font-bold text-gray-800 mb-2">
                  Items ({selectedOrder.products.length})
                </div>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {selectedOrder.products.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-md object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 truncate text-xs">{item.name}</div>
                          <div className="text-[10px] text-gray-500">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-bold text-emerald-700 shrink-0 text-xs">
                        ৳{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-800">৳{selectedOrder.subtotal || getOrderSalesAmount(selectedOrder)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total Amount:</span>
                  <span className="text-emerald-600">৳{selectedOrder.subtotal || getOrderSalesAmount(selectedOrder)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  id="btn-dash-download-pdf"
                  type="button"
                  onClick={() => handleDownloadPdf(selectedOrder)}
                  disabled={isDownloadingPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-70"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
                </button>
                <button
                  id="btn-dash-print-order"
                  type="button"
                  onClick={() => setOrderToPrint(selectedOrder)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition border border-gray-300 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-600" />
                  <span>Print Order</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    onNavigateToOrders();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
                >
                  Open in Full Orders Page →
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Order Invoice Preview Modal */}
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
