import React, { useState, useEffect } from 'react';
import { Eye, Zap } from 'lucide-react';
import { Product } from '../types';
import { getProductPricing, getMinOrderQuantity, getCategoryDisplayName } from '../utils/productUtils';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onOrderNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewProduct,
  onOrderNow,
}) => {
  const { language, t } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const pricing = getProductPricing(product);
  const minQty = getMinOrderQuantity(product);

  useEffect(() => {
    setImgError(false);
  }, [product.image]);

  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  const handleOrderNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOrderNow(product);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all flex flex-col group relative"
    >
      {/* Product Image Container */}
      <div
        className="relative aspect-square w-full bg-gray-100 overflow-hidden cursor-pointer"
        onClick={() => onViewProduct(product)}
      >
        <img
          src={imgError ? fallbackImage : product.image}
          alt={product.name}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge */}
        {pricing.hasDiscount && (
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            -{pricing.discountPercentage}% {t('ছাড়', 'OFF')}
          </span>
        )}

        {/* Minimum Order Badge */}
        {minQty > 1 && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            {t(`কমপক্ষে ${minQty} টি`, `Min: ${minQty} pcs`)}
          </span>
        )}

        {/* Category Tag */}
        <span className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-sm">
          {getCategoryDisplayName(product.category, language)}
        </span>
      </div>

      {/* Product Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Product Name */}
          <h3
            onClick={() => onViewProduct(product)}
            className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-emerald-700 cursor-pointer min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price & Discount */}
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-gray-900">
              ৳{pricing.currentPrice.toLocaleString('en-US')}
            </span>
            {pricing.regularPrice && (
              <span className="text-xs text-gray-400 line-through">
                ৳{pricing.regularPrice.toLocaleString('en-US')}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px]">
            {product.stock > 0 ? (
              <span className="text-emerald-700 font-medium">
                {t(`✓ স্টকে আছে (${product.stock} টি)`, `✓ In Stock (${product.stock} pcs)`)}
              </span>
            ) : (
              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {t('স্টক শেষ', 'Out of Stock')}
              </span>
            )}
            {minQty > 1 && (
              <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {t(`MOQ: ${minQty} টি`, `MOQ: ${minQty} pcs`)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
          <button
            id={`btn-view-${product.id}`}
            type="button"
            onClick={() => onViewProduct(product)}
            className="w-full py-2 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-gray-600" />
            <span>{t('বিস্তারিত', 'Details')}</span>
          </button>

          <button
            id={`btn-order-now-${product.id}`}
            type="button"
            onClick={handleOrderNowClick}
            disabled={product.stock <= 0}
            className="w-full py-2 px-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{product.stock <= 0 ? t('স্টক শেষ', 'Out of Stock') : t('অর্ডার করুন', 'Order Now')}</span>
          </button>
        </div>
      </div>
    </div>

  );
};
