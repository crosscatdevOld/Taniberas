export interface RiceVariant {
  id: string;
  weightKg: number;
  label: string;
  price: number;
  stock: number;
}

export interface RiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface RiceProduct {
  id: string;
  slug: string;
  name: string;
  variety: string;
  categorySlug: string;
  origin: string;
  farmerGroup: string;
  shortDescription: string;
  description: string;
  texture: string;
  aroma: string;
  moistureContent: string;
  brokenGrainMax: string;
  harvestBatch: string;
  images: string[];
  variants: RiceVariant[];
  isFeatured: boolean;
  popularity: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  variety: string;
  image: string;
  variantId: string;
  weightLabel: string;
  weightKg: number;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export type OrderStatus =
  | 'Menunggu Konfirmasi'
  | 'Diproses'
  | 'Dikirim'
  | 'Selesai'
  | 'Dibatalkan';

export type PaymentMethod = 'Transfer Bank' | 'COD' | 'WhatsApp Order';

export interface OrderItemRecord {
  productId: string;
  productName: string;
  variety: string;
  variantId: string;
  weightLabel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  address: string;
  paymentMethod: PaymentMethod;
  channel: 'website' | 'whatsapp';
  status: OrderStatus;
  notes: string;
  items: OrderItemRecord[];
  shippingCost: number;
  totalAmount: number;
  createdAt: string;
}

export type CustomerSegment = 'Rumah Tangga' | 'Horeka' | 'Reseller';

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  segment: CustomerSegment;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
}

export type PartnerType =
  | 'Petani'
  | 'Kelompok Tani'
  | 'Distributor'
  | 'Reseller'
  | 'Agen Penjualan';

export type PartnerStatus = 'Baru' | 'Ditinjau' | 'Disetujui' | 'Ditolak';

export interface PartnershipRecord {
  id: string;
  fullName: string;
  organizationName: string;
  partnerType: PartnerType;
  phone: string;
  email: string;
  region: string;
  estimatedCapacity: string;
  message: string;
  status: PartnerStatus;
  createdAt: string;
}

export interface ArticleRecord {
  id: string;
  slug: string;
  title: string;
  category:
    | 'Edukasi Kualitas'
    | 'Tips Memilih Beras'
    | 'Pertanian & Pascapanen'
    | 'Kabar Petani';
  author: string;
  readTime: string;
  publishedAt: string;
  coverImage: string;
  excerpt: string;
  content: string[];
}

export interface ContactRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Baru' | 'Dibalas';
  createdAt: string;
}

export interface TestimonialRecord {
  id: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  ricePurchased: string;
}

export interface StorePublicSnapshot {
  categories: RiceCategory[];
  products: RiceProduct[];
  articles: ArticleRecord[];
  testimonials: TestimonialRecord[];
}
