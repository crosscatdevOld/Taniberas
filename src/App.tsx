import { useCallback, useEffect, useState } from 'react';
import type {
  CartItem,
  RiceProduct,
  RiceVariant,
  StorePublicSnapshot,
} from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { PartnershipPage } from './pages/PartnershipPage.tsx';
import { ArticlesPage } from './pages/ArticlesPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    () => window.location.pathname || '/'
  );
  const [storefront, setStorefront] = useState<StorePublicSnapshot>({
    categories: [],
    products: [],
    articles: [],
    testimonials: [],
  });
  const [loadingStore, setLoadingStore] = useState(true);
  const [storeError, setStoreError] = useState('');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Admin auth token held strictly in React memory (never persisted to localStorage)
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const fetchStorefront = useCallback(async () => {
    setStoreError('');
    try {
      const res = await fetch('/api/storefront');
      if (!res.ok) throw new Error('Gagal memuat data etalase.');
      const data = (await res.json()) as StorePublicSnapshot;
      setStorefront(data);
    } catch {
      setStoreError('Gagal memuat data TANIBERAS. Periksa koneksi Anda.');
    } finally {
      setLoadingStore(false);
    }
  }, []);

  useEffect(() => {
    fetchStorefront();
  }, [fetchStorefront]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addToCart = useCallback(
    (product: RiceProduct, variant: RiceVariant, quantity: number) => {
      setCartItems((prev) => {
        const idx = prev.findIndex(
          (it) => it.productId === product.id && it.variantId === variant.id
        );
        if (idx >= 0) {
          const updated = [...prev];
          const existing = updated[idx];
          updated[idx] = {
            ...existing,
            quantity: Math.min(variant.stock, existing.quantity + quantity),
          };
          return updated;
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            variety: product.variety,
            image: product.images[0] || '',
            variantId: variant.id,
            weightLabel: variant.label,
            weightKg: variant.weightKg,
            unitPrice: variant.price,
            quantity: Math.min(variant.stock, quantity),
            maxStock: variant.stock,
          },
        ];
      });
      setCartOpen(true);
    },
    []
  );

  const handleQuickAdd = useCallback(
    (product: RiceProduct) => {
      const defaultVariant =
        product.variants.find((v) => v.weightKg === 5 && v.stock > 0) ||
        product.variants.find((v) => v.stock > 0);
      if (!defaultVariant) return;
      addToCart(product, defaultVariant, 1);
    },
    [addToCart]
  );

  const handleUpdateQty = useCallback(
    (productId: string, variantId: string, delta: number) => {
      setCartItems((prev) =>
        prev
          .map((item) => {
            if (item.productId !== productId || item.variantId !== variantId) return item;
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return { ...item, quantity: Math.min(item.maxStock, nextQty) };
          })
          .filter((x): x is CartItem => x !== null)
      );
    },
    []
  );

  const handleRemoveItem = useCallback((productId: string, variantId: string) => {
    setCartItems((prev) =>
      prev.filter((it) => !(it.productId === productId && it.variantId === variantId))
    );
  }, []);

  const totalCartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  // Admin view has its own dedicated sidebar workspace shell
  if (currentPath === '/admin') {
    return (
      <AdminDashboardPage
        token={adminToken}
        onSetToken={setAdminToken}
        onNavigateHome={() => navigate('/')}
        onRefreshStorefront={fetchStorefront}
      />
    );
  }

  const featuredProducts = storefront.products.filter((p) => p.isFeatured);
  const productDetailMatch = currentPath.startsWith('/produk/')
    ? currentPath.replace('/produk/', '')
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#18231B]">
      <Navbar
        currentPath={currentPath}
        cartCount={totalCartCount}
        onNavigate={navigate}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex-1">
        {loadingStore && storefront.products.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
            <div className="h-72 bg-[#EAE6DC] rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-white border border-[#E5E0D5] rounded-2xl" />
              <div className="h-64 bg-white border border-[#E5E0D5] rounded-2xl" />
              <div className="h-64 bg-white border border-[#E5E0D5] rounded-2xl" />
            </div>
          </div>
        ) : storeError && storefront.products.length === 0 ? (
          <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
            <h1 className="font-display text-2xl font-semibold text-[#18231B]">
              Gagal Memuat Etalase
            </h1>
            <p className="text-sm text-[#546158]">{storeError}</p>
            <button
              type="button"
              onClick={fetchStorefront}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1B4D3E] rounded-lg cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : productDetailMatch ? (
          <ProductDetailPage
            slug={productDetailMatch}
            products={storefront.products}
            onNavigate={navigate}
            onAddToCart={addToCart}
          />
        ) : currentPath === '/tentang-kami' ? (
          <AboutPage onNavigate={navigate} />
        ) : currentPath === '/produk' ? (
          <ProductsPage
            categories={storefront.categories}
            initialProducts={storefront.products}
            onNavigate={navigate}
            onQuickAdd={handleQuickAdd}
          />
        ) : currentPath === '/kemitraan' ? (
          <PartnershipPage />
        ) : currentPath === '/artikel' ? (
          <ArticlesPage articles={storefront.articles} />
        ) : currentPath === '/kontak' ? (
          <ContactPage />
        ) : (
          <HomePage
            featuredProducts={
              featuredProducts.length > 0 ? featuredProducts : storefront.products
            }
            testimonials={storefront.testimonials}
            onNavigate={navigate}
            onQuickAdd={handleQuickAdd}
          />
        )}
      </main>

      <Footer onNavigate={navigate} />

      <CartDrawer
        isOpen={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => {
          setCartItems([]);
          fetchStorefront();
        }}
        onBrowseProducts={() => navigate('/produk')}
      />
    </div>
  );
}
