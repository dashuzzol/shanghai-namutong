import { Category, Order, PaymentStatus, Product, StoreSettings } from '../types';
import { getStoredAdminToken } from './adminAuth';

/** JSON headers plus the admin token, needed for every admin-only endpoint. */
function adminHeaders(): Record<string, string> {
  const token = getStoredAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchStoreSettings(): Promise<StoreSettings | null> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch settings from server:', err);
    return null;
  }
}

export async function saveStoreSettingsApi(settings: StoreSettings): Promise<StoreSettings | null> {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to save settings to server:', err);
    return null;
  }
}

export async function fetchCategoriesApi(): Promise<Category[] | null> {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch categories from server:', err);
    return null;
  }
}

export async function saveCategoriesApi(categories: Category[]): Promise<Category[] | null> {
  try {
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(categories),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to save categories to server:', err);
    return null;
  }
}

export async function fetchProductsApi(): Promise<Product[] | null> {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch products from server:', err);
    return null;
  }
}

export async function saveProductsApi(products: Product[]): Promise<Product[] | null> {
  try {
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(products),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to save products to server:', err);
    return null;
  }
}

export async function deleteProductApi(productId: string): Promise<Product[] | null> {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.products || null;
  } catch (err) {
    console.error('Failed to delete product from server:', err);
    return null;
  }
}

export async function fetchOrdersApi(): Promise<Order[] | null> {
  try {
    const res = await fetch('/api/orders', { headers: adminHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch orders from server:', err);
    return null;
  }
}

export async function createOrderApi(order: Order): Promise<{ success: boolean; order: Order; products: Product[] } | null> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(order),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to create order on server:', err);
    return null;
  }
}

export async function updateOrderApi(
  orderNumber: string,
  updates: { orderStatus?: string; paymentStatus?: PaymentStatus }
): Promise<{ success: boolean; order?: Order; products: Product[] } | null> {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to update order on server:', err);
    return null;
  }
}

export async function deleteOrderApi(
  orderNumber: string
): Promise<{ success: boolean; products: Product[] } | null> {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to delete order on server:', err);
    return null;
  }
}
