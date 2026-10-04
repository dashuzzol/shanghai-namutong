import { Product } from '../types';

export function getProductPricing(product: Product) {
  if (product.discountPrice && product.discountPrice < product.price) {
    const regularPrice = product.price;
    const currentPrice = product.discountPrice;
    const discountAmount = regularPrice - currentPrice;
    const discountPercentage = Math.round((discountAmount / regularPrice) * 100);
    return {
      currentPrice,
      regularPrice,
      hasDiscount: true,
      discountAmount,
      discountPercentage,
    };
  }

  if (product.originalPrice && product.originalPrice > product.price) {
    const regularPrice = product.originalPrice;
    const currentPrice = product.price;
    const discountAmount = regularPrice - currentPrice;
    const discountPercentage = Math.round((discountAmount / regularPrice) * 100);
    return {
      currentPrice,
      regularPrice,
      hasDiscount: true,
      discountAmount,
      discountPercentage,
    };
  }

  return {
    currentPrice: product.price,
    regularPrice: undefined,
    hasDiscount: false,
    discountAmount: 0,
    discountPercentage: 0,
  };
}

/**
 * Returns the minimum order quantity for a product.
 * If no minimum quantity is set or invalid, defaults to 1 piece.
 */
export function getMinOrderQuantity(product?: Product | null): number {
  if (!product || typeof product.minOrderQuantity !== 'number' || isNaN(product.minOrderQuantity) || product.minOrderQuantity < 1) {
    return 1;
  }
  return Math.max(1, Math.floor(product.minOrderQuantity));
}

export const CATEGORY_BANGLA_MAP: Record<string, string> = {
  'All Products': 'সব পণ্য',
  'Mobile & Electronics': 'মোবাইল ও ইলেকট্রনিক্স',
  'Clothing': 'পোশাক ও ফ্যাশন',
  'Shoes': 'জুতা ও স্যান্ডেল',
  'Kids & Toys': 'বাচ্চাদের খেলনা',
  'Home & Kitchen': 'হোম ও কিচেন',
  'Other Products': 'অন্যান্য পণ্য',
};

export function getCategoryBanglaName(categoryName: string): string {
  return CATEGORY_BANGLA_MAP[categoryName] || categoryName;
}

export function getCategoryDisplayName(categoryName: string, lang: 'bn' | 'en' = 'bn'): string {
  if (lang === 'en') {
    return categoryName;
  }
  return CATEGORY_BANGLA_MAP[categoryName] || categoryName;
}

