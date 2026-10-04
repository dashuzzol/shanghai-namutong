import fs from 'fs';
import path from 'path';
import dns from 'node:dns';
import { MongoClient, Db, Collection, AnyBulkWriteOperation } from 'mongodb';
import { Category, DEFAULT_CATEGORIES, DEFAULT_STORE_SETTINGS, Order, Product, StoreSettings } from '../src/types';

export interface DatabaseData {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store_db.json');

export const INITIAL_PRODUCTS: Product[] = [
  // Mobile & Electronics
  {
    id: 'prod-tws-pro',
    name: 'TWS Wireless Bluetooth 5.3 Earbuds with LED Power Display',
    category: 'Mobile & Electronics',
    price: 650,
    originalPrice: 950,
    discountPrice: 650,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Wholesale lot direct from Shenzhen technology zone. Bluetooth 5.3 low-latency chip, dual-mic environmental noise cancellation (ENC), 300mAh charging case with digital LED percentage display. Compatible with Android & iOS.',
    stock: 120,
    minOrderQuantity: 5,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'prod-smartwatch-ultra',
    name: 'Smart Watch Ultra Series 9 HD AMOLED Full Touch Screen with Bluetooth Call',
    category: 'Mobile & Electronics',
    price: 1350,
    originalPrice: 1950,
    discountPrice: 1350,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Titanium-alloy case, 2.02-inch crisp HD display, wireless magnetic charging, real-time heart rate sensor, multi-sports tracking, and Bengali notification font support.',
    stock: 85,
    minOrderQuantity: 3,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'prod-charging-dock-3in1',
    name: '3-in-1 Foldable Magnetic Fast Wireless Charging Station 15W',
    category: 'Mobile & Electronics',
    price: 980,
    originalPrice: 1450,
    image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
    description: 'Foldable travel-friendly wireless charging dock. Powers phone (15W), smartwatch (3W), and wireless earbuds (5W) concurrently with smart overcharge safety protection.',
    stock: 60,
    minOrderQuantity: 4,
    isFeatured: false,
    isNew: true,
  },
  {
    id: 'prod-portable-fan-usb',
    name: 'Rechargeable 4000mAh Desk & Clip-on Mini Cooling Fan',
    category: 'Mobile & Electronics',
    price: 680,
    originalPrice: 950,
    image: 'https://images.unsplash.com/photo-1618249877395-5d9c2273629e?w=800&auto=format&fit=crop&q=80',
    description: 'Wholesale high-demand summer item in Bangladesh. 4000mAh battery providing up to 8 hours continuous breeze, whisper-quiet brushless copper motor, 360-degree rotation.',
    stock: 150,
    minOrderQuantity: 6,
    isFeatured: true,
    isNew: false,
  },

  // Clothing
  {
    id: 'prod-polo-shirt',
    name: "Men's Solid Color Pique Cotton Export Polo Shirt (Pack Lot)",
    category: 'Clothing',
    price: 420,
    originalPrice: 650,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
    description: '220 GSM combed breathable pique cotton. Color fastness guaranteed, export quality rib collar and cuffs. Ideal for wholesale retail and corporate bulk branding.',
    stock: 200,
    minOrderQuantity: 10,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'prod-graphic-tee',
    name: 'Heavyweight 240 GSM Unisex Oversized Streetwear Graphic T-Shirt',
    category: 'Clothing',
    price: 360,
    originalPrice: 550,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    description: 'Drop-shoulder relaxed streetwear cut made from 100% premium combed ring-spun cotton. High-definition screen printed graphic that withstands repeated washing.',
    stock: 180,
    minOrderQuantity: 10,
    isFeatured: false,
    isNew: true,
  },

  // Shoes
  {
    id: 'prod-sneakers-breathable',
    name: 'Ultra-Lightweight Breathable Mesh Casual Walking Sneakers',
    category: 'Shoes',
    price: 780,
    originalPrice: 1250,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    description: 'Flyknit breathable upper with ultra-cushioned EVA shock-absorbing outsole. Designed for high durability, daily walking, and gym training. Standard wholesale sizing (40-44).',
    stock: 90,
    minOrderQuantity: 6,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'prod-slipon-loafers',
    name: "Men's Soft Genuine Leather Casual Slip-on Driving Loafers",
    category: 'Shoes',
    price: 1100,
    originalPrice: 1700,
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80',
    description: 'Handcrafted cowhide upper with flexible non-slip rubber grip sole. Ergonomic insole providing day-long comfort for formal and casual occasions.',
    stock: 45,
    minOrderQuantity: 4,
    isFeatured: false,
    isNew: false,
  },

  // Kids & Toys
  {
    id: 'prod-remote-car',
    name: 'High-Speed 4WD Off-Road Monster RC Rock Crawler Toy Car',
    category: 'Kids & Toys',
    price: 950,
    originalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
    description: 'Equipped with shock absorption suspension, 2.4GHz anti-interference controller, heavy-duty rubber tires, and rechargeable lithium battery pack. Climbing angle up to 45 degrees.',
    stock: 60,
    minOrderQuantity: 4,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'prod-educational-tablet',
    name: 'Kids 8.5-inch LCD Writing Drawing Tablet Board with Erase Button',
    category: 'Kids & Toys',
    price: 190,
    originalPrice: 350,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    description: 'Eye-friendly non-radiative pressure-sensitive LCD screen. Children can write, draw, and erase with one click. Ideal for Montessori learning, school notes, and paperless doodling.',
    stock: 250,
    minOrderQuantity: 12,
    isFeatured: false,
    isNew: true,
  },

  // Home & Kitchen
  {
    id: 'prod-kitchen-chopper',
    name: 'Stainless Steel Electric High-Power Meat & Vegetable Food Chopper 2L',
    category: 'Home & Kitchen',
    price: 1150,
    originalPrice: 1800,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    description: 'Heavy duty 300W pure copper motor with 4-blade bi-level S-shaped blades and food-grade 304 stainless steel bowl. Chops meat, vegetables, garlic, and nuts in 6 seconds.',
    stock: 70,
    minOrderQuantity: 4,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'prod-knife-set',
    name: 'Professional 6-Piece Non-Stick Textured Kitchen Chef Knife Set with Box',
    category: 'Home & Kitchen',
    price: 750,
    originalPrice: 1200,
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=80',
    description: 'High-carbon stainless steel blades with anti-rust corrugated black coating. Includes chef knife, bread knife, utility knife, paring knife, kitchen shears, and ceramic peeler.',
    stock: 80,
    minOrderQuantity: 5,
    isFeatured: false,
    isNew: false,
  },

  // Other Products
  {
    id: 'prod-luggage-bag',
    name: 'Waterproof Expandable Multi-Compartment Travel Duffel & Gym Bag',
    category: 'Other Products',
    price: 580,
    originalPrice: 950,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    description: 'High density Oxford fabric with separate wet/dry pocket and dedicated shoe compartment. Fixes securely onto luggage trolley handles. Wholesale favorite.',
    stock: 110,
    minOrderQuantity: 6,
    isFeatured: false,
    isNew: true,
  },
  {
    id: 'prod-solar-wall-light',
    name: 'Outdoor Solar Powered 100-LED Motion Sensor Security Wall Light',
    category: 'Other Products',
    price: 290,
    originalPrice: 480,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    description: 'IP65 waterproof solar lamp with 270-degree wide angle illumination and PIR motion detector. Turns on automatically upon sensing movement up to 5 meters.',
    stock: 160,
    minOrderQuantity: 10,
    isFeatured: true,
    isNew: true,
  },
];

function ensureDatabase(): DatabaseData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseData = {
        settings: DEFAULT_STORE_SETTINGS,
        categories: DEFAULT_CATEGORIES,
        products: INITIAL_PRODUCTS,
        orders: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    // Merge defaults if fields are missing
    let modified = false;
    if (!parsed.settings || !parsed.settings.storeName || parsed.settings.storeName === 'China Direct BD') {
      parsed.settings = DEFAULT_STORE_SETTINGS;
      modified = true;
    }
    if (!parsed.categories || !Array.isArray(parsed.categories) || parsed.categories.length === 0) {
      parsed.categories = DEFAULT_CATEGORIES;
      modified = true;
    }
    if (!parsed.products || !Array.isArray(parsed.products) || parsed.products.length === 0) {
      parsed.products = INITIAL_PRODUCTS;
      modified = true;
    }
    if (!parsed.orders || !Array.isArray(parsed.orders)) {
      parsed.orders = [];
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed as DatabaseData;
  } catch (err) {
    console.error('Error reading database file:', err);
    return {
      settings: DEFAULT_STORE_SETTINGS,
      categories: DEFAULT_CATEGORIES,
      products: INITIAL_PRODUCTS,
      orders: [],
    };
  }
}

function writeDatabase(data: DatabaseData): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing to database:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Storage backend
// If MONGODB_URI is set, data lives in MongoDB (one document per product,
// category and order, plus one settings document). Otherwise the local JSON
// file in data/store_db.json is used, exactly as before.
// On the first MongoDB start, the collections are seeded from the JSON file.
// ---------------------------------------------------------------------------

type Positioned<T> = T & { _pos: number };

interface MongoCollections {
  settings: Collection<{ _id: string } & StoreSettings>;
  categories: Collection<Positioned<Category>>;
  products: Collection<Positioned<Product>>;
  orders: Collection<Order & { _seq: number }>;
}

let mongoPromise: Promise<MongoCollections> | null = null;

function useMongo(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());
}

