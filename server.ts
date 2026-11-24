import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { getStore, saveStore, hashPassword, verifyPassword } from './src/server/store.ts';
import type {
  ArticleRecord,
  CustomerSegment,
  OrderItemRecord,
  OrderRecord,
  OrderStatus,
  PartnerStatus,
  PartnerType,
  PaymentMethod,
  RiceCategory,
  RiceProduct,
  RiceVariant,
} from './src/types.ts';

const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const WHATSAPP_ADMIN_NUMBER = '6281122334455';
const PANDAN_IMG = '/src/assets/images/product_pandan_wangi_1795527041071.jpg';
const VARIETIES_IMG = '/src/assets/images/article_rice_quality_1795527040679.jpg';

interface TokenPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

function signAdminToken(): string {
  const now = Date.now();
  const payload: TokenPayload = {
    role: 'admin',
    iat: now,
    exp: now + 12 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf-8')
    ) as TokenPayload;
    return parsed.role === 'admin' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Autentikasi admin diperlukan.' });
    return;
  }
  const token = header.slice('Bearer '.length).trim();
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: 'Sesi admin tidak valid atau sudah berakhir.' });
    return;
  }
  next();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function cleanString(val: unknown, maxLen = 500): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // --- Public API Routes ---

  app.get('/api/storefront', (_req, res) => {
    const store = getStore();
    res.json({
      categories: store.categories,
      products: store.products,
      articles: store.articles,
      testimonials: store.testimonials,
    });
  });

  app.get('/api/products', (req, res) => {
    const store = getStore();
    const q = cleanString(req.query.q, 120).toLowerCase();
    const category = cleanString(req.query.category, 60);
    const sort = cleanString(req.query.sort, 40) || 'popular';
    const priceRange = cleanString(req.query.price, 40) || 'all';

    let items = [...store.products];

    if (q) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.variety.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'all') {
      items = items.filter((p) => p.categorySlug === category);
    }

    if (priceRange !== 'all') {
      items = items.filter((p) => {
        const minPrice = Math.min(...p.variants.map((v) => v.price));
        if (priceRange === 'under75') return minPrice < 75000;
        if (priceRange === '75to150') return minPrice >= 75000 && minPrice <= 150000;
        if (priceRange === 'above150') return minPrice > 150000;
        return true;
      });
    }

    if (sort === 'price-asc') {
      items.sort(
        (a, b) =>
          Math.min(...a.variants.map((v) => v.price)) -
          Math.min(...b.variants.map((v) => v.price))
      );
    } else if (sort === 'price-desc') {
      items.sort(
        (a, b) =>
          Math.min(...b.variants.map((v) => v.price)) -
          Math.min(...a.variants.map((v) => v.price))
      );
    } else if (sort === 'newest') {
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else {
      items.sort((a, b) => b.popularity - a.popularity);
    }

    res.json({ products: items });
  });

  app.get('/api/products/:slug', (req, res) => {
    const store = getStore();
    const product = store.products.find((p) => p.slug === req.params.slug);
    if (!product) {
      res.status(404).json({ error: 'Produk tidak ditemukan.' });
      return;
    }
    res.json({ product });
  });

  app.get('/api/articles', (_req, res) => {
    const store = getStore();
    res.json({ articles: store.articles });
  });

  app.post('/api/orders', (req, res) => {
    const store = getStore();
    const body = req.body as Record<string, unknown>;

    const customerName = cleanString(body.customerName, 120);
    const customerPhone = cleanString(body.customerPhone, 30);
    const customerEmail = cleanString(body.customerEmail, 120);
    const city = cleanString(body.city, 100);
    const address = cleanString(body.address, 400);
    const notes = cleanString(body.notes, 300);
    const paymentMethodRaw = cleanString(body.paymentMethod, 40);
    const channelRaw = cleanString(body.channel, 20);

    if (!customerName || !isValidPhone(customerPhone) || !city || !address) {
      res.status(400).json({
        error: 'Mohon lengkapi nama, nomor WhatsApp valid, kota, dan alamat pengiriman.',
      });
      return;
    }
    if (customerEmail && !isValidEmail(customerEmail)) {
      res.status(400).json({ error: 'Format email tidak valid.' });
      return;
    }

    const allowedPayments: PaymentMethod[] = ['Transfer Bank', 'COD', 'WhatsApp Order'];
    const paymentMethod: PaymentMethod = allowedPayments.includes(
      paymentMethodRaw as PaymentMethod
    )
      ? (paymentMethodRaw as PaymentMethod)
      : 'Transfer Bank';
    const channel: 'website' | 'whatsapp' =
      channelRaw === 'whatsapp' ? 'whatsapp' : 'website';

    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0 || rawItems.length > 30) {
      res.status(400).json({ error: 'Keranjang belanja tidak boleh kosong.' });
      return;
    }

    const verifiedItems: OrderItemRecord[] = [];
    const stockDeductions: Array<{ variant: RiceVariant; qty: number }> = [];

    for (const raw of rawItems) {
      if (!raw || typeof raw !== 'object') {
        res.status(400).json({ error: 'Data item pesanan tidak valid.' });
        return;
      }
      const itemObj = raw as Record<string, unknown>;
      const productId = cleanString(itemObj.productId, 80);
      const variantId = cleanString(itemObj.variantId, 80);
      const quantity = Number(itemObj.quantity);

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        res.status(400).json({ error: 'Jumlah pembelian tidak valid.' });
        return;
      }

      const product = store.products.find((p) => p.id === productId);
      if (!product) {
        res.status(404).json({ error: 'Salah satu produk tidak ditemukan.' });
        return;
      }

      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        res.status(404).json({ error: `Kemasan untuk ${product.name} tidak ditemukan.` });
        return;
      }

      if (variant.stock < quantity) {
        res.status(409).json({
          error: `Stok ${product.name} (${variant.label}) tersisa ${variant.stock} unit.`,
        });
        return;
      }

      stockDeductions.push({ variant, qty: quantity });
      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        variety: product.variety,
        variantId: variant.id,
        weightLabel: variant.label,
        quantity,
        unitPrice: variant.price,
        subtotal: variant.price * quantity,
      });
    }

    for (const d of stockDeductions) {
      d.variant.stock -= d.qty;
    }

    const subtotal = verifiedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingCost = subtotal >= 250000 ? 0 : 18000;
    const totalAmount = subtotal + shippingCost;

    const orderNumSuffix = String(1001 + store.orders.length).padStart(4, '0');
    const orderNumber = `TB-26${orderNumSuffix}`;
    const nowIso = new Date().toISOString();

    const newOrder: OrderRecord = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      city,
      address,
      paymentMethod,
      channel,
      status: 'Menunggu Konfirmasi',
      notes,
      items: verifiedItems,
      shippingCost,
      totalAmount,
      createdAt: nowIso,
    };

    store.orders.unshift(newOrder);

    const existingCustomer = store.customers.find(
      (c) => c.phone.replace(/[^0-9]/g, '') === customerPhone.replace(/[^0-9]/g, '')
    );
    if (existingCustomer) {
      existingCustomer.name = customerName;
      if (customerEmail) existingCustomer.email = customerEmail;
      existingCustomer.city = city;
      existingCustomer.address = address;
      existingCustomer.totalOrders += 1;
      existingCustomer.totalSpent += totalAmount;
      existingCustomer.lastOrderAt = nowIso;
    } else {
      store.customers.unshift({
        id: `cust-${crypto.randomUUID().slice(0, 8)}`,
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        city,
        address,
        segment: totalAmount >= 500000 ? 'Horeka' : 'Rumah Tangga',
        totalOrders: 1,
        totalSpent: totalAmount,
        lastOrderAt: nowIso,
      });
    }

    saveStore(store);

    const lines = [
      `Halo Admin *TANIBERAS*, saya ingin konfirmasi pesanan:`,
      `No. Pesanan: *${orderNumber}*`,
      `Nama: ${customerName}`,
      `No. HP: ${customerPhone}`,
      `Alamat: ${address}, ${city}`,
      ``,
      `*Daftar Beras:*`,
      ...verifiedItems.map(
        (it) =>
          `- ${it.productName} (${it.weightLabel}) x${it.quantity} = Rp ${it.subtotal.toLocaleString('id-ID')}`
      ),
      `Ongkir: ${shippingCost === 0 ? 'Gratis' : `Rp ${shippingCost.toLocaleString('id-ID')}`}`,
      `*Total: Rp ${totalAmount.toLocaleString('id-ID')}*`,
      `Metode: ${paymentMethod}`,
      notes ? `Catatan: ${notes}` : '',
    ].filter(Boolean);

    const whatsappUrl = `https://wa.me/${WHATSAPP_ADMIN_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;

    res.status(201).json({ order: newOrder, whatsappUrl });
  });

  app.post('/api/partnerships', (req, res) => {
    const store = getStore();
    const body = req.body as Record<string, unknown>;
    const fullName = cleanString(body.fullName, 120);
    const organizationName = cleanString(body.organizationName, 150);
    const partnerTypeRaw = cleanString(body.partnerType, 40);
    const phone = cleanString(body.phone, 30);
    const email = cleanString(body.email, 120);
    const region = cleanString(body.region, 120);
    const estimatedCapacity = cleanString(body.estimatedCapacity, 120);
    const message = cleanString(body.message, 800);

    const allowedTypes: PartnerType[] = [
      'Petani',
      'Kelompok Tani',
      'Distributor',
      'Reseller',
      'Agen Penjualan',
    ];
    if (
      !fullName ||
      !allowedTypes.includes(partnerTypeRaw as PartnerType) ||
      !isValidPhone(phone) ||
      !isValidEmail(email) ||
      !region
    ) {
      res.status(400).json({
        error: 'Mohon isi nama lengkap, jenis kemitraan, nomor WhatsApp, email valid, dan wilayah.',
      });
      return;
    }

    const record = {
      id: `part-${crypto.randomUUID().slice(0, 8)}`,
      fullName,
      organizationName: organizationName || 'Perorangan',
      partnerType: partnerTypeRaw as PartnerType,
      phone,
      email,
      region,
      estimatedCapacity: estimatedCapacity || 'Belum ditentukan',
      message,
      status: 'Baru' as PartnerStatus,
      createdAt: new Date().toISOString(),
    };

    store.partnerships.unshift(record);
    saveStore(store);
    res.status(201).json({ partnership: record });
  });

  app.post('/api/contacts', (req, res) => {
    const store = getStore();
    const body = req.body as Record<string, unknown>;
    const name = cleanString(body.name, 120);
    const email = cleanString(body.email, 120);
    const phone = cleanString(body.phone, 30);
    const subject = cleanString(body.subject, 160);
    const message = cleanString(body.message, 1000);

    if (!name || !isValidEmail(email) || !subject || !message) {
      res.status(400).json({
        error: 'Nama, email valid, subjek, dan isi pesan wajib diisi.',
      });
      return;
    }

    const record = {
      id: `cnt-${crypto.randomUUID().slice(0, 8)}`,
      name,
      email,
      phone,
      subject,
      message,
      status: 'Baru' as const,
      createdAt: new Date().toISOString(),
    };

    store.contacts.unshift(record);
    saveStore(store);
    res.status(201).json({ contact: record });
  });

  // --- Admin Auth Routes ---

  app.get('/api/admin/auth-status', (_req, res) => {
    const store = getStore();
    const envPasscode = process.env.ADMIN_PASSCODE?.trim();
    if (envPasscode) {
      res.json({ configured: true, mode: 'env' });
      return;
    }
    if (store.adminCredential) {
      res.json({ configured: true, mode: 'claimed' });
      return;
    }
    res.json({ configured: false, mode: 'unclaimed' });
  });

  app.post('/api/admin/claim', (req, res) => {
    const store = getStore();
    const envPasscode = process.env.ADMIN_PASSCODE?.trim();
    if (envPasscode || store.adminCredential) {
      res.status(409).json({
        error: 'Sandi admin sudah diaktifkan sebelumnya. Silakan masuk dengan sandi Anda.',
      });
      return;
    }
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Sandi admin minimal 8 karakter.' });
      return;
    }
    store.adminCredential = hashPassword(password);
    saveStore(store);
    const token = signAdminToken();
    res.status(201).json({ token });
  });

  app.post('/api/admin/login', (req, res) => {
    const store = getStore();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const envPasscode = process.env.ADMIN_PASSCODE?.trim();

    if (envPasscode) {
      const a = Buffer.from(password);
      const b = Buffer.from(envPasscode);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        res.status(401).json({ error: 'Sandi admin tidak sesuai.' });
        return;
      }
      res.json({ token: signAdminToken() });
      return;
    }

    if (!store.adminCredential) {
      res.status(400).json({ error: 'Sandi admin belum diaktivasi.' });
      return;
    }

    if (!verifyPassword(password, store.adminCredential)) {
      res.status(401).json({ error: 'Sandi admin tidak sesuai.' });
      return;
    }

    res.json({ token: signAdminToken() });
  });

  // --- Protected Admin API Routes ---

  app.get('/api/admin/overview', requireAdminAuth, (_req, res) => {
    const store = getStore();
    const validOrders = store.orders.filter((o) => o.status !== 'Dibatalkan');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = store.orders.filter(
      (o) => o.status === 'Menunggu Konfirmasi' || o.status === 'Diproses'
    ).length;

    const lowStockVariants: Array<{
      productId: string;
      productName: string;
      variantLabel: string;
      stock: number;
    }> = [];
    for (const p of store.products) {
      for (const v of p.variants) {
        if (v.stock <= 20) {
          lowStockVariants.push({
            productId: p.id,
            productName: p.name,
            variantLabel: v.label,
            stock: v.stock,
          });
        }
      }
    }

    res.json({
      stats: {
        totalRevenue,
        totalOrders: store.orders.length,
        pendingOrders,
        totalCustomers: store.customers.length,
        totalProducts: store.products.length,
        pendingPartners: store.partnerships.filter((p) => p.status === 'Baru').length,
      },
      lowStockVariants,
      products: store.products,
      categories: store.categories,
      orders: store.orders,
      customers: store.customers,
      articles: store.articles,
      partnerships: store.partnerships,
      contacts: store.contacts,
    });
  });

  app.post('/api/admin/products', requireAdminAuth, (req, res) => {
    const store = getStore();
    const b = req.body as Record<string, unknown>;
    const name = cleanString(b.name, 140);
    const variety = cleanString(b.variety, 120);
    const categorySlug = cleanString(b.categorySlug, 60);
    const origin = cleanString(b.origin, 140);
    const farmerGroup = cleanString(b.farmerGroup, 140);
    const shortDescription = cleanString(b.shortDescription, 280);
    const description = cleanString(b.description, 2000);
    const texture = cleanString(b.texture, 80) || 'Pulen Alami';
    const aroma = cleanString(b.aroma, 80) || 'Alami Segar';
    const moistureContent = cleanString(b.moistureContent, 40) || '13,2%';
    const brokenGrainMax = cleanString(b.brokenGrainMax, 40) || 'Maks. 5%';
    const harvestBatch = cleanString(b.harvestBatch, 80) || 'Panen Terbaru';
    const isFeatured = Boolean(b.isFeatured);

    const rawImages = Array.isArray(b.images)
      ? b.images.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      : [];
    const images = rawImages.length > 0 ? rawImages : [PANDAN_IMG];

    const rawVariants = Array.isArray(b.variants) ? b.variants : [];
    const variants: RiceVariant[] = rawVariants
      .map((rv, idx) => {
        const vObj = rv as Record<string, unknown>;
        const weightKg = Number(vObj.weightKg) || 5;
        const price = Number(vObj.price) || 0;
        const stock = Math.max(0, Math.floor(Number(vObj.stock) || 0));
        return {
          id: cleanString(vObj.id, 40) || `var-${Date.now()}-${idx}`,
          weightKg,
          label: cleanString(vObj.label, 30) || `${weightKg} kg`,
          price,
          stock,
        };
      })
      .filter((v) => v.price > 0);

    if (!name || !variety || !categorySlug || variants.length === 0) {
      res.status(400).json({
        error: 'Nama produk, varietas, kategori, dan minimal 1 varian harga wajib diisi.',
      });
      return;
    }

    const baseSlug = slugify(name);
    const slugExists = store.products.some((p) => p.slug === baseSlug);
    const newProduct: RiceProduct = {
      id: `prod-${crypto.randomUUID().slice(0, 8)}`,
      slug: slugExists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug,
      name,
      variety,
      categorySlug,
      origin: origin || 'Sentra Padi Mitra Taniberas',
      farmerGroup: farmerGroup || 'Kelompok Tani Mitra Taniberas',
      shortDescription: shortDescription || description.slice(0, 140),
      description: description || shortDescription,
      texture,
      aroma,
      moistureContent,
      brokenGrainMax,
      harvestBatch,
      images,
      variants,
      isFeatured,
      popularity: 80,
      createdAt: new Date().toISOString(),
    };

    store.products.unshift(newProduct);
    saveStore(store);
    res.status(201).json({ product: newProduct });
  });

  app.put('/api/admin/products/:id', requireAdminAuth, (req, res) => {
    const store = getStore();
    const idx = store.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Produk tidak ditemukan.' });
      return;
    }
    const existing = store.products[idx];
    const b = req.body as Record<string, unknown>;

    const variants: RiceVariant[] = Array.isArray(b.variants)
      ? b.variants
          .map((rv, i) => {
            const vObj = rv as Record<string, unknown>;
            const weightKg = Number(vObj.weightKg) || 5;
            return {
              id: cleanString(vObj.id, 40) || `var-${Date.now()}-${i}`,
              weightKg,
              label: cleanString(vObj.label, 30) || `${weightKg} kg`,
              price: Math.max(1000, Number(vObj.price) || 0),
              stock: Math.max(0, Math.floor(Number(vObj.stock) || 0)),
            };
          })
          .filter((v) => v.price > 0)
      : existing.variants;

    const images = Array.isArray(b.images) && b.images.length > 0
      ? b.images.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      : existing.images;

    const updated: RiceProduct = {
      ...existing,
      name: cleanString(b.name, 140) || existing.name,
      variety: cleanString(b.variety, 120) || existing.variety,
      categorySlug: cleanString(b.categorySlug, 60) || existing.categorySlug,
      origin: cleanString(b.origin, 140) || existing.origin,
      farmerGroup: cleanString(b.farmerGroup, 140) || existing.farmerGroup,
      shortDescription: cleanString(b.shortDescription, 280) || existing.shortDescription,
      description: cleanString(b.description, 2000) || existing.description,
      texture: cleanString(b.texture, 80) || existing.texture,
      aroma: cleanString(b.aroma, 80) || existing.aroma,
      moistureContent: cleanString(b.moistureContent, 40) || existing.moistureContent,
      brokenGrainMax: cleanString(b.brokenGrainMax, 40) || existing.brokenGrainMax,
      harvestBatch: cleanString(b.harvestBatch, 80) || existing.harvestBatch,
      isFeatured: typeof b.isFeatured === 'boolean' ? b.isFeatured : existing.isFeatured,
      images,
      variants: variants.length > 0 ? variants : existing.variants,
    };

    store.products[idx] = updated;
    saveStore(store);
    res.json({ product: updated });
  });

  app.delete('/api/admin/products/:id', requireAdminAuth, (req, res) => {
    const store = getStore();
    const next = store.products.filter((p) => p.id !== req.params.id);
    if (next.length === store.products.length) {
      res.status(404).json({ error: 'Produk tidak ditemukan.' });
      return;
    }
    store.products = next;
    saveStore(store);
    res.json({ ok: true });
  });

  app.post('/api/admin/categories', requireAdminAuth, (req, res) => {
    const store = getStore();
    const name = cleanString(req.body?.name, 80);
    const description = cleanString(req.body?.description, 240);
    if (!name) {
      res.status(400).json({ error: 'Nama kategori wajib diisi.' });
      return;
    }
    const slug = slugify(name);
    if (store.categories.some((c) => c.slug === slug)) {
      res.status(409).json({ error: 'Kategori dengan nama tersebut sudah ada.' });
      return;
    }
    const newCat: RiceCategory = {
      id: `cat-${crypto.randomUUID().slice(0, 6)}`,
      slug,
      name,
      description: description || `Koleksi ${name} pilihan TANIBERAS.`,
    };
    store.categories.push(newCat);
    saveStore(store);
    res.status(201).json({ category: newCat });
  });

  app.delete('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
    const store = getStore();
    const cat = store.categories.find((c) => c.id === req.params.id);
    if (!cat) {
      res.status(404).json({ error: 'Kategori tidak ditemukan.' });
      return;
    }
    store.categories = store.categories.filter((c) => c.id !== req.params.id);
    saveStore(store);
    res.json({ ok: true });
  });

  app.patch('/api/admin/orders/:id', requireAdminAuth, (req, res) => {
    const store = getStore();
    const order = store.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
      return;
    }
    const allowedStatuses: OrderStatus[] = [
      'Menunggu Konfirmasi',
      'Diproses',
      'Dikirim',
      'Selesai',
      'Dibatalkan',
    ];
    const nextStatus = cleanString(req.body?.status, 40) as OrderStatus;
    if (!allowedStatuses.includes(nextStatus)) {
      res.status(400).json({ error: 'Status pesanan tidak valid.' });
      return;
    }
    order.status = nextStatus;
    saveStore(store);
    res.json({ order });
  });

  app.patch('/api/admin/customers/:id', requireAdminAuth, (req, res) => {
    const store = getStore();
    const cust = store.customers.find((c) => c.id === req.params.id);
    if (!cust) {
      res.status(404).json({ error: 'Data pelanggan tidak ditemukan.' });
      return;
    }
    const allowedSegments: CustomerSegment[] = ['Rumah Tangga', 'Horeka', 'Reseller'];
    const seg = cleanString(req.body?.segment, 40) as CustomerSegment;
    if (allowedSegments.includes(seg)) {
      cust.segment = seg;
    }
    saveStore(store);
    res.json({ customer: cust });
  });

  app.post('/api/admin/articles', requireAdminAuth, (req, res) => {
    const store = getStore();
    const b = req.body as Record<string, unknown>;
    const title = cleanString(b.title, 180);
    const categoryRaw = cleanString(b.category, 60);
    const author = cleanString(b.author, 100) || 'Tim Redaksi TANIBERAS';
    const readTime = cleanString(b.readTime, 40) || '4 menit baca';
    const excerpt = cleanString(b.excerpt, 320);
    const coverImage = cleanString(b.coverImage, 300) || VARIETIES_IMG;
    const contentRaw = cleanString(b.contentText, 6000);

    const allowedCats: ArticleRecord['category'][] = [
      'Edukasi Kualitas',
      'Tips Memilih Beras',
      'Pertanian & Pascapanen',
      'Kabar Petani',
    ];
    const category = allowedCats.includes(categoryRaw as ArticleRecord['category'])
      ? (categoryRaw as ArticleRecord['category'])
      : 'Edukasi Kualitas';

    if (!title || !excerpt || !contentRaw) {
      res.status(400).json({ error: 'Judul, ringkasan, dan isi artikel wajib diisi.' });
      return;
    }

    const paragraphs = contentRaw
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const newArticle: ArticleRecord = {
      id: `art-${crypto.randomUUID().slice(0, 8)}`,
      slug: `${slugify(title)}-${Date.now().toString().slice(-4)}`,
      title,
      category,
      author,
      readTime,
      publishedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      coverImage,
      excerpt,
      content: paragraphs.length > 0 ? paragraphs : [contentRaw],
    };

    store.articles.unshift(newArticle);
    saveStore(store);
    res.status(201).json({ article: newArticle });
  });

  app.put('/api/admin/articles/:id', requireAdminAuth, (req, res) => {
    const store = getStore();
    const idx = store.articles.findIndex((a) => a.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Artikel tidak ditemukan.' });
      return;
    }
    const existing = store.articles[idx];
    const b = req.body as Record<string, unknown>;
    const contentRaw = cleanString(b.contentText, 6000);
    const paragraphs = contentRaw
      ? contentRaw
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
      : existing.content;

    store.articles[idx] = {
      ...existing,
      title: cleanString(b.title, 180) || existing.title,
      author: cleanString(b.author, 100) || existing.author,
      readTime: cleanString(b.readTime, 40) || existing.readTime,
      excerpt: cleanString(b.excerpt, 320) || existing.excerpt,
      coverImage: cleanString(b.coverImage, 300) || existing.coverImage,
      content: paragraphs,
    };
    saveStore(store);
    res.json({ article: store.articles[idx] });
  });

  app.delete('/api/admin/articles/:id', requireAdminAuth, (req, res) => {
    const store = getStore();
    const next = store.articles.filter((a) => a.id !== req.params.id);
    if (next.length === store.articles.length) {
      res.status(404).json({ error: 'Artikel tidak ditemukan.' });
      return;
    }
    store.articles = next;
    saveStore(store);
    res.json({ ok: true });
  });

  app.patch('/api/admin/partnerships/:id', requireAdminAuth, (req, res) => {
    const store = getStore();
    const part = store.partnerships.find((p) => p.id === req.params.id);
    if (!part) {
      res.status(404).json({ error: 'Data mitra tidak ditemukan.' });
      return;
    }
    const allowed: PartnerStatus[] = ['Baru', 'Ditinjau', 'Disetujui', 'Ditolak'];
    const nextStatus = cleanString(req.body?.status, 30) as PartnerStatus;
    if (!allowed.includes(nextStatus)) {
      res.status(400).json({ error: 'Status mitra tidak valid.' });
      return;
    }
    part.status = nextStatus;
    saveStore(store);
    res.json({ partnership: part });
  });

  app.patch('/api/admin/contacts/:id', requireAdminAuth, (req, res) => {
    const store = getStore();
    const cnt = store.contacts.find((c) => c.id === req.params.id);
    if (!cnt) {
      res.status(404).json({ error: 'Pesan tidak ditemukan.' });
      return;
    }
    cnt.status = req.body?.status === 'Dibalas' ? 'Dibalas' : 'Baru';
    saveStore(store);
    res.json({ contact: cnt });
  });

  // --- Vite / Static Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build belum tersedia. Jalankan npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TANIBERAS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
