import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Edit3,
  FileText,
  FolderTree,
  Handshake,
  LayoutDashboard,
  Lock,
  LogOut,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type {
  ArticleRecord,
  ContactRecord,
  CustomerRecord,
  CustomerSegment,
  OrderRecord,
  OrderStatus,
  PartnershipRecord,
  PartnerStatus,
  RiceCategory,
  RiceProduct,
  RiceVariant,
} from '../types.ts';
import {
  AVAILABLE_ASSET_IMAGES,
  formatRupiah,
  formatShortDate,
} from '../utils/format.ts';
import { ResilientImage } from '../components/ResilientImage.tsx';

interface AdminDashboardPageProps {
  token: string | null;
  onSetToken: (token: string | null) => void;
  onNavigateHome: () => void;
  onRefreshStorefront: () => Promise<void>;
}

type AdminTab =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'articles'
  | 'partners';

interface OverviewPayload {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalCustomers: number;
    totalProducts: number;
    pendingPartners: number;
  };
  lowStockVariants: Array<{
    productId: string;
    productName: string;
    variantLabel: string;
    stock: number;
  }>;
  products: RiceProduct[];
  categories: RiceCategory[];
  orders: OrderRecord[];
  customers: CustomerRecord[];
  articles: ArticleRecord[];
  partnerships: PartnershipRecord[];
  contacts: ContactRecord[];
}

const TAB_ITEMS: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'products', label: 'Produk & Stok', icon: Package },
  { id: 'categories', label: 'Kategori', icon: FolderTree },
  { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
  { id: 'customers', label: 'Pelanggan', icon: Users },
  { id: 'articles', label: 'Artikel', icon: FileText },
  { id: 'partners', label: 'Mitra & Pesan', icon: Handshake },
];