const HIDDEN_FIELDS = { projection: { _id: 0, _pos: 0, _seq: 0 } } as const;

function isSrvLookupError(err: any): boolean {
  return /querySrv|queryTxt/i.test(`${err?.syscall || ''} ${err?.message || ''}`);
}

/**
 * Connects with the system DNS first. Some networks (seen on Windows) cannot
 * resolve "mongodb+srv" records and fail with "querySrv ECONNREFUSED"; in that
 * case the lookup is retried once through public DNS servers.
 */
async function openClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI!.trim();
  const options = { serverSelectionTimeoutMS: 15000 };

  const client = new MongoClient(uri, options);
  try {
    await client.connect();
    return client;
  } catch (err) {
    await client.close().catch(() => undefined);
    if (!isSrvLookupError(err)) throw err;

    console.warn('System DNS could not find the MongoDB address. Retrying with public DNS servers...');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    const retry = new MongoClient(uri, options);
    await retry.connect();
    return retry;
  }
}

async function connectMongo(): Promise<MongoCollections> {
  const client = await openClient();
  const db: Db = client.db(process.env.MONGODB_DB_NAME || 'shanghai_namutong');

  const cols: MongoCollections = {
    settings: db.collection('settings'),
    categories: db.collection('categories'),
    products: db.collection('products'),
    orders: db.collection('orders'),
  };

  await Promise.all([
    cols.products.createIndex({ id: 1 }, { unique: true }),
    cols.categories.createIndex({ id: 1 }),
    cols.orders.createIndex({ orderNumber: 1 }),
    cols.orders.createIndex({ _seq: -1 }),
  ]);

  // First start: copy the existing JSON data (or defaults) into MongoDB.
  const hasSettings = await cols.settings.findOne({ _id: 'store' });
  if (!hasSettings) {
    const seed = ensureDatabase();
    console.log('MongoDB is empty. Importing data from data/store_db.json ...');
    await cols.settings.insertOne({ _id: 'store', ...seed.settings });
    if ((await cols.categories.countDocuments()) === 0 && seed.categories.length) {
      await cols.categories.insertMany(seed.categories.map((c, i) => ({ ...c, _pos: i })));
    }
    if ((await cols.products.countDocuments()) === 0 && seed.products.length) {
      await cols.products.insertMany(seed.products.map((p, i) => ({ ...p, _pos: i })));
    }
    if ((await cols.orders.countDocuments()) === 0 && seed.orders.length) {
      const now = Date.now();
      // Array is newest-first, so the first order gets the highest sequence.
      await cols.orders.insertMany(seed.orders.map((o, i) => ({ ...o, _seq: now - i })));
    }
    console.log('Import to MongoDB finished.');
  }

  console.log('Connected to MongoDB.');
  return cols;
}

