import React, { useState, useMemo, useEffect } from 'react';
import { Header, CATEGORIES } from './components/Header';
import { Banner } from './components/Banner';
import { ProductCard } from './components/ProductCard';
import { ProductPage } from './components/ProductPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmationPage } from './components/OrderConfirmationPage';
import { Footer } from './components/Footer';
import { AdminProductManager } from './components/AdminProductManager';
import { AdminOrdersManager } from './components/AdminOrdersManager';
import { AdminSettingsManager } from './components/AdminSettingsManager';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLayout, AdminTab } from './components/AdminLayout';
import { AdminCategoriesManager } from './components/AdminCategoriesManager';
import { AdminLoginPage } from './components/AdminLoginPage';
import { QuickContactButtons } from './components/QuickContactButtons';
import { OrderProductSelectionModal } from './components/OrderProductSelectionModal';
import { DEMO_PRODUCTS } from './data/products';
import { CategoryType, Product, CartItem, Order, StoreSettings, DEFAULT_STORE_SETTINGS, Category, DEFAULT_CATEGORIES, PaymentStatus } from './types';
import { getMinOrderQuantity, getCategoryBanglaName, getCategoryDisplayName } from './utils/productUtils';
import { isAdminAuthenticated, logoutAdmin, verifyAdminSession } from './utils/adminAuth';
import {
  fetchStoreSettings,
  saveStoreSettingsApi,
  fetchCategoriesApi,
  saveCategoriesApi,
  fetchProductsApi,
  saveProductsApi,
  fetchOrdersApi,
  createOrderApi,
  updateOrderApi,
  deleteOrderApi,
} from './utils/apiClient';
import { useLanguage } from './context/LanguageContext';
import { Sparkles, Flame, Grid, X } from 'lucide-react';

const STORAGE_KEY = 'china_direct_products_catalog';
const ORDERS_STORAGE_KEY = 'china_direct_orders_catalog';
const SETTINGS_STORAGE_KEY = 'china_direct_store_settings';
const CATEGORIES_STORAGE_KEY = 'china_direct_categories_catalog';

const SAVE_FAILED_MESSAGE =
  'Could not save to the server. Please check your internet connection or log in again, then try once more.';

/** Keeps order totals consistent (delivery is free, total equals subtotal). */
function normalizeOrder(o: Order): Order {
  return {
    ...o,
    deliveryCharge: 0,
    totalAmount:
      typeof o.subtotal === 'number' && o.subtotal > 0
        ? o.subtotal
        : o.products?.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0) ||
          o.totalAmount,
  };
}

// Sample orders kept for reference only. Real orders now come from the server.
const DEMO_ORDERS: Order[] = [
  {
    orderNumber: 'BD-100234',
    orderDate: '2025-05-14',
    customerName: 'Md. Rafiqul Islam',
    mobileNumber: '01712345678',
    district: 'Dhaka',
    address: 'House 14, Road 5, Dhanmondi',
    products: [
      {
        productId: 'prod-1',
        name: '20W Fast Charger with Type-C Cable',
        price: 699,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
      },
      {
        productId: 'prod-2',
        name: 'Wireless Bluetooth Earbuds Pro with Noise Reduction',
        price: 1250,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
      },
    ],
    quantities: 2,
    subtotal: 1949,
    deliveryCharge: 0,
    totalAmount: 1949,
    paymentMethod: 'bKash',
    paymentStatus: 'Payment Pending',
    senderNumber: '01712345678',
    transactionId: 'BK9X2801LA',
    orderStatus: 'Pending',
  },
  {
    orderNumber: 'BD-100235',
    orderDate: '2025-05-13',
    customerName: 'Nusrat Jahan',
    mobileNumber: '01898765432',
    district: 'Chattogram',
    address: 'GEC Circle, Nasirabad, Chattogram',
    products: [
      {
        productId: 'prod-4',
        name: 'Casual Canvas Lightweight Sneakers',
        price: 1250,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
      },
    ],
    quantities: 1,
    subtotal: 1250,
    deliveryCharge: 0,
    totalAmount: 1250,
    paymentMethod: 'Nagad',
    paymentStatus: 'Payment Confirmed',
    senderNumber: '01898765432',
    transactionId: 'NG77M912PQ',
    orderStatus: 'Confirmed',
  },
  {
    orderNumber: 'BD-100236',
    orderDate: '2025-05-12',
    customerName: 'Tanvir Ahmed',
    mobileNumber: '01911223344',
    district: 'Sylhet',
    address: 'Zindabazar, Amberkhana Road, Sylhet',
    products: [
      {
        productId: 'prod-14',
        name: 'Portable USB Electric Mini Food & Garlic Chopper',
        price: 590,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=800&auto=format&fit=crop&q=80',
      },
    ],
    quantities: 2,
    subtotal: 1180,
    deliveryCharge: 0,
    totalAmount: 1180,
    paymentMethod: 'Rocket',
    paymentStatus: 'Payment Confirmed',
    senderNumber: '01911223344',
    transactionId: 'RK54128892',
    orderStatus: 'Delivered',
  },
  {
    orderNumber: 'BD-100237',
    orderDate: '2025-05-11',
    customerName: 'Sharmin Akter',
    mobileNumber: '01677889900',
    district: 'Dhaka',
    address: 'Sector 4, Uttara, Dhaka',
    products: [
      {
        productId: 'prod-3',
        name: 'Ultra Thin Smart Watch Series 9 with Heart Rate',
        price: 1850,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
      },
    ],
    quantities: 1,
    subtotal: 1850,
    deliveryCharge: 0,
    totalAmount: 1850,
    paymentMethod: 'bKash',
    paymentStatus: 'Payment Pending',
    senderNumber: '01677889900',
    transactionId: 'BK3399A8BC',
    orderStatus: 'Pending',
  },
];

