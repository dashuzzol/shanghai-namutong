import React, { useState, useMemo, useRef } from 'react';
import { Product, MainCategory, Order, Category, DEFAULT_CATEGORIES, ProductOption } from '../types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Search, 
  X, 
  AlertTriangle, 
  Check, 
  Image as ImageIcon,
  Package,
  Layers,
  RotateCcw,
  ClipboardList,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Settings,
  Upload,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  Star
} from 'lucide-react';
import { compressProductImage, compressMultipleProductImages } from '../utils/imageCompressor';

interface AdminProductManagerProps {
  products: Product[];
  orders?: Order[];
  categories?: Category[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (id: string, updated: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onResetToDemo: () => void;
  onBackToStore: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToCategories?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToSettings?: () => void;
  onUpdateOrderStatus?: (orderNumber: string, newStatus: string) => void;
  onDeleteOrder?: (orderNumber: string) => void;
  initialCategoryFilter?: string;
  initialOpenAdd?: boolean;
  hideTopNav?: boolean;
}

export const MAIN_CATEGORIES: MainCategory[] = [
  'Mobile & Electronics',
  'Clothing',
  'Shoes',
  'Kids & Toys',
  'Home & Kitchen',
  'Other Products',
];

const SAMPLE_IMAGE_PRESETS = [
  { label: '20W Fast Charger', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80' },
  { label: 'Wireless Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80' },
  { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80' },
  { label: 'Polo Shirt', url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' },
  { label: 'Kitchen Chopper', url: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Kids RC Car', url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sling Crossbody Bag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
];

export const AdminProductManager: React.FC<AdminProductManagerProps> = ({
  products,
  orders = [],
  categories = DEFAULT_CATEGORIES,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onResetToDemo,
  onBackToStore,
  onNavigateToDashboard,
  onNavigateToCategories,
  onNavigateToOrders,
  onNavigateToSettings,
  onUpdateOrderStatus,
  onDeleteOrder,
  initialCategoryFilter,
  initialOpenAdd,
  hideTopNav = false,
}) => {
  // Category resolution from Category Management
  const allCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const activeCategories = useMemo(
    () => allCategories.filter((c) => c.isActive).map((c) => c.name),
    [allCategories]
  );
  const safeActiveCategoryNames = activeCategories.length > 0 ? activeCategories : MAIN_CATEGORIES;

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>(initialCategoryFilter || 'All');
  
  // Orders filter & search
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(Boolean(initialOpenAdd));
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deletingOrderNumber, setDeletingOrderNumber] = useState<string | null>(null);

  // When adding: ONLY active categories. When editing: active + current (to keep existing products safe)
  const formCategoryOptions = useMemo(() => {
    if (editingProduct) {
      if (editingProduct.category && !safeActiveCategoryNames.includes(editingProduct.category)) {
        return [...safeActiveCategoryNames, editingProduct.category];
      }
      return safeActiveCategoryNames;
    }
    return safeActiveCategoryNames;
  }, [editingProduct, safeActiveCategoryNames]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: safeActiveCategoryNames[0] || 'Mobile & Electronics',
    image: '', // Primary / Main image
    images: [] as string[], // Array of all uploaded images
    price: '',
    discountPrice: '',
    stock: '',
    minOrderQuantity: '',
    description: '',
    options: [] as ProductOption[],
  });

  // Image Upload States
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleProcessImageFiles = async (files: FileList | File[]) => {
    try {
      setIsCompressingImage(true);
      setFormError('');
      const results = await compressMultipleProductImages(files);
      if (results.length === 0) return;

      setFormData((prev) => {
        const existingImages = [...prev.images];
        for (const res of results) {
          if (!existingImages.includes(res.dataUrl)) {
            existingImages.push(res.dataUrl);
          }
        }
        // If main image is not set or not in existingImages, pick the first image as main
        const mainImg = prev.image && existingImages.includes(prev.image)
          ? prev.image
          : existingImages[0];

        return {
          ...prev,
          image: mainImg,
          images: existingImages,
        };
      });

      triggerToast(`${results.length} ${results.length === 1 ? 'image' : 'images'} added successfully!`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ছবি প্রসেস করতে ব্যর্থ হয়েছে';
      setFormError(errorMsg);
    } finally {
      setIsCompressingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessImageFiles(files);
    }
  };

  const handleSetMainImage = (img: string) => {
    setFormData((prev) => ({ ...prev, image: img }));
    triggerToast('Main image selected!');
  };

  const handleRemoveImageItem = (indexToRemove: number) => {
    setFormData((prev) => {
      const imgToRemove = prev.images[indexToRemove];
      const updatedImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      let updatedMain = prev.image;
      if (updatedMain === imgToRemove) {
        updatedMain = updatedImages[0] || '';
      }
      return {
        ...prev,
        image: updatedMain,
        images: updatedImages,
      };
    });
    triggerToast('Image removed.');
  };

  const handleClearAllImages = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
      images: [],
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    triggerToast('All images cleared.');
  };

  const handleAddUrlImage = () => {
    const trimmed = urlInputValue.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const updated = [...prev.images];
      if (!updated.includes(trimmed)) {
        updated.push(trimmed);
      }
      return {
        ...prev,
        image: prev.image || trimmed,
        images: updated,
      };
    });
    setUrlInputValue('');
    triggerToast('Image URL added!');
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    const defaultCat =
      initialCategoryFilter && safeActiveCategoryNames.includes(initialCategoryFilter)
        ? initialCategoryFilter
        : safeActiveCategoryNames[0] || 'Mobile & Electronics';

    setFormData({
      name: '',
      category: defaultCat,
      image: '',
      images: [],
      price: '',
      discountPrice: '',
      stock: '200',
      minOrderQuantity: '50',
      description: '',
      options: [],
    });
    setShowUrlInput(false);
    setUrlInputValue('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    const initialImages = product.images && product.images.length > 0
      ? [...product.images]
      : (product.image ? [product.image] : []);
    
    // Ensure product.image is part of initialImages
    if (product.image && !initialImages.includes(product.image)) {
      initialImages.unshift(product.image);
    }

    setFormData({
      name: product.name,
      category: product.category,
      image: product.image || initialImages[0] || '',
      images: initialImages,
      price: product.price ? product.price.toString() : '',
      discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
      stock: product.stock.toString(),
      minOrderQuantity: product.minOrderQuantity ? product.minOrderQuantity.toString() : '',
      description: product.description || '',
      options: product.options ? JSON.parse(JSON.stringify(product.options)) : [],
    });
    setShowUrlInput(false);
    setUrlInputValue('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormError('');
    setIsFormOpen(true);
  };

  const handleAddOptionField = () => {
    const existingNames = formData.options.map((o) => o.name.toLowerCase());
    let defaultName = 'Color';
    if (existingNames.includes('color')) defaultName = 'Size';
    else if (existingNames.includes('size')) defaultName = 'Model';
    else if (existingNames.includes('model')) defaultName = 'Design';
    else if (existingNames.includes('design')) defaultName = 'Other';

    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { name: defaultName, values: [] }],
    }));
  };