function mongo(): Promise<MongoCollections> {
  if (!mongoPromise) {
    mongoPromise = connectMongo().catch((err) => {
      mongoPromise = null; // allow a retry on the next request
      console.error('MongoDB connection failed:', err?.message || err);
      throw err;
    });
  }
  return mongoPromise;
}

/** Connects early so startup logs show whether MongoDB works. */
export async function initDatabase(): Promise<void> {
  if (useMongo()) {
    await mongo();
  } else {
    ensureDatabase();
    console.log('MONGODB_URI not set. Using local file data/store_db.json.');
  }
}

/** Replace a whole list: upsert every item in order, remove items no longer present. */
async function replaceList<T extends { id: string }>(
  col: Collection<Positioned<T>>,
  items: T[]
): Promise<void> {
  const ops: AnyBulkWriteOperation<Positioned<T>>[] = items.map((item, i) => {
    const { _id, ...clean } = item as any;
    return {
      replaceOne: {
        filter: { id: item.id } as any,
        replacement: { ...clean, _pos: i } as any,
        upsert: true,
      },
    };
  });
  ops.push({ deleteMany: { filter: { id: { $nin: items.map((i) => i.id) } } as any } });
  await col.bulkWrite(ops, { ordered: true });
}

// Database API helpers

export async function getSettings(): Promise<StoreSettings> {
  if (!useMongo()) return ensureDatabase().settings || DEFAULT_STORE_SETTINGS;
  const { settings } = await mongo();
  const doc = await settings.findOne({ _id: 'store' }, { projection: { _id: 0 } });
  return (doc as StoreSettings) || DEFAULT_STORE_SETTINGS;
}

