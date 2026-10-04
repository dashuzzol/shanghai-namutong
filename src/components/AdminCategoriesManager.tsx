import React, { useState, useRef } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Search,
  Package,
  Power,
  RefreshCw,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { Category, Product } from '../types';

interface AdminCategoriesManagerProps {
  categories: Category[];
  products: Product[];
  onAddCategory: (category: { name: string; image?: string; isActive?: boolean }) => void;
  onEditCategory: (id: string, updated: { name: string; image?: string; isActive?: boolean }) => void;
  onToggleCategoryActive: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onSelectCategory: (categoryName: string) => void;
  onAddProductInCategory: (categoryName: string) => void;
  onNavigateToProducts: () => void;
  hideTopNav?: boolean;
}

const PRESET_CATEGORY_IMAGES = [
  { label: 'Electronics', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80' },
  { label: 'Clothing', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format&fit=crop&q=80' },
  { label: 'Shoes', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80' },
  { label: 'Toys', url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&auto=format&fit=crop&q=80' },
  { label: 'Home & Kitchen', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80' },
  { label: 'Lifestyle & Bags', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80' },
  { label: 'Beauty & Care', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80' },
  { label: 'Sports & Fitness', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80' },
];

export const AdminCategoriesManager: React.FC<AdminCategoriesManagerProps> = ({
  categories,
  products,
  onAddCategory,
  onEditCategory,
  onToggleCategoryActive,
  onDeleteCategory,
  onSelectCategory,
  onAddProductInCategory,
  onNavigateToProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Modal form states
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormImage('');
    setFormIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormImage(cat.image || '');
    setFormIsActive(cat.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setFormError('Image size should be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setFormImage(result);
        setFormError('');
      }
    };
    reader.onerror = () => {
      setFormError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formName.trim();

    if (!trimmedName) {
      setFormError('Category name is required');
      return;
    }

    // Duplicate check
    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === trimmedName.toLowerCase() &&
        (!editingCategory || c.id !== editingCategory.id)
    );

    if (isDuplicate) {
      setFormError('A category with this name already exists');
      return;
    }

    if (editingCategory) {
      onEditCategory(editingCategory.id, {
        name: trimmedName,
        image: formImage.trim() || undefined,
        isActive: formIsActive,
      });
      showToast(`Category "${trimmedName}" updated successfully`);
    } else {
      onAddCategory({
        name: trimmedName,
        image: formImage.trim() || undefined,
        isActive: formIsActive,
      });
      showToast(`New category "${trimmedName}" created`);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deletingCategory) return;
    const catName = deletingCategory.name;
    onDeleteCategory(deletingCategory.id);
    showToast(`Category "${catName}" deleted. Existing products remain safe.`);
    setDeletingCategory(null);
  };

  // Filter categories by search
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Metrics
  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = totalCategories - activeCount;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="category-toast-notification"
          className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-500/40 text-xs sm:text-sm animate-in fade-in slide-in-from-top-3"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Category Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Add, edit names, upload category images, activate or deactivate departments
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-navigate-all-products"
            onClick={onNavigateToProducts}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Products Catalog</span>
          </button>

          <button
            id="btn-add-new-category"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500">Total Categories</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{totalCategories}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Configured departments</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600">Active Categories</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Visible for new products</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-amber-600">Deactivated</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{inactiveCount}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Hidden for new products</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-blue-600">Assigned Products</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{products.length}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Across catalog</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="input-search-categories"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category by name..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 flex items-center justify-between sm:justify-end gap-2 px-1">
          <span>Showing {filteredCategories.length} of {categories.length} categories</span>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-base font-bold text-gray-700">No categories found</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            {searchQuery ? `No category matching "${searchQuery}"` : 'Get started by creating your first category.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const catProducts = products.filter((p) => p.category === cat.name);
            const inStockCount = catProducts.filter((p) => p.stock > 0).length;

            return (
              <div
                key={cat.id}
                id={`category-card-${cat.id}`}
                className={`bg-white rounded-2xl border transition shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  cat.isActive ? 'border-gray-200 hover:border-emerald-500' : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                {/* Card Top: Image / Banner & Header */}
                <div>
                  <div className="relative h-36 w-full bg-slate-100 overflow-hidden border-b border-gray-100 group">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // fallback if image fails to load
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-emerald-50 text-emerald-700">
                        <ShoppingBag className="w-10 h-10 stroke-1 opacity-70" />
                        <span className="text-[11px] font-semibold text-gray-400 mt-1">No Image</span>
                      </div>
                    )}

                    {/* Status badge floating on image */}
                    <div className="absolute top-3 left-3">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                          Deactivated
                        </span>
                      )}
                    </div>

                    {/* Products count badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                        {catProducts.length} {catProducts.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {catProducts.length} registered products ({inStockCount} in stock)
                        </p>
                      </div>
                    </div>

                    {/* Status explanation */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500">For new products:</span>
                      {cat.isActive ? (
                        <span className="font-semibold text-emerald-700 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Available in dropdown
                        </span>
                      ) : (
                        <span className="font-semibold text-amber-700 flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Hidden for new products
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5">
                    {/* View Products button */}
                    <button
                      id={`btn-view-cat-products-${cat.id}`}
                      onClick={() => onSelectCategory(cat.name)}
                      className="flex-1 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="View products in this category"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Products ({catProducts.length})</span>
                    </button>

                    {/* Toggle Active/Inactive */}
                    <button
                      id={`btn-toggle-cat-active-${cat.id}`}
                      onClick={() => onToggleCategoryActive(cat.id)}
                      className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        cat.isActive
                          ? 'bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-700'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                      }`}
                      title={cat.isActive ? 'Deactivate category (hides from new product form)' : 'Activate category'}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    {/* Edit button */}
                    <button
                      id={`btn-edit-cat-${cat.id}`}
                      onClick={() => handleOpenEditModal(cat)}
                      className="p-2 bg-gray-100 hover:bg-slate-800 hover:text-white text-gray-700 rounded-xl transition cursor-pointer"
                      title="Edit Category Name and Image"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      id={`btn-delete-cat-${cat.id}`}
                      onClick={() => setDeletingCategory(cat)}
                      className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl transition cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div
          id="modal-category-editor"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base sm:text-lg">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
              </div>
              <button
                id="btn-close-cat-modal"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Category Name */}
              <div>
                <label
                  htmlFor="input-cat-name"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
                >
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-cat-name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="e.g. Sports & Fitness, Beauty & Care..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Category Image (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Category Image (Optional)
                </label>

                <div className="space-y-3">
                  {/* Image Input + Upload Button */}
                  <div className="flex gap-2">
                    <input
                      id="input-cat-image-url"
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                    />

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      id="btn-upload-cat-image"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                      title="Upload image from your computer or phone"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>

                  {/* Preset Photos Suggestion Pills */}
                  <div>
                    <span className="text-[11px] text-gray-500 block mb-1.5">
                      Or pick from photo presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_CATEGORY_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setFormImage(preset.url)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            formImage === preset.url
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview Container */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-16 h-16 rounded-lg bg-white border border-gray-300 overflow-hidden flex items-center justify-center shrink-0">
                      {formImage ? (
                        <img
                          src={formImage}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setFormError('Image preview failed to load')}
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-gray-800">
                        {formImage ? 'Image Preview' : 'No image chosen'}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {formImage
                          ? 'This image will be displayed on the category banner & cards.'
                          : 'You can save without an image; an elegant icon will be shown instead.'}
                      </p>
                      {formImage && (
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          className="text-[11px] text-rose-600 hover:underline mt-1 font-semibold cursor-pointer"
                        >
                          Remove image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-emerald-50/40 rounded-xl border border-gray-200 transition cursor-pointer">
                  <input
                    id="checkbox-cat-active"
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-gray-900">Active Category</div>
                    <div className="text-gray-500">
                      When active, this category is visible in the Add/Edit Product forms and customer navigation.
                    </div>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  id="btn-cancel-cat-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-cat-modal"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer active:scale-95"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div
          id="modal-confirm-delete-category"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-full bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Category?</h3>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete category{' '}
              <strong className="text-gray-900">"{deletingCategory.name}"</strong>?
            </p>

            {/* Note on safe products */}
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <strong>Rule Verification:</strong> All existing products in this category will{' '}
              <strong>remain completely safe</strong> in your catalog. Only the category record itself will be removed.
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                id="btn-cancel-delete-category"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-category"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
