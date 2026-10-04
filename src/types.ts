export type Language = 'bn' | 'en';

export type MainCategory = string;

export type CategoryType = 'All Products' | string;

export interface Category {
  id: string;
  name: string;
  image?: string;
  isActive: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-mobile-electronics',
    name: 'Mobile & Electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'cat-clothing',
    name: 'Clothing',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'cat-shoes',
    name: 'Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'cat-kids-toys',
    name: 'Kids & Toys',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'cat-home-kitchen',
    name: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'cat-other-products',
    name: 'Other Products',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80',
    isActive: true,
  },
];

export interface ProductOption {
  name: string; // e.g., 'Color', 'Size', 'Model', 'Design', 'Other'
  values: string[]; // e.g., ['Black', 'White', 'Blue']
}

export interface Product {
  id: string;
  name: string;
  category: MainCategory;
  price: number;
  discountPrice?: number;
  originalPrice?: number;
  image: string; // Main image used on cards, cart, orders
  images?: string[]; // All product images (including main image)
  description: string;
  stock: number;
  minOrderQuantity?: number; // Minimum order quantity required (defaults to 1 if not specified)
  options?: ProductOption[]; // Optional variants/options: Color, Size, Model, Design, etc.
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>; // e.g., { 'Color': 'Black', 'Size': 'XL' }
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions?: Record<string, string>; // Saved variant options for this product
}

export type PaymentStatus = 'Payment Pending' | 'Payment Confirmed' | 'Payment Rejected';

export type PaymentMethodOption = 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cash Payment';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  orderNumber: string;
  customerName: string;
  mobileNumber: string;
  district: string;
  address: string;
  products: OrderItem[];
  quantities: number;
  subtotal: number;
  deliveryCharge?: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus | string;
  orderDate: string;
  senderNumber?: string;
  transactionId?: string;
  stockDeducted?: boolean; // Tracks whether inventory was deducted upon confirmation
  notes?: string;
}

export interface OrderDetails {
  name: string;
  phone: string;
  address: string;
  district: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  storeLogo: string;
  phoneNumber: string;
  whatsAppNumber: string;
  email: string;
  facebookPage: string;
  storeAddress: string;
  shortDescription: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Shanghai Namutong International Trade Co. Ltd',
  storeLogo: '/shanghai_namutong_logo.svg',
  phoneNumber: '+880 1711-234567',
  whatsAppNumber: '+8801711234567',
  email: 'info@shanghainamutong.com',
  facebookPage: 'https://facebook.com/shanghainamutong',
  storeAddress: 'Level 7, Suite 702, Trade Tower, Dilkusha C/A, Dhaka-1000, Bangladesh',
  shortDescription: 'Premier Bangladesh-based wholesale importer & distributor of electronics, clothing, footwear, toys, and home lifestyle goods directly from Shanghai & China manufacturers.',
  bkashNumber: '01711-234567',
  nagadNumber: '01711-234567',
  rocketNumber: '01711-234567-8',
};