export async function updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  if (!useMongo()) {
    const db = ensureDatabase();
    db.settings = { ...db.settings, ...updates };
    writeDatabase(db);
    return db.settings;
  }
  const { settings } = await mongo();
  const { _id, ...clean } = updates as any;
  await settings.updateOne({ _id: 'store' }, { $set: clean }, { upsert: true });
  return getSettings();
}

export async function getCategories(): Promise<Category[]> {
  if (!useMongo()) return ensureDatabase().categories || DEFAULT_CATEGORIES;
  const { categories } = await mongo();
  const list = (await categories.find({}, HIDDEN_FIELDS).sort({ _pos: 1 }).toArray()) as Category[];
  return list.length ? list : DEFAULT_CATEGORIES;
}

export async function saveCategories(list: Category[]): Promise<Category[]> {
  if (!useMongo()) {
    const db = ensureDatabase();
    db.categories = list;
    writeDatabase(db);
    return db.categories;
  }
  const { categories } = await mongo();
  await replaceList(categories, list);
  return getCategories();
}

export async function getProducts(): Promise<Product[]> {
  if (!useMongo()) return ensureDatabase().products || [];
  const { products } = await mongo();
  return (await products.find({}, HIDDEN_FIELDS).sort({ _pos: 1 }).toArray()) as Product[];
}

export async function saveProducts(list: Product[]): Promise<Product[]> {
  if (!useMongo()) {
    const db = ensureDatabase();
    db.products = list;
    writeDatabase(db);
    return db.products;
  }
  const { products } = await mongo();
  await replaceList(products, list);
  return getProducts();
}

export async function getOrders(): Promise<Order[]> {
  if (!useMongo()) return ensureDatabase().orders || [];
  const { orders } = await mongo();
  return (await orders.find({}, HIDDEN_FIELDS).sort({ _seq: -1 }).toArray()) as Order[];
}

export async function addOrder(order: Order): Promise<{ success: boolean; order: Order; products: Product[] }> {
  // New orders always default to stockDeducted: false (stock is deducted ONLY after payment is confirmed)
  const { _id, ...cleanOrder } = order as any;
  const newOrder: Order = {
    ...cleanOrder,
    paymentStatus: 'Payment Pending',
    orderStatus: order.orderStatus || 'Pending',
    stockDeducted: false,
  };

  if (!useMongo()) {
    const db = ensureDatabase();
    db.orders.unshift(newOrder);
    writeDatabase(db);
    return { success: true, order: newOrder, products: db.products };
  }

  const { orders } = await mongo();
  await orders.insertOne({ ...newOrder, _seq: Date.now() });
  return { success: true, order: newOrder, products: await getProducts() };
}