export function AdminDashboardPage({
  token,
  onSetToken,
  onNavigateHome,
  onRefreshStorefront,
}: AdminDashboardPageProps) {
  const [authMode, setAuthMode] = useState<'loading' | 'unclaimed' | 'login'>('loading');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('Semua');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [partnerSubTab, setPartnerSubTab] = useState<'partnerships' | 'contacts'>(
    'partnerships'
  );

  // Category Form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [catFeedback, setCatFeedback] = useState('');

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<RiceProduct | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodVariety, setProdVariety] = useState('');
  const [prodCategorySlug, setProdCategorySlug] = useState('');
  const [prodOrigin, setProdOrigin] = useState('');
  const [prodFarmerGroup, setProdFarmerGroup] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState(AVAILABLE_ASSET_IMAGES[0].url);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodVariants, setProdVariants] = useState<RiceVariant[]>([
    { id: 'v-5', weightKg: 5, label: '5 kg', price: 95000, stock: 50 },
  ]);
  const [prodSaving, setProdSaving] = useState(false);
  const [prodModalError, setProdModalError] = useState('');

  // Article Modal State
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleRecord | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] =
    useState<ArticleRecord['category']>('Edukasi Kualitas');
  const [artAuthor, setArtAuthor] = useState('');
  const [artReadTime, setArtReadTime] = useState('4 menit baca');
  const [artCover, setArtCover] = useState(AVAILABLE_ASSET_IMAGES[3].url);
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artContentText, setArtContentText] = useState('');
  const [artSaving, setArtSaving] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth-status');
      const json = await res.json();
      setAuthMode(json.configured ? 'login' : 'unclaimed');
    } catch {
      setAuthMode('login');
    }
  }, []);

  const loadOverview = useCallback(
    async (bearer: string) => {
      setLoadingData(true);
      setDataError('');
      try {
        const res = await fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${bearer}` },
        });
        if (res.status === 401) {
          onSetToken(null);
          setAuthMode('login');
          return;
        }
        if (!res.ok) throw new Error('Gagal memuat data dashboard.');
        const json = (await res.json()) as OverviewPayload;
        setData(json);
      } catch {
        setDataError('Gagal memuat data admin. Silakan muat ulang.');
      } finally {
        setLoadingData(false);
      }
    },
    [onSetToken]
  );

  useEffect(() => {
    if (!token) {
      checkAuthStatus();
    } else {
      loadOverview(token);
    }
  }, [token, checkAuthStatus, loadOverview]);

  const handleClaimOrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'unclaimed') {
      if (passwordInput.length < 8) {
        setAuthError('Sandi admin minimal 8 karakter.');
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setAuthError('Konfirmasi sandi tidak cocok.');
        return;
      }
    }

    setAuthSubmitting(true);
    try {
      const endpoint =
        authMode === 'unclaimed' ? '/api/admin/claim' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAuthError(json.error || 'Gagal masuk ke dashboard admin.');
        return;
      }
      setPasswordInput('');
      setConfirmPasswordInput('');
      onSetToken(json.token);
    } catch {
      setAuthError('Gangguan jaringan saat autentikasi.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // --- Admin Mutations ---

  const openCreateProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdVariety('');
    setProdCategorySlug(data?.categories[0]?.slug || 'beras-putih');
    setProdOrigin('');
    setProdFarmerGroup('');
    setProdShortDesc('');
    setProdDesc('');
    setProdImage(AVAILABLE_ASSET_IMAGES[0].url);
    setProdFeatured(false);
    setProdVariants([
      { id: `v-${Date.now()}-1`, weightKg: 5, label: '5 kg', price: 95000, stock: 50 },
    ]);
    setProdModalError('');
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod: RiceProduct) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdVariety(prod.variety);
    setProdCategorySlug(prod.categorySlug);
    setProdOrigin(prod.origin);
    setProdFarmerGroup(prod.farmerGroup);
    setProdShortDesc(prod.shortDescription);
    setProdDesc(prod.description);
    setProdImage(prod.images[0] || AVAILABLE_ASSET_IMAGES[0].url);
    setProdFeatured(prod.isFeatured);
    setProdVariants(prod.variants.map((v) => ({ ...v })));
    setProdModalError('');
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProdModalError('');
    if (!prodName.trim() || !prodVariety.trim() || prodVariants.length === 0) {
      setProdModalError('Nama produk, varietas, dan minimal satu varian kemasan wajib diisi.');
      return;
    }
    setProdSaving(true);
    try {
      const payload = {
        name: prodName.trim(),
        variety: prodVariety.trim(),
        categorySlug: prodCategorySlug,
        origin: prodOrigin.trim(),
        farmerGroup: prodFarmerGroup.trim(),
        shortDescription: prodShortDesc.trim(),
        description: prodDesc.trim(),
        images: [prodImage],
        isFeatured: prodFeatured,
        variants: prodVariants,
      };
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setProdModalError(json.error || 'Gagal menyimpan produk.');
        return;
      }
      setProductModalOpen(false);
      await Promise.all([loadOverview(token), onRefreshStorefront()]);
    } catch {
      setProdModalError('Gangguan jaringan saat menyimpan produk.');
    } finally {
      setProdSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await Promise.all([loadOverview(token), onRefreshStorefront()]);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCategoryName.trim()) return;
    setCatFeedback('');
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setCatFeedback(json.error || 'Gagal menambah kategori.');
      return;
    }
    setNewCategoryName('');
    setNewCategoryDesc('');
    await Promise.all([loadOverview(token), onRefreshStorefront()]);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await Promise.all([loadOverview(token), onRefreshStorefront()]);
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await loadOverview(token);
    }
  };

  const handleCustomerSegmentChange = async (
    customerId: string,
    segment: CustomerSegment
  ) => {
    if (!token) return;
    const res = await fetch(`/api/admin/customers/${customerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ segment }),
    });
    if (res.ok) {
      await loadOverview(token);
    }
  };

  const openCreateArticleModal = () => {
    setEditingArticle(null);
    setArtTitle('');
    setArtCategory('Edukasi Kualitas');
    setArtAuthor('Tim Redaksi TANIBERAS');
    setArtReadTime('4 menit baca');
    setArtCover(AVAILABLE_ASSET_IMAGES[3].url);
    setArtExcerpt('');
    setArtContentText('');
    setArticleModalOpen(true);
  };

  const openEditArticleModal = (art: ArticleRecord) => {
    setEditingArticle(art);
    setArtTitle(art.title);
    setArtCategory(art.category);
    setArtAuthor(art.author);
    setArtReadTime(art.readTime);
    setArtCover(art.coverImage);
    setArtExcerpt(art.excerpt);
    setArtContentText(art.content.join('\n\n'));
    setArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setArtSaving(true);
    try {
      const url = editingArticle
        ? `/api/admin/articles/${editingArticle.id}`
        : '/api/admin/articles';
      const method = editingArticle ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: artTitle.trim(),
          category: artCategory,
          author: artAuthor.trim(),
          readTime: artReadTime.trim(),
          coverImage: artCover,
          excerpt: artExcerpt.trim(),
          contentText: artContentText.trim(),
        }),
      });
      if (res.ok) {
        setArticleModalOpen(false);
        await Promise.all([loadOverview(token), onRefreshStorefront()]);
      }
    } finally {
      setArtSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await Promise.all([loadOverview(token), onRefreshStorefront()]);
    }
  };

  const handlePartnerStatusChange = async (id: string, status: PartnerStatus) => {
    if (!token) return;
    const res = await fetch(`/api/admin/partnerships/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await loadOverview(token);
    }
  };

  const handleToggleContactStatus = async (cnt: ContactRecord) => {
    if (!token) return;
    const nextStatus = cnt.status === 'Baru' ? 'Dibalas' : 'Baru';
    const res = await fetch(`/api/admin/contacts/${cnt.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      await loadOverview(token);
    }
  };

  // --- Auth Gate Screen ---
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-[#E5E0D5] rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold text-[#1B4D3E]">TANIBERAS</span>
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#546158] hover:text-[#18231B] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Toko
            </button>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#F2EFE9] text-[#1B4D3E] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-[#18231B]">
              {authMode === 'unclaimed'
                ? 'Aktivasi Sandi Admin Pertama'
                : 'Masuk Dashboard Admin'}
            </h1>
            <p className="text-sm text-[#546158] leading-relaxed">
              {authMode === 'unclaimed'
                ? 'Buat sandi pengelola untuk mengamankan Dashboard Admin TANIBERAS sebelum mulai mengelola produk dan pesanan.'
                : 'Masukkan sandi admin untuk mengakses pengelolaan stok, pesanan, pelanggan, dan mitra.'}
            </p>
          </div>

          {authMode === 'loading' ? (
            <div className="py-8 text-center text-sm text-[#546158]">
              Memeriksa status keamanan...
            </div>
          ) : (
            <form onSubmit={handleClaimOrLogin} className="space-y-4">
              {authError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                  {authMode === 'unclaimed' ? 'Buat Sandi Admin (min. 8 karakter)' : 'Sandi Admin'}
                </label>
                <input
                  type="password"
                  required
                  minLength={authMode === 'unclaimed' ? 8 : 1}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              {authMode === 'unclaimed' && (
                <div>
                  <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                    Ulangi Sandi Admin
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                {authSubmitting
                  ? 'Memverifikasi...'
                  : authMode === 'unclaimed'
                    ? 'Aktifkan & Masuk Dashboard'
                    : 'Masuk Dashboard'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const activeTabLabel = TAB_ITEMS.find((t) => t.id === activeTab)?.label || 'Ringkasan';

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#E5E0D5] shrink-0 flex flex-col justify-between">
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between lg:block">
            <div className="font-display text-xl font-bold text-[#1B4D3E]">TANIBERAS</div>
            <div className="text-xs text-[#546158] mt-0.5">Panel Operasional</div>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
            {TAB_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1B4D3E] text-white'
                      : 'text-[#546158] hover:bg-[#F2EFE9] hover:text-[#18231B]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-5 border-t border-[#E5E0D5] space-y-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#18231B] border border-[#E5E0D5] hover:border-[#1B4D3E] rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Lihat Etalase Toko
          </button>
          <button
            type="button"
            onClick={() => onSetToken(null)}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#546158] hover:text-red-700 rounded-lg cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Sesi Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E5E0D5] px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-sm text-[#546158]">
            <span>Admin TANIBERAS</span>
            <span className="mx-2">/</span>
            <span className="font-semibold text-[#18231B]">{activeTabLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="lg:hidden px-3 py-1.5 text-xs font-semibold border border-[#E5E0D5] rounded-lg cursor-pointer"
            >
              Etalase
            </button>
            <button
              type="button"
              onClick={() => onSetToken(null)}
              className="lg:hidden px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-lg cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-8 flex-1 space-y-6">
          {dataError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
              {dataError}
            </div>
          )}

          {loadingData && !data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white border border-[#E5E0D5] rounded-xl"
                />
              ))}
            </div>
          ) : (
            data && (
              <>
                {/* 1. RINGKASAN */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                      <div className="bg-white border border-[#E5E0D5] rounded-xl p-5">
                        <div className="text-xs font-medium text-[#546158]">
                          Total Pendapatan (Aktif)
                        </div>
                        <div className="font-display text-2xl font-bold text-[#18231B] tabular-nums mt-2">
                          {formatRupiah(data.stats.totalRevenue)}
                        </div>
                        <div className="text-xs text-[#1B4D3E] mt-1 tabular-nums">
                          Dari {data.stats.totalOrders} pesanan tercatat
                        </div>
                      </div>

                      <div className="bg-white border border-[#E5E0D5] rounded-xl p-5">
                        <div className="text-xs font-medium text-[#546158]">
                          Pesanan Perlu Diproses
                        </div>
                        <div className="font-display text-2xl font-bold text-[#18231B] tabular-nums mt-2">
                          {data.stats.pendingOrders}
                        </div>
                        <div className="text-xs text-[#546158] mt-1">
                          Menunggu konfirmasi atau giling
                        </div>
                      </div>

                      <div className="bg-white border border-[#E5E0D5] rounded-xl p-5">
                        <div className="text-xs font-medium text-[#546158]">
                          Pelanggan Terdaftar
                        </div>
                        <div className="font-display text-2xl font-bold text-[#18231B] tabular-nums mt-2">
                          {data.stats.totalCustomers}
                        </div>
                        <div className="text-xs text-[#546158] mt-1">
                          Rumah Tangga, Horeka & Reseller
                        </div>
                      </div>

                      <div className="bg-white border border-[#E5E0D5] rounded-xl p-5">
                        <div className="text-xs font-medium text-[#546158]">
                          Calon Mitra Baru
                        </div>
                        <div className="font-display text-2xl font-bold text-[#18231B] tabular-nums mt-2">
                          {data.stats.pendingPartners}
                        </div>
                        <div className="text-xs text-[#546158] mt-1 tabular-nums">
                          {data.stats.totalProducts} varietas produk aktif
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Order Breakdown */}
                      <div className="lg:col-span-7 bg-white border border-[#E5E0D5] rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="font-semibold text-base text-[#18231B]">
                            Pesanan Terbaru
                          </h2>
                          <button
                            type="button"
                            onClick={() => setActiveTab('orders')}
                            className="text-xs font-semibold text-[#1B4D3E] hover:underline cursor-pointer"
                          >
                            Kelola Semua
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-[#E5E0D5] text-[#546158]">
                                <th className="py-2.5 font-medium">No. Pesanan</th>
                                <th className="py-2.5 font-medium">Pelanggan</th>
                                <th className="py-2.5 font-medium">Status</th>
                                <th className="py-2.5 font-medium text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E0D5]">
                              {data.orders.slice(0, 5).map((ord) => (
                                <tr key={ord.id} className="hover:bg-[#FAF9F5]">
                                  <td className="py-3 font-mono font-medium text-[#18231B] tabular-nums">
                                    {ord.orderNumber}
                                  </td>
                                  <td className="py-3">
                                    <div className="font-medium text-[#18231B]">
                                      {ord.customerName}
                                    </div>
                                    <div className="text-[#546158]">{ord.city}</div>
                                  </td>
                                  <td className="py-3 text-[#18231B]">{ord.status}</td>
                                  <td className="py-3 text-right font-semibold tabular-nums">
                                    {formatRupiah(ord.totalAmount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Low Stock Monitor */}
                      <div className="lg:col-span-5 bg-white border border-[#E5E0D5] rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="font-semibold text-base text-[#18231B]">
                            Pemantauan Stok Menipis (&le; 20)
                          </h2>
                          <button
                            type="button"
                            onClick={() => setActiveTab('products')}
                            className="text-xs font-semibold text-[#1B4D3E] hover:underline cursor-pointer"
                          >
                            Atur Stok
                          </button>
                        </div>

                        {data.lowStockVariants.length === 0 ? (
                          <p className="text-sm text-[#546158] py-4">
                            Seluruh varian kemasan berada dalam stok aman.
                          </p>
                        ) : (
                          <div className="divide-y divide-[#E5E0D5]">
                            {data.lowStockVariants.map((item, i) => (
                              <div
                                key={`${item.productId}-${i}`}
                                className="py-3 flex items-center justify-between gap-3 text-xs"
                              >
                                <div>
                                  <div className="font-semibold text-[#18231B]">
                                    {item.productName}
                                  </div>
                                  <div className="text-[#546158]">
                                    Kemasan {item.variantLabel}
                                  </div>
                                </div>
                                <span className="font-semibold text-amber-700 tabular-nums">
                                  Sisa {item.stock} unit
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PRODUK & STOK */}
                {activeTab === 'products' && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <input
                        type="search"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Cari nama beras atau varietas..."
                        className="w-full sm:w-80 px-3.5 py-2 text-sm bg-white border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                      />
                      <button
                        type="button"
                        onClick={openCreateProductModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Produk Beras
                      </button>
                    </div>

                    <div className="bg-white border border-[#E5E0D5] rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-[#F2EFE9] border-b border-[#E5E0D5] text-[#546158]">
                              <th className="px-4 py-3 font-semibold">Produk</th>
                              <th className="px-4 py-3 font-semibold">Asal & Kategori</th>
                              <th className="px-4 py-3 font-semibold">Varian & Harga</th>
                              <th className="px-4 py-3 font-semibold text-right">Total Stok</th>
                              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E0D5]">
                            {data.products
                              .filter(
                                (p) =>
                                  !productSearch.trim() ||
                                  p.name
                                    .toLowerCase()
                                    .includes(productSearch.trim().toLowerCase()) ||
                                  p.variety
                                    .toLowerCase()
                                    .includes(productSearch.trim().toLowerCase())
                              )
                              .map((prod) => {
                                const totalStock = prod.variants.reduce(
                                  (s, v) => s + v.stock,
                                  0
                                );
                                return (
                                  <tr key={prod.id} className="hover:bg-[#FAF9F5]">
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <ResilientImage
                                          src={prod.images[0]}
                                          alt={prod.name}
                                          className="w-11 h-11 rounded-lg object-cover border border-[#E5E0D5] shrink-0"
                                        />
                                        <div>
                                          <div className="font-semibold text-[#18231B]">
                                            {prod.name}
                                          </div>
                                          <div className="text-[#546158]">
                                            {prod.variety}
                                            {prod.isFeatured ? ' · Unggulan' : ''}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-[#546158]">
                                      <div>{prod.origin}</div>
                                      <div>{prod.categorySlug}</div>
                                    </td>
                                    <td className="px-4 py-3 tabular-nums">
                                      {prod.variants.map((v) => (
                                        <div key={v.id}>
                                          {v.label}: {formatRupiah(v.price)} ({v.stock})
                                        </div>
                                      ))}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#18231B]">
                                      {totalStock}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="inline-flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => openEditProductModal(prod)}
                                          aria-label={`Edit ${prod.name}`}
                                          className="p-1.5 rounded-md border border-[#E5E0D5] hover:border-[#1B4D3E] text-[#18231B] cursor-pointer"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteProduct(prod.id)}
                                          aria-label={`Hapus ${prod.name}`}
                                          className="p-1.5 rounded-md border border-[#E5E0D5] hover:border-red-300 text-red-700 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. KATEGORI */}
                {activeTab === 'categories' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 bg-white border border-[#E5E0D5] rounded-xl p-6 space-y-4">
                      <h2 className="font-semibold text-base text-[#18231B]">
                        Tambah Kategori Baru
                      </h2>
                      {catFeedback && (
                        <div className="p-3 rounded-lg bg-red-50 text-xs text-red-800">
                          {catFeedback}
                        </div>
                      )}
                      <form onSubmit={handleAddCategory} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#18231B] mb-1">
                            Nama Kategori
                          </label>
                          <input
                            type="text"
                            required
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Contoh: Beras Khusus Anak"
                            className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#18231B] mb-1">
                            Deskripsi Singkat
                          </label>
                          <textarea
                            rows={2}
                            value={newCategoryDesc}
                            onChange={(e) => setNewCategoryDesc(e.target.value)}
                            placeholder="Deskripsi singkat kategori..."
                            className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2.5 text-xs font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] rounded-lg cursor-pointer"
                        >
                          Simpan Kategori
                        </button>
                      </form>
                    </div>

                    <div className="lg:col-span-7 bg-white border border-[#E5E0D5] rounded-xl divide-y divide-[#E5E0D5]">
                      {data.categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="p-4 flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="text-sm font-semibold text-[#18231B]">
                              {cat.name}
                            </div>
                            <div className="text-xs text-[#546158] mt-0.5">
                              Slug: {cat.slug} · {cat.description}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            aria-label={`Hapus kategori ${cat.name}`}
                            className="p-2 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. PESANAN */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Semua',
                        'Menunggu Konfirmasi',
                        'Diproses',
                        'Dikirim',
                        'Selesai',
                        'Dibatalkan',
                      ].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                            orderStatusFilter === st
                              ? 'bg-[#1B4D3E] text-white'
                              : 'bg-white border border-[#E5E0D5] text-[#546158]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white border border-[#E5E0D5] rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-[#F2EFE9] border-b border-[#E5E0D5] text-[#546158]">
                              <th className="px-4 py-3 font-semibold">No. & Tanggal</th>
                              <th className="px-4 py-3 font-semibold">Pelanggan & Alamat</th>
                              <th className="px-4 py-3 font-semibold">Item Pesanan</th>
                              <th className="px-4 py-3 font-semibold text-right">Total</th>
                              <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E0D5]">
                            {data.orders
                              .filter(
                                (o) =>
                                  orderStatusFilter === 'Semua' ||
                                  o.status === orderStatusFilter
                              )
                              .map((ord) => (
                                <tr key={ord.id} className="hover:bg-[#FAF9F5]">
                                  <td className="px-4 py-3 align-top">
                                    <div className="font-mono font-semibold text-[#18231B] tabular-nums">
                                      {ord.orderNumber}
                                    </div>
                                    <div className="text-[#546158] mt-0.5">
                                      {formatShortDate(ord.createdAt)}
                                    </div>
                                    <div className="text-[#1B4D3E] mt-0.5">
                                      {ord.channel === 'whatsapp' ? 'WhatsApp' : 'Website'} ·{' '}
                                      {ord.paymentMethod}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 align-top">
                                    <div className="font-semibold text-[#18231B]">
                                      {ord.customerName}
                                    </div>
                                    <div className="text-[#546158] tabular-nums">
                                      {ord.customerPhone}
                                    </div>
                                    <div className="text-[#546158] max-w-xs mt-0.5">
                                      {ord.address}, {ord.city}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 align-top">
                                    {ord.items.map((it, idx) => (
                                      <div key={idx} className="text-[#18231B]">
                                        {it.productName} ({it.weightLabel}) × {it.quantity}
                                      </div>
                                    ))}
                                  </td>
                                  <td className="px-4 py-3 text-right align-top font-semibold tabular-nums text-[#18231B]">
                                    {formatRupiah(ord.totalAmount)}
                                  </td>
                                  <td className="px-4 py-3 align-top">
                                    <select
                                      value={ord.status}
                                      onChange={(e) =>
                                        handleOrderStatusChange(
                                          ord.id,
                                          e.target.value as OrderStatus
                                        )
                                      }
                                      aria-label={`Ubah status pesanan ${ord.orderNumber}`}
                                      className="px-2.5 py-1.5 text-xs font-medium bg-[#FAF9F5] border border-[#E5E0D5] rounded-md focus:outline-none focus:border-[#1B4D3E]"
                                    >
                                      <option value="Menunggu Konfirmasi">
                                        Menunggu Konfirmasi
                                      </option>
                                      <option value="Diproses">Diproses</option>
                                      <option value="Dikirim">Dikirim</option>
                                      <option value="Selesai">Selesai</option>
                                      <option value="Dibatalkan">Dibatalkan</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PELANGGAN */}
                {activeTab === 'customers' && (
                  <div className="space-y-4">
                    <input
                      type="search"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Cari nama, kota, atau nomor WhatsApp pelanggan..."
                      className="w-full sm:w-96 px-3.5 py-2 text-sm bg-white border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                    />

                    <div className="bg-white border border-[#E5E0D5] rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-[#F2EFE9] border-b border-[#E5E0D5] text-[#546158]">
                              <th className="px-4 py-3 font-semibold">Nama Pelanggan</th>
                              <th className="px-4 py-3 font-semibold">Kontak</th>
                              <th className="px-4 py-3 font-semibold">Kota</th>
                              <th className="px-4 py-3 font-semibold">Segmen</th>
                              <th className="px-4 py-3 font-semibold text-right">Pesanan</th>
                              <th className="px-4 py-3 font-semibold text-right">
                                Total Belanja
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E0D5]">
                            {data.customers
                              .filter((c) => {
                                const q = customerSearch.trim().toLowerCase();
                                if (!q) return true;
                                return (
                                  c.name.toLowerCase().includes(q) ||
                                  c.city.toLowerCase().includes(q) ||
                                  c.phone.includes(q)
                                );
                              })
                              .map((cust) => (
                                <tr key={cust.id} className="hover:bg-[#FAF9F5]">
                                  <td className="px-4 py-3 font-semibold text-[#18231B]">
                                    {cust.name}
                                  </td>
                                  <td className="px-4 py-3 text-[#546158]">
                                    <div className="tabular-nums">{cust.phone}</div>
                                    <div>{cust.email || '-'}</div>
                                  </td>
                                  <td className="px-4 py-3 text-[#546158]">{cust.city}</td>
                                  <td className="px-4 py-3">
                                    <select
                                      value={cust.segment}
                                      onChange={(e) =>
                                        handleCustomerSegmentChange(
                                          cust.id,
                                          e.target.value as CustomerSegment
                                        )
                                      }
                                      aria-label={`Ubah segmen ${cust.name}`}
                                      className="px-2.5 py-1 text-xs bg-[#FAF9F5] border border-[#E5E0D5] rounded-md"
                                    >
                                      <option value="Rumah Tangga">Rumah Tangga</option>
                                      <option value="Horeka">Horeka</option>
                                      <option value="Reseller">Reseller</option>
                                    </select>
                                  </td>
                                  <td className="px-4 py-3 text-right tabular-nums">
                                    {cust.totalOrders}
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#18231B]">
                                    {formatRupiah(cust.totalSpent)}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. ARTIKEL */}
                {activeTab === 'articles' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold text-base text-[#18231B]">
                        Daftar Artikel Edukasi ({data.articles.length})
                      </h2>
                      <button
                        type="button"
                        onClick={openCreateArticleModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] rounded-lg cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Tulis Artikel Baru
                      </button>
                    </div>

                    <div className="bg-white border border-[#E5E0D5] rounded-xl divide-y divide-[#E5E0D5]">
                      {data.articles.map((art) => (
                        <div
                          key={art.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <ResilientImage
                              src={art.coverImage}
                              alt={art.title}
                              className="w-16 h-12 rounded-lg object-cover border border-[#E5E0D5] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-[#18231B] truncate">
                                {art.title}
                              </div>
                              <div className="text-xs text-[#546158] mt-0.5">
                                {art.category} · {art.publishedAt} · {art.readTime}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditArticleModal(art)}
                              className="px-3 py-1.5 text-xs font-semibold border border-[#E5E0D5] rounded-lg hover:border-[#1B4D3E] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-700 border border-[#E5E0D5] rounded-lg hover:border-red-300 cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. KEMITRAAN & KONTAK */}
                {activeTab === 'partners' && (
                  <div className="space-y-4">
                    <div className="flex gap-1.5 bg-[#F2EFE9] p-1 rounded-lg w-fit">
                      <button
                        type="button"
                        onClick={() => setPartnerSubTab('partnerships')}
                        className={`px-4 py-2 text-xs font-semibold rounded-md cursor-pointer ${
                          partnerSubTab === 'partnerships'
                            ? 'bg-white text-[#18231B] shadow-sm'
                            : 'text-[#546158]'
                        }`}
                      >
                        Pendaftaran Mitra ({data.partnerships.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPartnerSubTab('contacts')}
                        className={`px-4 py-2 text-xs font-semibold rounded-md cursor-pointer ${
                          partnerSubTab === 'contacts'
                            ? 'bg-white text-[#18231B] shadow-sm'
                            : 'text-[#546158]'
                        }`}
                      >
                        Pesan Kontak ({data.contacts.length})
                      </button>
                    </div>

                    {partnerSubTab === 'partnerships' ? (
                      <div className="bg-white border border-[#E5E0D5] rounded-xl divide-y divide-[#E5E0D5]">
                        {data.partnerships.map((p) => (
                          <div
                            key={p.id}
                            className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#546158]">
                                <span className="font-semibold text-[#1B4D3E]">
                                  {p.partnerType}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{p.region}</span>
                                <span aria-hidden="true">·</span>
                                <span>{formatShortDate(p.createdAt)}</span>
                              </div>
                              <div className="text-sm font-semibold text-[#18231B]">
                                {p.fullName} — {p.organizationName}
                              </div>
                              <div className="text-xs text-[#546158] tabular-nums">
                                WA: {p.phone} · Email: {p.email} · Kapasitas:{' '}
                                {p.estimatedCapacity}
                              </div>
                              {p.message && (
                                <p className="text-xs text-[#3F4E44] pt-1">{p.message}</p>
                              )}
                            </div>

                            <div className="shrink-0">
                              <select
                                value={p.status}
                                onChange={(e) =>
                                  handlePartnerStatusChange(
                                    p.id,
                                    e.target.value as PartnerStatus
                                  )
                                }
                                aria-label={`Ubah status mitra ${p.fullName}`}
                                className="px-3 py-2 text-xs font-semibold bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg"
                              >
                                <option value="Baru">Baru</option>
                                <option value="Ditinjau">Ditinjau</option>
                                <option value="Disetujui">Disetujui</option>
                                <option value="Ditolak">Ditolak</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-[#E5E0D5] rounded-xl divide-y divide-[#E5E0D5]">
                        {data.contacts.map((c) => (
                          <div
                            key={c.id}
                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="text-xs text-[#546158]">
                                <span className="font-semibold text-[#18231B]">{c.name}</span> ·{' '}
                                {c.email} {c.phone ? `· ${c.phone}` : ''}
                              </div>
                              <div className="text-sm font-semibold text-[#18231B]">
                                {c.subject}
                              </div>
                              <p className="text-xs text-[#3F4E44]">{c.message}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleContactStatus(c)}
                              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border shrink-0 cursor-pointer ${
                                c.status === 'Dibalas'
                                  ? 'bg-[#1B4D3E] text-white border-[#1B4D3E]'
                                  : 'bg-[#FAF9F5] text-[#18231B] border-[#E5E0D5]'
                              }`}
                            >
                              {c.status === 'Dibalas' ? 'Sudah Dibalas' : 'Tandai Dibalas'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )
          )}
        </main>
      </div>

      {/* Product Create/Edit Modal */}
      {productModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-[#E5E0D5] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
              <h2 className="font-display text-xl font-semibold text-[#18231B]">
                {editingProduct ? 'Edit Produk Beras' : 'Tambah Produk Beras Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F2EFE9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {prodModalError && (
                <div className="p-3 rounded-lg bg-red-50 text-xs text-red-800">
                  {prodModalError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Varietas Beras *</label>
                  <input
                    type="text"
                    required
                    value={prodVariety}
                    onChange={(e) => setProdVariety(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Kategori *</label>
                  <select
                    value={prodCategorySlug}
                    onChange={(e) => setProdCategorySlug(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                  >
                    {data?.categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Daerah Asal</label>
                  <input
                    type="text"
                    value={prodOrigin}
                    onChange={(e) => setProdOrigin(e.target.value)}
                    placeholder="Cianjur, Jawa Barat"
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Kelompok Tani</label>
                  <input
                    type="text"
                    value={prodFarmerGroup}
                    onChange={(e) => setProdFarmerGroup(e.target.value)}
                    placeholder="Gapoktan..."
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Foto Produk</label>
                <select
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                >
                  {AVAILABLE_ASSET_IMAGES.map((img) => (
                    <option key={img.url} value={img.url}>
                      {img.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={prodShortDesc}
                  onChange={(e) => setProdShortDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Deskripsi Lengkap</label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                />
              </div>

              {/* Variants Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">
                    Varian Berat, Harga & Stok
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setProdVariants((prev) => [
                        ...prev,
                        {
                          id: `v-${Date.now()}`,
                          weightKg: 10,
                          label: '10 kg',
                          price: 185000,
                          stock: 25,
                        },
                      ])
                    }
                    className="text-xs font-semibold text-[#1B4D3E] hover:underline cursor-pointer"
                  >
                    + Tambah Varian
                  </button>
                </div>

                <div className="space-y-2">
                  {prodVariants.map((v, idx) => (
                    <div key={v.id} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="number"
                        min={1}
                        value={v.weightKg}
                        onChange={(e) => {
                          const kg = Number(e.target.value) || 1;
                          setProdVariants((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, weightKg: kg, label: `${kg} kg` } : item
                            )
                          );
                        }}
                        placeholder="Kg"
                        className="col-span-3 px-2.5 py-2 text-xs border border-[#E5E0D5] rounded-lg tabular-nums"
                      />
                      <input
                        type="number"
                        min={1000}
                        step={500}
                        value={v.price}
                        onChange={(e) => {
                          const price = Number(e.target.value) || 0;
                          setProdVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, price } : item))
                          );
                        }}
                        placeholder="Harga (Rp)"
                        className="col-span-4 px-2.5 py-2 text-xs border border-[#E5E0D5] rounded-lg tabular-nums"
                      />
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => {
                          const stock = Number(e.target.value) || 0;
                          setProdVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, stock } : item))
                          );
                        }}
                        placeholder="Stok"
                        className="col-span-3 px-2.5 py-2 text-xs border border-[#E5E0D5] rounded-lg tabular-nums"
                      />
                      <button
                        type="button"
                        disabled={prodVariants.length <= 1}
                        onClick={() =>
                          setProdVariants((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="col-span-2 py-2 text-xs text-red-700 disabled:opacity-30 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#18231B]">
                <input
                  type="checkbox"
                  checked={prodFeatured}
                  onChange={(e) => setProdFeatured(e.target.checked)}
                />
                Tampilkan sebagai Produk Unggulan di Beranda
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E0D5]">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#E5E0D5] rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={prodSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1B4D3E] rounded-lg cursor-pointer"
                >
                  {prodSaving ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Create/Edit Modal */}
      {articleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-[#E5E0D5] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
              <h2 className="font-display text-xl font-semibold text-[#18231B]">
                {editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setArticleModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F2EFE9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  required
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Kategori</label>
                  <select
                    value={artCategory}
                    onChange={(e) =>
                      setArtCategory(e.target.value as ArticleRecord['category'])
                    }
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                  >
                    <option value="Edukasi Kualitas">Edukasi Kualitas</option>
                    <option value="Tips Memilih Beras">Tips Memilih Beras</option>
                    <option value="Pertanian & Pascapanen">Pertanian & Pascapanen</option>
                    <option value="Kabar Petani">Kabar Petani</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Gambar Sampul</label>
                  <select
                    value={artCover}
                    onChange={(e) => setArtCover(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                  >
                    {AVAILABLE_ASSET_IMAGES.map((img) => (
                      <option key={img.url} value={img.url}>
                        {img.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Penulis</label>
                  <input
                    type="text"
                    value={artAuthor}
                    onChange={(e) => setArtAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Estimasi Baca</label>
                  <input
                    type="text"
                    value={artReadTime}
                    onChange={(e) => setArtReadTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Ringkasan *</label>
                <textarea
                  rows={2}
                  required
                  value={artExcerpt}
                  onChange={(e) => setArtExcerpt(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Isi Artikel (Pisahkan paragraf dengan baris kosong) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={artContentText}
                  onChange={(e) => setArtContentText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E0D5] rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E0D5]">
                <button
                  type="button"
                  onClick={() => setArticleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#E5E0D5] rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={artSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1B4D3E] rounded-lg cursor-pointer"
                >
                  {artSaving ? 'Menyimpan...' : 'Simpan Artikel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