  const handleOptionNameChange = (index: number, name: string) => {
    setFormData((prev) => {
      const newOpts = [...prev.options];
      newOpts[index] = { ...newOpts[index], name };
      return { ...prev, options: newOpts };
    });
  };

  const handleOptionValuesChange = (index: number, valStr: string) => {
    const rawValues = valStr.split(',').map((v) => v.trimStart());
    setFormData((prev) => {
      const newOpts = [...prev.options];
      newOpts[index] = { ...newOpts[index], values: rawValues };
      return { ...prev, options: newOpts };
    });
  };

  const handleRemoveOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter a product name');
      return;
    }
    const numPrice = parseFloat(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid positive price in ৳');
      return;
    }
    const numStock = parseInt(formData.stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setFormError('Please enter a valid stock quantity');
      return;
    }

    let numDiscount: number | undefined = undefined;
    if (formData.discountPrice.trim() !== '') {
      const parsedDiscount = parseFloat(formData.discountPrice);
      if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
        setFormError('Discount price must be a valid positive number');
        return;
      }
      if (parsedDiscount >= numPrice) {
        setFormError('Discount price must be less than regular price');
        return;
      }
      numDiscount = parsedDiscount;
    }

    let numMinQty = 10;
    if (formData.minOrderQuantity.trim() !== '') {
      const parsedMin = parseInt(formData.minOrderQuantity, 10);
      if (isNaN(parsedMin) || parsedMin < 1) {
        setFormError('Minimum order quantity must be a whole number of at least 1 piece');
        return;
      }
      numMinQty = parsedMin;
    }

    // Collect final images
    let finalImages = [...formData.images];
    let finalMainImage = formData.image.trim();

    if (finalImages.length === 0 && finalMainImage) {
      finalImages = [finalMainImage];
    } else if (finalImages.length > 0 && !finalMainImage) {
      finalMainImage = finalImages[0];
    }

    if (!finalMainImage || finalImages.length === 0) {
      setFormError('অনুগ্রহ করে প্রোডাক্টের অন্তত একটি ছবি আপলোড করুন / Please upload at least one product image');
      return;
    }

    // Position main image at front of list for clean consistency
    if (finalImages.includes(finalMainImage)) {
      finalImages = [finalMainImage, ...finalImages.filter((img) => img !== finalMainImage)];
    } else {
      finalImages = [finalMainImage, ...finalImages];
    }

    const cleanedOptions: ProductOption[] = formData.options
      .map((opt) => ({
        name: opt.name.trim(),
        values: opt.values.map((v) => v.trim()).filter((v) => v.length > 0),
      }))
      .filter((opt) => opt.name.length > 0 && opt.values.length > 0);

    if (editingProduct) {
      onEditProduct(editingProduct.id, {
        name: formData.name.trim(),
        category: formData.category,
        image: finalMainImage,
        images: finalImages,
        price: numPrice,
        discountPrice: numDiscount,
        stock: numStock,
        minOrderQuantity: numMinQty,
        options: cleanedOptions.length > 0 ? cleanedOptions : undefined,
        description: formData.description.trim() || 'Imported product from China.',
        isFeatured: editingProduct.isFeatured,
        isNew: editingProduct.isNew,
      });
      triggerToast('Product updated successfully!');
    } else {
      onAddProduct({
        name: formData.name.trim(),
        category: formData.category,
        image: finalMainImage,
        images: finalImages,
        price: numPrice,
        discountPrice: numDiscount,
        stock: numStock,
        minOrderQuantity: numMinQty,
        options: cleanedOptions.length > 0 ? cleanedOptions : undefined,
        description: formData.description.trim() || 'Imported product from China.',
        isFeatured: true,
        isNew: true,
      });
      triggerToast('New product added to store!');
    }

    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      onDeleteProduct(deletingProduct.id);
      triggerToast(`Product "${deletingProduct.name}" deleted.`);
      setDeletingProduct(null);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      orderFilterStatus === 'All' || order.orderStatus === orderFilterStatus;
    const q = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.mobileNumber.toLowerCase().includes(q) ||
      order.district.toLowerCase().includes(q) ||
      order.address.toLowerCase().includes(q) ||
      order.products.some((p) => p.name.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending').length;
  const totalSalesAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleConfirmDeleteOrder = () => {
    if (deletingOrderNumber && onDeleteOrder) {
      onDeleteOrder(deletingOrderNumber);
      triggerToast(`Order #${deletingOrderNumber} deleted successfully.`);
      setDeletingOrderNumber(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Admin Top Navigation */}
      {!hideTopNav && (
        <div className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={onBackToStore}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Store</span>
              </button>

              {/* Tab Switcher in Navbar */}
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
                  id="tab-btn-products"
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Products ({products.length})</span>
                </button>

                <button
                  id="tab-btn-orders"
                  onClick={() => {
                    if (onNavigateToOrders) {
                      onNavigateToOrders();
                    } else {
                      setActiveTab('orders');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer relative ${
                    activeTab === 'orders'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Orders ({orders.length})</span>
                  {pendingOrdersCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>

                {onNavigateToSettings && (
                  <button
                    id="tab-btn-settings"
                    onClick={onNavigateToSettings}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Store Settings</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {activeTab === 'products' && (
                <button
                  id="admin-add-product-btn"
                  onClick={handleOpenAdd}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Success notification */}
        {successToast && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm rounded-xl flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
              <span className="font-semibold">{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')} className="text-emerald-700 hover:text-emerald-950">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PRODUCTS VIEW */}
        {activeTab === 'products' && (
          <>
            {/* Admin Header Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Admin Product Management
                </h1>
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {products.length} Products
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Add, edit, or remove China imported products. Any change here automatically updates the Homepage, Category tabs, and Product pages.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={onResetToDemo}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition cursor-pointer"
                title="Reset to default demo products if needed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Catalog</span>
              </button>
              <button
                id="header-card-add-product-btn"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7 md:col-span-8 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or category..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-5 md:col-span-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full py-2 px-3 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
              >
                <option value="All">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} {!cat.isActive ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Table / List */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-base font-bold text-gray-700">No products found</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                {searchQuery || filterCategory !== 'All'
                  ? 'Try adjusting your search query or category filter'
                  : 'Start by clicking the "Add Product" button above.'}
              </p>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Product</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (৳)</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
                  {filteredProducts.map((product) => {
                    const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/75 transition">
                        {/* Image & Product Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              {product.images && product.images.length > 1 && (
                                <span className="absolute bottom-0 right-0 bg-gray-900/80 text-white text-[9px] font-bold px-1 rounded-tl-sm leading-tight flex items-center gap-0.5">
                                  <span>{product.images.length}</span>
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-md">
                              <div className="font-bold text-gray-900 line-clamp-1">
                                {product.name}
                              </div>
                              <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                {product.description}
                              </div>
                              {product.options && product.options.length > 0 && (
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  {product.options.map((opt, oIdx) => (
                                    <span key={oIdx} className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded border border-slate-200">
                                      {opt.name}: {opt.values.join(', ')}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-md border border-emerald-200">
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {hasDiscount ? (
                            <div>
                              <span className="font-bold text-gray-900 text-sm">
                                ৳{product.discountPrice?.toLocaleString('en-US')}
                              </span>
                              <span className="text-xs text-gray-400 line-through ml-1.5">
                                ৳{product.price.toLocaleString('en-US')}
                              </span>
                              <span className="block text-[10px] text-rose-600 font-bold">
                                Discount Active
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-gray-900 text-sm">
                              ৳{product.price.toLocaleString('en-US')}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              product.stock > 10
                                ? 'bg-green-50 text-green-700'
                                : product.stock > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.stock > 10
                                  ? 'bg-green-500'
                                  : product.stock > 0
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            {product.stock} units
                          </span>
                          <div className="text-[10px] text-gray-500 mt-1 font-medium flex items-center gap-1">
                            <span>Min Order:</span>
                            <span className="font-semibold text-gray-700">
                              {product.minOrderQuantity && product.minOrderQuantity > 1
                                ? `${product.minOrderQuantity} pieces`
                                : '1 piece'}
                            </span>
                          </div>
                        </td>

                        {/* Actions: Edit & Delete */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              id={`admin-edit-${product.id}`}
                              onClick={() => handleOpenEdit(product)}
                              className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              id={`admin-delete-${product.id}`}
                              onClick={() => setDeletingProduct(product)}
                              className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-700 font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )}

    {/* ORDERS VIEW */}
    {activeTab === 'orders' && (
      <div className="space-y-6">
        {/* Orders Header Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Customer Orders
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Manage customer orders placed via the Cash on Delivery checkout system.
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] text-amber-700 font-bold block uppercase">Pending</span>
                <span className="text-base font-extrabold text-amber-900">{pendingOrdersCount}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase">Total Sales</span>
                <span className="text-base font-extrabold text-emerald-900">৳{totalSalesAmount.toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>

          {/* Search and Status Filters */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search by Order #, Customer Name, Mobile, District or Product..."
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {orderSearchQuery && (
                <button
                  onClick={() => setOrderSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="w-full py-2 px-3 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-xs">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-base font-bold text-gray-700">No orders found</p>
            <p className="text-xs text-gray-500 mt-1">
              {orders.length === 0
                ? 'Customer orders placed through the website checkout will be saved and displayed here.'
                : 'Try changing your search query or status filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderNumber}
                className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm sm:text-base text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {order.orderDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status selector */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-gray-500 font-medium hidden sm:inline">Status:</span>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => {
                          if (onUpdateOrderStatus) {
                            onUpdateOrderStatus(order.orderNumber, e.target.value);
                            triggerToast(`Updated order #${order.orderNumber} status to ${e.target.value}`);
                          }
                        }}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-hidden cursor-pointer ${
                          order.orderStatus === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                      </select>
                    </div>

                    {onDeleteOrder && (
                      <button
                        onClick={() => setDeletingOrderNumber(order.orderNumber)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Customer Information */}
                  <div className="lg:col-span-4 space-y-2 text-xs border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-4">
                    <div className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                      Customer & Delivery Info
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {order.customerName}
                    </div>
                    <div>
                      <a
                        href={`tel:${order.mobileNumber}`}
                        className="text-emerald-700 font-semibold flex items-center gap-1.5 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{order.mobileNumber}</span>
                      </a>
                    </div>
                    <div className="text-gray-600 flex items-start gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>
                        {order.address}, <strong>{order.district}</strong>
                      </span>
                    </div>
                    <div className="pt-2 text-[11px] text-gray-500 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Payment: <strong>{order.paymentMethod}</strong></span>
                    </div>
                  </div>

                  {/* Products List & Financials */}
                  <div className="lg:col-span-8 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                        Ordered Items ({order.quantities} items)
                      </div>
                      <div className="divide-y divide-gray-100">
                        {order.products.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 line-clamp-1">
                                  {item.name}
                                </div>
                                <div className="text-gray-500 text-[11px]">
                                  ৳{item.price.toLocaleString('en-US')} × {item.quantity}
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-gray-900 shrink-0">
                              ৳{(item.price * item.quantity).toLocaleString('en-US')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="border-t border-gray-100 pt-3 mt-3 flex items-center justify-between text-xs font-semibold text-gray-700">
                      <div>
                        Subtotal: ৳{(order.subtotal || order.totalAmount).toLocaleString('en-US')}
                      </div>
                      <div className="text-sm font-extrabold text-emerald-700">
                        Total: ৳{(order.subtotal || order.totalAmount).toLocaleString('en-US')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-400" />
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-slate-300">
                  {editingProduct
                    ? 'Update details for this imported product'
                    : 'Fill in details to list a new China imported product'}
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  id="form-product-name"
                  type="text"
                  required
                  placeholder="e.g. 20W Fast Charger"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="form-product-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600"
                >
                  {formCategoryOptions.map((cat) => {
                    const isDeactivated = !safeActiveCategoryNames.includes(cat);
                    return (
                      <option key={cat} value={cat}>
                        {cat} {isDeactivated ? '(Deactivated)' : ''}
                      </option>
                    );
                  })}
                </select>
                {editingProduct && !safeActiveCategoryNames.includes(editingProduct.category) && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Note: This product belongs to a deactivated category. The category is preserved safely.
                  </p>
                )}
              </div>

              {/* Product Image Upload Section (Multiple Product Images) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-bold text-gray-700">
                      Product Images (প্রোডাক্টের ছবি) *
                    </label>
                    {formData.images.length > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {formData.images.length} {formData.images.length === 1 ? 'image' : 'images'}
                      </span>
                    )}
                  </div>
                  {formData.images.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="btn-add-more-images-top"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressingImage}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add More</span>
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        id="btn-remove-all-images"
                        onClick={handleClearAllImages}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear All</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Hidden native file input supporting multiple JPG, JPEG, PNG, WEBP */}
                <input
                  ref={fileInputRef}
                  id="product-image-file-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageFilesChange}
                  className="hidden"
                />

                {/* If Images Exist: Show Grid of Previews with Main Image Selector */}
                {formData.images.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {formData.images.map((img, index) => {
                        const isMain = img === formData.image;
                        return (
                          <div
                            key={index}
                            className={`group relative rounded-xl overflow-hidden border-2 bg-gray-50 transition flex flex-col ${
                              isMain
                                ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/10 shadow-xs'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Image Thumbnail */}
                            <div className="relative aspect-square w-full bg-white overflow-hidden">
                              <img
                                src={img}
                                alt={`Product preview ${index + 1}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />

                              {/* Main Indicator / Set as Main Button */}
                              {isMain ? (
                                <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-white" />
                                  <span>Main Image</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetMainImage(img)}
                                  className="absolute top-1.5 left-1.5 bg-black/65 hover:bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs transition shadow-xs flex items-center gap-1 cursor-pointer"
                                  title="Click to set as Main Image"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>Set as Main</span>
                                </button>
                              )}

                              {/* Delete button */}
                              <button
                                type="button"
                                id={`btn-delete-img-${index}`}
                                onClick={() => handleRemoveImageItem(index)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                                title="Remove this image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Card Footer Control */}
                            <div className="p-1.5 bg-white border-t border-gray-100 flex items-center justify-between text-[11px]">
                              <span className="text-gray-500 font-medium">#{index + 1}</span>
                              {isMain ? (
                                <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-0.5">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Primary</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetMainImage(img)}
                                  className="text-gray-600 hover:text-emerald-700 font-medium text-[10px] hover:underline cursor-pointer"
                                >
                                  Make Main
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* "+ Add More Images" Card in the Grid */}
                      <button
                        type="button"
                        id="btn-grid-add-more-images"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressingImage}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-600 hover:bg-emerald-50/20 bg-gray-50 flex flex-col items-center justify-center gap-1.5 p-2 transition cursor-pointer text-gray-500 hover:text-emerald-700 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition">
                          {isCompressingImage ? (
                            <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4 group-hover:text-emerald-700" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold">
                          {isCompressingImage ? 'Optimizing...' : 'Add More Images'}
                        </span>
                        <span className="text-[9px] text-gray-400">JPG, PNG, WEBP</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
                        <span>The <strong>Main Image</strong> is shown on catalog cards and cart. Click <strong>"Set as Main"</strong> on any thumbnail to change it anytime.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Upload Prompt Dropzone when 0 images are uploaded */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) handleProcessImageFiles(files);
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isDraggingOver
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/20 bg-gray-50/50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 shadow-xs">
                      {isCompressingImage ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-emerald-700" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-800 flex items-center justify-center gap-1.5">
                        <span>{isCompressingImage ? 'ছবি অপ্টিমাইজ হচ্ছে...' : 'Upload Product Images (একাধিক ছবি আপলোড)'}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Click to select one or multiple images from computer or mobile (or drag & drop here)
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium pt-1">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">JPG</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">JPEG</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">PNG</span>
                        <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">WEBP</span>
                        <span className="text-emerald-700 font-semibold">• Auto-compressed for fast loading</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="btn-upload-product-image"
                      disabled={isCompressingImage}
                      className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition inline-flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isCompressingImage ? 'Optimizing Images...' : 'Select Images to Upload'}</span>
                    </button>
                  </div>
                )}

                {/* Optional Web URL & Sample Presets Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-gray-500 hover:text-emerald-700 font-medium underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>{showUrlInput ? 'Hide Image URL Option' : 'Or enter an image URL / pick presets'}</span>
                  </button>

                  {showUrlInput && (
                    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 text-xs">
                      <div className="flex gap-2">
                        <input
                          id="form-product-image-url"
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={urlInputValue}
                          onChange={(e) => setUrlInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddUrlImage();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-hidden focus:border-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={handleAddUrlImage}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                        >
                          Add URL
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-500 font-medium">Quick sample presets (click to add): </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {SAMPLE_IMAGE_PRESETS.map((preset) => (
                            <button
                              type="button"
                              key={preset.label}
                              onClick={() => {
                                setFormData((prev) => {
                                  const updated = prev.images.includes(preset.url) ? prev.images : [...prev.images, preset.url];
                                  return {
                                    ...prev,
                                    image: prev.image || preset.url,
                                    images: updated,
                                  };
                                });
                                triggerToast(`Added ${preset.label}`);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 border border-gray-200 transition cursor-pointer"
                            >
                              + {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Discount Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Price (৳) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">৳</span>
                    <input
                      id="form-product-price"
                      type="number"
                      required
                      min="1"
                      step="1"
                      placeholder="850"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Discount Price (৳) <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">৳</span>
                    <input
                      id="form-product-discount"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="699"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Quantity & Minimum Order Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    id="form-product-stock"
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="25"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Minimum Order Quantity (পাইকারি ন্যূনতম অর্ডার) *
                  </label>
                  <div className="relative">
                    <input
                      id="form-product-min-order-quantity"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 50"
                      value={formData.minOrderQuantity}
                      onChange={(e) => setFormData({ ...formData, minOrderQuantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Examples: 50 pieces, 100 pieces, 20 pieces (Admin can set a different minimum quantity for each product)
                  </span>
                </div>
              </div>

              {/* Product Options / Variants Section (Optional) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Product Options / Variants (ঐচ্ছিক অপশন)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Add options like Color, Size, Model, Design. If a product has no variants, leave this empty.
                    </p>
                  </div>
                  <button
                    id="btn-add-product-option"
                    type="button"
                    onClick={handleAddOptionField}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Add Option</span>
                  </button>
                </div>

                {formData.options.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 bg-white/60">
                    No options or variants added yet. Customer will not see variant selection for this product.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.options.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 flex items-center gap-2 flex-wrap">
                            <label className="text-[11px] font-bold text-gray-700 shrink-0">
                              Option:
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Color, Size, Model, Design"
                              value={opt.name}
                              onChange={(e) => handleOptionNameChange(optIndex, e.target.value)}
                              className="px-2.5 py-1 text-xs font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-hidden focus:border-emerald-600 w-36"
                            />
                            <div className="flex items-center gap-1">
                              {['Color', 'Size', 'Model', 'Design', 'Other'].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => handleOptionNameChange(optIndex, preset)}
                                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                                    opt.name.toLowerCase() === preset.toLowerCase()
                                      ? 'bg-emerald-600 text-white font-bold'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIndex)}
                            className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Remove this option"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                            Values (comma-separated, e.g. <span className="font-mono text-gray-800">{opt.name.toLowerCase() === 'size' ? 'M, L, XL' : 'Black, White, Blue'}</span>):
                          </label>
                          <input
                            type="text"
                            placeholder={opt.name.toLowerCase() === 'size' ? 'M, L, XL' : 'Black, White, Blue'}
                            value={opt.values.join(', ')}
                            onChange={(e) => handleOptionValuesChange(optIndex, e.target.value)}
                            className="w-full px-3 py-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
                          />
                          {opt.values.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap mt-2">
                              {opt.values.map((v, vIdx) => {
                                const trimmed = v.trim();
                                if (!trimmed) return null;
                                return (
                                  <span
                                    key={vIdx}
                                    className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded-md border border-slate-200"
                                  >
                                    {trimmed}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Short Description *
                </label>
                <textarea
                  id="form-product-desc"
                  rows={3}
                  required
                  placeholder="20W fast charging adapter for compatible smartphones..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="form-submit-btn"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingProduct ? 'Save Changes' : 'Add Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Delete Product
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Are you sure you want to delete this product?
                </p>
                <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs font-semibold text-gray-800">
                  {deletingProduct.name}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete"
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Dialog */}
      {deletingOrderNumber && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Delete Order
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Are you sure you want to delete order <strong>#{deletingOrderNumber}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingOrderNumber(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-order"
                type="button"
                onClick={handleConfirmDeleteOrder}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
