import { IncomingMessage, ServerResponse } from 'http';
import {
  getSettings,
  updateSettings,
  getCategories,
  saveCategories,
  getProducts,
  saveProducts,
  getOrders,
  addOrder,
  updateOrderStatusAndPayment,
  deleteOrder,
} from './db';
import {
  validateAdminCredentials,
  createAdminSession,
  verifyAdminToken,
  revokeAdminToken,
} from './auth';

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let bodyStr = '';
    req.on('data', (chunk) => {
      bodyStr += chunk;
    });
    req.on('end', () => {
      try {
        resolve(bodyStr ? JSON.parse(bodyStr) : {});
      } catch {
        resolve({});
      }
    });
  });
}

/** Sends 401 and returns false when the request has no valid admin token. */
function requireAdmin(req: IncomingMessage, res: ServerResponse): boolean {
  const authHeader = req.headers['authorization'] as string | undefined;
  if (verifyAdminToken(authHeader).valid) return true;
  sendJson(res, 401, { success: false, message: 'Admin login required' });
  return false;
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next?: () => void
): Promise<boolean> {
  const url = req.url?.split('?')[0] || '';
  const method = req.method || 'GET';

  if (!url.startsWith('/api')) {
    if (next) next();
    return false;
  }

  // Health
  if (url === '/api/health') {
    sendJson(res, 200, { status: 'ok' });
    return true;
  }

  // Admin Auth
  if (url === '/api/admin/login' && method === 'POST') {
    const body = await parseJsonBody(req);
    const isValid = validateAdminCredentials(body.username, body.password);
    if (isValid) {
      const session = createAdminSession(body.username);
      sendJson(res, 200, { success: true, ...session });
    } else {
      sendJson(res, 401, { success: false, message: 'Invalid username or password' });
    }
    return true;
  }

  if (url === '/api/admin/verify' && (method === 'GET' || method === 'POST')) {
    const authHeader = req.headers['authorization'] as string | undefined;
    const result = verifyAdminToken(authHeader);
    if (result.valid) {
      sendJson(res, 200, { success: true, authenticated: true, user: result.user });
    } else {
      sendJson(res, 401, { success: false, authenticated: false, message: 'Session expired or invalid' });
    }
    return true;
  }

  if (url === '/api/admin/logout' && method === 'POST') {
    const authHeader = req.headers['authorization'] as string | undefined;
    revokeAdminToken(authHeader);
    sendJson(res, 200, { success: true, message: 'Logged out successfully' });
    return true;
  }

  // Store Settings
  if (url === '/api/settings') {
    if (method === 'GET') {
      const settings = await getSettings();
      sendJson(res, 200, settings);
      return true;
    }
    if (method === 'PUT' || method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      const updated = await updateSettings(body);
      sendJson(res, 200, updated);
      return true;
    }
  }

  // Categories
  if (url === '/api/categories') {
    if (method === 'GET') {
      const cats = await getCategories();
      sendJson(res, 200, cats);
      return true;
    }
    if (method === 'POST' || method === 'PUT') {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      if (Array.isArray(body)) {
        const saved = await saveCategories(body);
        sendJson(res, 200, saved);
        return true;
      }
      // Single category create
      const cats = await getCategories();
      const newCat = {
        id: body.id || `cat-${Date.now()}`,
        name: body.name || 'New Category',
        isActive: body.isActive !== false,
        image: body.image,
      };
      cats.push(newCat);
      const savedCats = await saveCategories(cats);
      sendJson(res, 200, savedCats);
      return true;
    }
  }

  // Products
  if (url === '/api/products') {
    if (method === 'GET') {
      const prods = await getProducts();
      sendJson(res, 200, prods);
      return true;
    }
    if (method === 'POST' || method === 'PUT') {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      if (Array.isArray(body)) {
        const saved = await saveProducts(body);
        sendJson(res, 200, saved);
        return true;
      }
      // Single product add / update
      const prods = await getProducts();
      const existingIdx = prods.findIndex((p) => p.id === body.id);
      if (existingIdx >= 0) {
        prods[existingIdx] = { ...prods[existingIdx], ...body };
      } else {
        const newProd = {
          ...body,
          id: body.id || `prod-${Date.now()}`,
        };
        prods.unshift(newProd);
      }
      const savedProds = await saveProducts(prods);
      sendJson(res, 200, savedProds);
      return true;
    }
  }

  // Delete product: /api/products/:id
  if (url.startsWith('/api/products/') && method === 'DELETE') {
    if (!requireAdmin(req, res)) return true;
    const id = decodeURIComponent(url.replace('/api/products/', ''));
    const prods = await getProducts();
    const filtered = prods.filter((p) => p.id !== id);
    const remaining = await saveProducts(filtered);
    sendJson(res, 200, { success: true, products: remaining });
    return true;
  }

  // Orders
  if (url === '/api/orders') {
    if (method === 'GET') {
      // Orders contain customer names, phones and addresses: admin only.
      if (!requireAdmin(req, res)) return true;
      const ords = await getOrders();
      sendJson(res, 200, ords);
      return true;
    }
    if (method === 'POST') {
      const body = await parseJsonBody(req);
      const result = await addOrder(body);
      sendJson(res, 200, result);
      return true;
    }
  }

  // Update order status/payment: /api/orders/:orderNumber
  if (url.startsWith('/api/orders/')) {
    if (!requireAdmin(req, res)) return true;
    const orderNumber = decodeURIComponent(url.replace('/api/orders/', ''));
    if (method === 'PATCH' || method === 'PUT') {
      const body = await parseJsonBody(req);
      const result = await updateOrderStatusAndPayment(orderNumber, body);
      sendJson(res, result.success ? 200 : 400, result);
      return true;
    }
    if (method === 'DELETE') {
      const result = await deleteOrder(orderNumber);
      sendJson(res, result.success ? 200 : 404, result);
      return true;
    }
  }

  // Unhandled /api endpoint
  sendJson(res, 404, { error: 'API endpoint not found' });
  return true;
}