export type AdminRoute = 'dashboard' | 'products' | 'categories' | 'orders' | 'settings' | 'login' | null;

export default function App() {
  const { language, t } = useLanguage();

  // Admin Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminAuthenticated());
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);
  const [intendedAdminRoute, setIntendedAdminRoute] = useState<AdminTab>('dashboard');

  // Routing: /admin, /admin/products, /admin/categories, /admin/orders, /admin/settings, /admin/login or store
  const [adminRoute, setAdminRoute] = useState<AdminRoute>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const authenticated = isAdminAuthenticated();

      if (path === '/admin/login') {
        if (authenticated) {
          window.history.replaceState(null, '', '/admin');
          return 'dashboard';
        }
        return 'login';
      }

      if (path.startsWith('/admin')) {
        if (!authenticated) {
          window.history.replaceState(null, '', '/admin/login');
          return 'login';
        }
        if (path.startsWith('/admin/settings')) return 'settings';
        if (path.startsWith('/admin/orders')) return 'orders';
        if (path.startsWith('/admin/categories')) return 'categories';
        if (path.startsWith('/admin/products')) return 'products';
        return 'dashboard';
      }
    }
    return null;
  });

  // Store Settings State with LocalStorage Persistence
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STORE_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Dynamic products state initialized from localStorage or DEMO_PRODUCTS
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load products from localStorage', e);
    }
    return DEMO_PRODUCTS;
  });

  // Persist products state whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const authenticated = isAdminAuthenticated();
      setIsAuthenticated(authenticated);

      if (path === '/admin/login') {
        if (authenticated) {
          window.history.replaceState(null, '', '/admin');
          setAdminRoute('dashboard');
        } else {
          setAdminRoute('login');
        }
      } else if (path.startsWith('/admin')) {
        if (!authenticated) {
          window.history.replaceState(null, '', '/admin/login');
          setRedirectNotice('Please sign in with your admin credentials to access this page.');
          setAdminRoute('login');
        } else {
          setRedirectNotice(null);
          if (path.startsWith('/admin/settings')) {
            setAdminRoute('settings');
          } else if (path.startsWith('/admin/orders')) {
            setAdminRoute('orders');
          } else if (path.startsWith('/admin/categories')) {
            setAdminRoute('categories');
          } else if (path.startsWith('/admin/products')) {
            setAdminRoute('products');
          } else {
            setAdminRoute('dashboard');
          }
        }
      } else {
        setAdminRoute(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Periodic and on-mount verification of admin session
  useEffect(() => {
    if (adminRoute && adminRoute !== 'login') {
      verifyAdminSession().then((isValid) => {
        setIsAuthenticated(isValid);
        if (!isValid) {
          window.history.replaceState(null, '', '/admin/login');
          setRedirectNotice('Your admin session has expired. Please log in again.');
          setAdminRoute('login');
        }
      });
    }
  }, [adminRoute]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All Products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'checkout' | 'confirmation'>('home');
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  // Order Now - Product Selection Modal State
  const [isOrderSelectionOpen, setIsOrderSelectionOpen] = useState(false);
  const [orderSelectionProduct, setOrderSelectionProduct] = useState<Product | null>(null);
  const [orderSelectionInitialQty, setOrderSelectionInitialQty] = useState<number | undefined>(undefined);
  const [orderSelectionInitialOptions, setOrderSelectionInitialOptions] = useState<Record<string, string> | undefined>(undefined);

  // Category filter / add product trigger when navigating from dashboard or categories view
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('All');
  const [adminOpenAdd, setAdminOpenAdd] = useState<boolean>(false);

  // Orders live on the server only (they hold customer details), loaded for logged-in admins.
  const [orders, setOrders] = useState<Order[]>([]);

  // Remove orders cached by the old browser-only version of the app.
  useEffect(() => {
    try {
      localStorage.removeItem(ORDERS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Load orders from the server whenever an admin page is opened.
  useEffect(() => {
    if (!isAuthenticated || !adminRoute || adminRoute === 'login') return;
    let cancelled = false;
    const load = () =>
      fetchOrdersApi().then((list) => {
        if (!cancelled && Array.isArray(list)) setOrders(list.map(normalizeOrder));
      });
    load();
    // Pick up new customer orders while the admin panel stays open.
    const timer = window.setInterval(load, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isAuthenticated, adminRoute]);

  // Categories State with LocalStorage Persistence
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load categories from localStorage', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Persist categories whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage', e);
    }
  }, [categories]);

  // The server is the source of truth. The browser copy above only makes the first paint fast.
  useEffect(() => {
    let cancelled = false;
    fetchStoreSettings().then((s) => {
      if (!cancelled && s && typeof s === 'object') setSettings({ ...DEFAULT_STORE_SETTINGS, ...s });
    });
    fetchCategoriesApi().then((list) => {
      if (!cancelled && Array.isArray(list) && list.length > 0) setCategories(list);
    });
    fetchProductsApi().then((list) => {
      if (!cancelled && Array.isArray(list)) setProducts(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Updates products on screen and saves the whole list to the server. */
  const commitProducts = (next: Product[]) => {
    setProducts(next);
    saveProductsApi(next).then((saved) => {
      if (!saved) window.alert(SAVE_FAILED_MESSAGE);
    });
  };

  /** Updates categories on screen and saves the whole list to the server. */
  const commitCategories = (next: Category[]) => {
    setCategories(next);
    saveCategoriesApi(next).then((saved) => {
      if (!saved) window.alert(SAVE_FAILED_MESSAGE);
    });
  };

  // Active Category Names for Navigation (Customer + Admin)
  const activeCategoryNames = useMemo(() => {
    const list = categories.filter((c) => c.isActive).map((c) => c.name);
    return ['All Products', ...list];
  }, [categories]);

  // Category Actions
  const handleAddCategory = (newCat: { name: string; image?: string; isActive?: boolean }) => {
    const createdCategory: Category = {
      id: 'cat-' + Date.now(),
      name: newCat.name.trim(),
      image: newCat.image,
      isActive: newCat.isActive ?? true,
    };
    commitCategories([...categories, createdCategory]);
  };

  const handleEditCategory = (
    id: string,
    updated: { name: string; image?: string; isActive?: boolean }
  ) => {
    const oldCat = categories.find((c) => c.id === id);
    const oldName = oldCat?.name;
    const newName = updated.name.trim();

    commitCategories(
      categories.map((c) => (c.id === id ? { ...c, ...updated, name: newName } : c))
    );

    // If category name changed, update products that had the old category name to keep them in sync
    if (oldName && oldName !== newName) {
      commitProducts(
        products.map((p) => (p.category === oldName ? { ...p, category: newName } : p))
      );
    }
  };

  const handleToggleCategoryActive = (id: string) => {
    commitCategories(
      categories.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDeleteCategory = (id: string) => {
    // Delete the category from categories state. Existing products remain safe!
    commitCategories(categories.filter((c) => c.id !== id));
  };

  // Protected navigation helper for Admin
  const navigateToAdminProtected = (
    targetTab: AdminTab,
    path: string,
    categoryFilter?: string,
    openAdd?: boolean
  ) => {
    const authenticated = isAdminAuthenticated();
    if (!authenticated) {
      setIntendedAdminRoute(targetTab);
      const tabName =
        targetTab === 'dashboard'
          ? 'the Admin Dashboard'
          : targetTab === 'orders'
          ? 'Orders & Payment Management'
          : targetTab === 'products'
          ? 'Product Catalog Management'
          : targetTab === 'categories'
          ? 'Categories Management'
          : 'Store Settings';
      setRedirectNotice(`Please sign in with your admin credentials to access ${tabName}.`);
      window.history.pushState(null, '', '/admin/login');
      setAdminRoute('login');
      setSelectedProduct(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.history.pushState(null, '', path);
    if (categoryFilter !== undefined) setAdminCategoryFilter(categoryFilter);
    if (openAdd !== undefined) setAdminOpenAdd(openAdd);
    setAdminRoute(targetTab);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdminDashboard = () => {
    navigateToAdminProtected('dashboard', '/admin');
  };

  const handleOpenAdmin = (categoryFilter?: string, openAdd?: boolean) => {
    navigateToAdminProtected('products', '/admin/products', categoryFilter || 'All', Boolean(openAdd));
  };

  const handleOpenAdminCategories = () => {
    navigateToAdminProtected('categories', '/admin/categories');
  };

  const handleOpenAdminOrders = () => {
    navigateToAdminProtected('orders', '/admin/orders');
  };

  const handleOpenAdminSettings = () => {
    navigateToAdminProtected('settings', '/admin/settings');
  };

  const handleAdminNavigate = (tab: AdminTab) => {
    if (tab === 'dashboard') handleOpenAdminDashboard();
    else if (tab === 'products') handleOpenAdmin();
    else if (tab === 'categories') handleOpenAdminCategories();
    else if (tab === 'orders') handleOpenAdminOrders();
    else if (tab === 'settings') handleOpenAdminSettings();
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setRedirectNotice(null);
    const target = intendedAdminRoute || 'dashboard';

    const pathMap: Record<AdminTab, string> = {
      dashboard: '/admin',
      products: '/admin/products',
      categories: '/admin/categories',
      orders: '/admin/orders',
      settings: '/admin/settings',
    };

    const targetPath = pathMap[target] || '/admin';
    window.history.pushState(null, '', targetPath);
    setAdminRoute(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setRedirectNotice('You have been logged out successfully.');
    window.history.pushState(null, '', '/admin/login');
    setAdminRoute('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveStoreSettingsApi(newSettings).then((saved) => {
      if (!saved) window.alert(SAVE_FAILED_MESSAGE);
    });
  };

  const handleBackToStore = () => {
    window.history.pushState(null, '', '/');
    setAdminRoute(null);
    setRedirectNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Order Actions (Admin & Customer)
  // The server applies the stock rules (deduct while payment is confirmed and the
  // order is not cancelled, restore otherwise) and returns the updated order and products.
  const applyOrderUpdateOnServer = async (
    orderNumber: string,
    updates: { orderStatus?: string; paymentStatus?: PaymentStatus }
  ) => {
    const result = await updateOrderApi(orderNumber, updates);
    if (!result || !result.success || !result.order) {
      window.alert(SAVE_FAILED_MESSAGE);
      return;
    }
    const updatedOrder = normalizeOrder(result.order);
    setOrders((prev) => prev.map((o) => (o.orderNumber === orderNumber ? updatedOrder : o)));
    if (Array.isArray(result.products)) setProducts(result.products);
  };

  const handleUpdateOrderStatus = (orderNumber: string, newStatus: string) => {
    if (!orders.some((o) => o.orderNumber === orderNumber)) return;
    void applyOrderUpdateOnServer(orderNumber, { orderStatus: newStatus });
  };

  const handleUpdatePaymentStatus = (orderNumber: string, newPaymentStatus: PaymentStatus) => {
    if (!orders.some((o) => o.orderNumber === orderNumber)) return;
    void applyOrderUpdateOnServer(orderNumber, { paymentStatus: newPaymentStatus });
  };

  const handleDeleteOrder = async (orderNumber: string) => {
    const result = await deleteOrderApi(orderNumber);
    if (!result || !result.success) {
      window.alert(SAVE_FAILED_MESSAGE);
      return;
    }
    setOrders((prev) => prev.filter((o) => o.orderNumber !== orderNumber));
    if (Array.isArray(result.products)) setProducts(result.products);
  };

  const handlePlaceOrder = async (newOrder: Order) => {
    const finalOrder: Order = {
      ...newOrder,
      orderStatus: 'Payment Pending',
      paymentStatus: 'Payment Pending',
    };
    const result = await createOrderApi(finalOrder);
    if (!result || !result.success) {
      window.alert(
        'Your order could not be sent. Please check your internet connection and try again, or contact us on WhatsApp.'
      );
      return;
    }
    const savedOrder = normalizeOrder(result.order || finalOrder);
    if (isAuthenticated) setOrders((prev) => [savedOrder, ...prev]);
    setLatestOrder(savedOrder);
    setCheckoutItems([]);
    setCurrentPage('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Actions
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const created: Product = {
      ...newProd,
      id: 'prod-' + Date.now(),
    };
    commitProducts([created, ...products]);
  };

  const handleEditProduct = (id: string, updated: Omit<Product, 'id'>) => {
    commitProducts(products.map((p) => (p.id === id ? { ...updated, id } : p)));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct({ ...updated, id });
    }
  };

  const handleDeleteProduct = (id: string) => {
    commitProducts(products.filter((p) => p.id !== id));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }
  };

  const handleResetToDemo = () => {
    commitProducts(DEMO_PRODUCTS);
  };

  // Filtered products based on search & category from dynamic products state
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All Products' || product.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase().trim());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Featured products from dynamic products state
  const featuredProducts = useMemo(() => {
    const featured = products.filter((p) => p.isFeatured);
    return featured.length > 0 ? featured : products.slice(0, 4);
  }, [products]);

  // New products from dynamic products state
  const newProducts = useMemo(() => {
    const newest = products.filter((p) => p.isNew);
    return newest.length > 0 ? newest : products.slice(0, 4);
  }, [products]);

  // "Order Now" Handler - Opens product selection before checkout
  const handleOrderNow = (
    product: Product,
    quantity?: number,
    selectedOptions?: Record<string, string>
  ) => {
    setOrderSelectionProduct(product);
    setOrderSelectionInitialQty(quantity);
    setOrderSelectionInitialOptions(selectedOptions);
    setIsOrderSelectionOpen(true);
  };

  const handleContinueToCheckout = (
    product: Product,
    quantity: number,
    selectedOptions?: Record<string, string>
  ) => {
    setIsOrderSelectionOpen(false);
    setOrderSelectionProduct(null);
    setOrderSelectionInitialQty(undefined);
    setOrderSelectionInitialOptions(undefined);
    setCheckoutItems([{ product, quantity, selectedOptions }]);
    setSelectedProduct(null);
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View Product details
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to homepage
  const handleGoHome = () => {
    setSelectedProduct(null);
    setCurrentPage('home');
    if (adminRoute !== null) {
      handleBackToStore();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Admin Login View (/admin/login)
  if (adminRoute === 'login') {
    return (
      <AdminLoginPage
        settings={settings}
        onLoginSuccess={handleLoginSuccess}
        onBackToStore={handleBackToStore}
        redirectNotice={redirectNotice}
      />
    );
  }

  // If in Admin View (/admin, /admin/products, /admin/categories, /admin/orders, /admin/settings), render AdminLayout
  if (adminRoute) {
    const pendingOrdersCount = orders.filter(
      (o) =>
        (o.orderStatus || '').toLowerCase().includes('pending') ||
        (o.orderStatus || '').toLowerCase().includes('verification') ||
        (o.paymentStatus || '').toLowerCase().includes('verification')
    ).length;

    return (
      <AdminLayout
        activeTab={adminRoute}
        onNavigate={handleAdminNavigate}
        onBackToStore={handleBackToStore}
        onLogout={handleLogout}
        pendingOrdersCount={pendingOrdersCount}
        settings={settings}
      >
        {adminRoute === 'dashboard' && (
          <AdminDashboard
            products={products}
            orders={orders}
            settings={settings}
            onNavigateToProducts={() => handleOpenAdmin()}
            onNavigateToAddProduct={() => handleOpenAdmin('All', true)}
            onNavigateToOrders={handleOpenAdminOrders}
            onNavigateToCategories={handleOpenAdminCategories}
            onNavigateToSettings={handleOpenAdminSettings}
            onViewProduct={(prod) => {
              handleOpenAdmin(prod.category);
            }}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
          />
        )}

        {adminRoute === 'products' && (
          <AdminProductManager
            products={products}
            orders={orders}
            categories={categories}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetToDemo={handleResetToDemo}
            onBackToStore={handleBackToStore}
            onNavigateToDashboard={handleOpenAdminDashboard}
            onNavigateToCategories={handleOpenAdminCategories}
            onNavigateToOrders={handleOpenAdminOrders}
            onNavigateToSettings={handleOpenAdminSettings}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            initialCategoryFilter={adminCategoryFilter}
            initialOpenAdd={adminOpenAdd}
            hideTopNav={true}
          />
        )}

        {adminRoute === 'categories' && (
          <AdminCategoriesManager
            categories={categories}
            products={products}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onToggleCategoryActive={handleToggleCategoryActive}
            onDeleteCategory={handleDeleteCategory}
            onSelectCategory={(cat) => handleOpenAdmin(cat)}
            onAddProductInCategory={(cat) => handleOpenAdmin(cat, true)}
            onNavigateToProducts={() => handleOpenAdmin()}
          />
        )}

        {adminRoute === 'orders' && (
          <AdminOrdersManager
            orders={orders}
            settings={settings}
            onUpdateOrderStatus={(orderNum, newStatus) =>
              handleUpdateOrderStatus(orderNum, newStatus)
            }
            onUpdatePaymentStatus={(orderNum, newPaymentStatus) =>
              handleUpdatePaymentStatus(orderNum, newPaymentStatus)
            }
            onNavigateToProducts={() => handleOpenAdmin()}
            onNavigateToSettings={handleOpenAdminSettings}
            onNavigateToDashboard={handleOpenAdminDashboard}
            onNavigateToCategories={handleOpenAdminCategories}
            onBackToStore={handleBackToStore}
            hideTopNav={true}
          />
        )}

        {adminRoute === 'settings' && (
          <AdminSettingsManager
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onNavigateToProducts={() => handleOpenAdmin()}
            onNavigateToOrders={handleOpenAdminOrders}
            onNavigateToDashboard={handleOpenAdminDashboard}
            onNavigateToCategories={handleOpenAdminCategories}
            onBackToStore={handleBackToStore}
            hideTopNav={true}
          />
        )}
      </AdminLayout>
    );
  }

  const isFiltering = searchQuery.trim() !== '' || selectedCategory !== 'All Products';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (selectedProduct) setSelectedProduct(null);
          if (currentPage !== 'home') setCurrentPage('home');
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (selectedProduct) setSelectedProduct(null);
          if (currentPage !== 'home') setCurrentPage('home');
        }}
        onGoHome={handleGoHome}
        onOpenAdminDashboard={handleOpenAdminDashboard}
        onOpenAdmin={handleOpenAdmin}
        onOpenAdminOrders={handleOpenAdminOrders}
        onOpenAdminCategories={handleOpenAdminCategories}
        onOpenAdminSettings={handleOpenAdminSettings}
        settings={settings}
        categories={activeCategoryNames}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6">
        {selectedProduct ? (
          /* Single Product Page View */
          <ProductPage
            product={selectedProduct}
            onBack={handleGoHome}
            onOrderNow={(prod, qty, opts) => handleOrderNow(prod, qty, opts)}
            settings={settings}
          />
        ) : currentPage === 'checkout' ? (
          /* Checkout Page */
          <CheckoutPage
            items={checkoutItems}
            settings={settings}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onContinueShopping={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'confirmation' && latestOrder ? (
          /* Order Confirmation Page */
          <OrderConfirmationPage
            order={latestOrder}
            settings={settings}
            onContinueShopping={() => {
              setCurrentPage('home');
              setLatestOrder(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          /* Homepage View */
          <div className="space-y-8">
            {/* Banner (Shown on Homepage when not actively filtering) */}
            {!isFiltering && (
              <Banner
                onBrowseClick={() => {
                  const element = document.getElementById('all-products-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* If actively searching or filtering by category */}
            {isFiltering ? (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedCategory !== 'All Products'
                        ? getCategoryDisplayName(selectedCategory, language)
                        : t('খোঁজার ফলাফল', 'Search Results')}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {language === 'bn'
                        ? `${filteredProducts.length} টি পণ্য পাওয়া গেছে${searchQuery ? ` ("${searchQuery}" এর জন্য)` : ''}`
                        : `${filteredProducts.length} product(s) found${searchQuery ? ` for "${searchQuery}"` : ''}`}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Products');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-rose-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t('ফিল্টার মুছুন', 'Clear Filter')}
                  </button>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <p className="text-base font-semibold text-gray-800 mb-1">
                      {t('কোনো পণ্য পাওয়া যায়নি', 'No products found')}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      {t(
                        'ভিন্ন কোনো পণ্যের নাম লিখে খুঁজুন অথবা অন্য কোনো ক্যাটাগরি বেছে নিন।',
                        'Try searching for a different keyword or select another category.'
                      )}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All Products');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      {t('সকল পণ্য দেখুন', 'View All Products')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onViewProduct={handleViewProduct}
                        onOrderNow={(prod) => handleOrderNow(prod)}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              /* Standard Homepage Sections */
              <>
                {/* Featured Products */}
                <section id="featured-products-section" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                          {t('জনপ্রিয় হট পণ্য', 'Hot & Featured Products')}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {t(
                            'বাংলাদেশে সর্বাধিক বিক্রিত ও উচ্চ চাহিদাসম্পন্ন সরাসরি আমদানিকৃত পণ্য',
                            'Directly imported bestsellers and high-demand items in Bangladesh'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                    {featuredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onViewProduct={handleViewProduct}
                        onOrderNow={(prod) => handleOrderNow(prod)}
                      />
                    ))}
                  </div>
                </section>

                {/* New Products */}
                <section id="new-products-section" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                          {t('নতুন আমদানি করা কালেকশন', 'New Arrivals')}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {t(
                            'চীন ফ্যাক্টরি থেকে সরাসরি আমদানিকৃত এই সপ্তাহের নতুন আইটেম',
                            'Fresh arrivals this week direct from Chinese factories'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                    {newProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onViewProduct={handleViewProduct}
                        onOrderNow={(prod) => handleOrderNow(prod)}
                      />
                    ))}
                  </div>
                </section>

                {/* All Products Section */}
                <section id="all-products-section" className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                      <Grid className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                        {t('সকল আমদানিকৃত পণ্য', 'All Imported Products')}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {t(
                          `বাংলাদেশে আমাদের স্টকে থাকা সকল পাইকারি পণ্য (${products.length} টি)`,
                          `All wholesale products available in our Bangladesh inventory (${products.length} items)`
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                    {products.map((product) => (
                      <ProductCard
                        key={`all-${product.id}`}
                        product={product}
                        onViewProduct={handleViewProduct}
                        onOrderNow={(prod) => handleOrderNow(prod)}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </main>

      {/* Floating Quick Contact Buttons (Call, WhatsApp, Facebook) */}
      <QuickContactButtons settings={settings} />

      {/* Order Now - Product Selection Modal before Checkout */}
      {isOrderSelectionOpen && orderSelectionProduct && (
        <OrderProductSelectionModal
          isOpen={isOrderSelectionOpen}
          onClose={() => {
            setIsOrderSelectionOpen(false);
            setOrderSelectionProduct(null);
            setOrderSelectionInitialQty(undefined);
            setOrderSelectionInitialOptions(undefined);
          }}
          product={orderSelectionProduct}
          allProducts={products}
          initialQuantity={orderSelectionInitialQty}
          initialOptions={orderSelectionInitialOptions}
          onContinueToOrder={handleContinueToCheckout}
        />
      )}

      {/* Footer */}
      <Footer
        categories={activeCategoryNames}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedProduct(null);
          setCurrentPage('home');
        }}
        onOpenAdminDashboard={handleOpenAdminDashboard}
        onOpenAdmin={handleOpenAdmin}
        onOpenAdminOrders={handleOpenAdminOrders}
        onOpenAdminCategories={handleOpenAdminCategories}
        onOpenAdminSettings={handleOpenAdminSettings}
        settings={settings}
      />
    </div>
  );
}