/** Applies status changes and stock rules to an order, mutating order and product objects. */
function applyOrderUpdate(
  order: Order,
  products: Product[],
  updates: { orderStatus?: string; paymentStatus?: string }
): Set<string> {
  const touched = new Set<string>();

  if (updates.paymentStatus) {
    order.paymentStatus = updates.paymentStatus as any;
    // Confirming payment moves an order out of "Payment Pending" (same as the admin UI did before).
    if (updates.paymentStatus === 'Payment Confirmed' && order.orderStatus === 'Payment Pending') {
      order.orderStatus = 'Confirmed';
    }
  }
  if (updates.orderStatus) {
    order.orderStatus = updates.orderStatus;
  }

  // Requirement 7: STOCK MANAGEMENT
  // "When an order is placed, do not permanently reduce stock until payment is confirmed.
  // After payment is confirmed: New Stock = Previous Stock - Ordered Quantity. Never allow negative stock.
  // If an order is cancelled after stock was deducted, restore the ordered quantity."
  // Stock stays deducted exactly while payment is confirmed and the order is not cancelled.
  // Moving payment back to pending/rejected, or cancelling, restores it; un-cancelling deducts again.

  const isPaymentConfirmed =
    order.paymentStatus === 'Payment Confirmed' || (order.paymentStatus as string) === 'Paid';
  const shouldBeDeducted = isPaymentConfirmed && order.orderStatus !== 'Cancelled';

  // Deduction rule:
  if (shouldBeDeducted && !order.stockDeducted) {
    // Deduct stock for all products in this order
    for (const item of order.products) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const qty = Number(item.quantity) || 1;
        prod.stock = Math.max(0, (prod.stock || 0) - qty);
        touched.add(prod.id);
      }
    }
    order.stockDeducted = true;
  }
  // Restoration rule:
  else if (!shouldBeDeducted && order.stockDeducted) {
    // Restore stock previously deducted
    for (const item of order.products) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const qty = Number(item.quantity) || 1;
        prod.stock = (prod.stock || 0) + qty;
        touched.add(prod.id);
      }
    }
    order.stockDeducted = false;
  }

  return touched;
}

/** Restores stock for a deleted order if it had been deducted. */
function restoreStockForDeletedOrder(order: Order, products: Product[]): Set<string> {
  const touched = new Set<string>();
  if (order.stockDeducted) {
    for (const item of order.products) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = (prod.stock || 0) + (Number(item.quantity) || 1);
        touched.add(prod.id);
      }
    }
  }
  return touched;
}

async function writeStock(products: Product[], ids: Set<string>): Promise<void> {
  const changed = products.filter((p) => ids.has(p.id));
  if (changed.length === 0) return;
  const { products: col } = await mongo();
  await col.bulkWrite(
    changed.map((p) => ({ updateOne: { filter: { id: p.id }, update: { $set: { stock: p.stock } } } }))
  );
}

export async function updateOrderStatusAndPayment(
  orderNumber: string,
  updates: { orderStatus?: string; paymentStatus?: string }
): Promise<{ success: boolean; order?: Order; products: Product[]; message?: string }> {
  if (!useMongo()) {
    const db = ensureDatabase();
    const order = db.orders.find((o) => o.orderNumber === orderNumber);
    if (!order) {
      return { success: false, products: db.products, message: 'Order not found' };
    }
    applyOrderUpdate(order, db.products, updates);
    writeDatabase(db);
    return { success: true, order, products: db.products };
  }

  const { orders } = await mongo();
  const order = (await orders.findOne({ orderNumber }, HIDDEN_FIELDS)) as Order | null;
  const products = await getProducts();
  if (!order) {
    return { success: false, products, message: 'Order not found' };
  }

  const touched = applyOrderUpdate(order, products, updates);
  await orders.updateOne(
    { orderNumber },
    {
      $set: {
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        stockDeducted: order.stockDeducted,
      },
    }
  );
  await writeStock(products, touched);
  return { success: true, order, products };
}

export async function deleteOrder(orderNumber: string): Promise<{ success: boolean; products: Product[] }> {
  if (!useMongo()) {
    const db = ensureDatabase();
    const orderIndex = db.orders.findIndex((o) => o.orderNumber === orderNumber);
    if (orderIndex === -1) {
      return { success: false, products: db.products };
    }
    restoreStockForDeletedOrder(db.orders[orderIndex], db.products);
    db.orders.splice(orderIndex, 1);
    writeDatabase(db);
    return { success: true, products: db.products };
  }

  const { orders } = await mongo();
  const order = (await orders.findOne({ orderNumber }, HIDDEN_FIELDS)) as Order | null;
  const products = await getProducts();
  if (!order) {
    return { success: false, products };
  }

  const touched = restoreStockForDeletedOrder(order, products);
  await writeStock(products, touched);
  await orders.deleteOne({ orderNumber });
  return { success: true, products };
}
