import { useEffect, useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import type { RiceCategory, RiceProduct } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductsPageProps {
  categories: RiceCategory[];
  initialProducts: RiceProduct[];
  onNavigate: (path: string) => void;
  onQuickAdd: (product: RiceProduct) => void;
}

export function ProductsPage({
  categories,
  initialProducts,
  onNavigate,
  onQuickAdd,
}: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [products, setProducts] = useState<RiceProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function fetchFiltered() {
      setLoading(true);
      setErrorMsg('');
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (priceFilter !== 'all') params.set('price', priceFilter);
        params.set('sort', sortBy);

        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Gagal memuat katalog produk.');
        const data = await res.json();
        if (active) {
          setProducts(data.products || []);
        }
      } catch (err: unknown) {
        if ((err as { name?: string }).name === 'AbortError') return;
        if (active) {
          setErrorMsg('Gagal memuat daftar produk. Periksa koneksi Anda dan coba lagi.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const timer = setTimeout(fetchFiltered, 180);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, selectedCategory, priceFilter, sortBy, initialProducts]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceFilter('all');
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
      {/* Header */}
      <div className="space-y-2 max-w-2xl">
        <p className="text-xs font-semibold text-[#1B4D3E]">Katalog Resmi TANIBERAS</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#18231B] tracking-tight [text-wrap:balance]">
          Pilihan Beras Berkualitas Nusantara
        </h1>
        <p className="text-sm sm:text-base text-[#546158]">
          Temukan varietas pulen, aromatik, organik, hingga beras merah dan hitam kaya serat
          langsung dari kelompok tani mitra.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-[#E5E0D5] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#546158] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama beras, varietas, atau daerah asal..."
              aria-label="Cari produk beras"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
            />
          </div>

          {/* Price Filter */}
          <div className="md:col-span-3">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              aria-label="Filter rentang harga"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
            >
              <option value="all">Semua Rentang Harga</option>
              <option value="under75">Mulai &lt; Rp 75.000</option>
              <option value="75to150">Rp 75.000 – Rp 150.000</option>
              <option value="above150">&gt; Rp 150.000</option>
            </select>
          </div>

          {/* Sort */}
          <div className="md:col-span-4 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#546158] shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Urutkan produk"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
            >
              <option value="popular">Urutkan: Paling Populer</option>
              <option value="price-asc">Urutkan: Harga Terendah</option>
              <option value="price-desc">Urutkan: Harga Tertinggi</option>
              <option value="newest">Urutkan: Panen Terbaru</option>
            </select>
          </div>
        </div>

        {/* Category Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1B4D3E] text-white'
                : 'bg-[#F2EFE9] text-[#546158] hover:text-[#18231B]'
            }`}
          >
            Semua Jenis
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-[#1B4D3E] text-white'
                  : 'bg-[#F2EFE9] text-[#546158] hover:text-[#18231B]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#546158]">
        <span>
          Menampilkan <strong className="text-[#18231B] tabular-nums">{products.length}</strong>{' '}
          varietas beras
        </span>
        {(searchQuery || selectedCategory !== 'all' || priceFilter !== 'all') && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-[#1B4D3E] font-semibold hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Atur Ulang Filter
          </button>
        )}
      </div>

      {/* States: Error / Loading / Empty / Grid */}
      {errorMsg ? (
        <div className="bg-white border border-red-200 rounded-2xl p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-red-800">{errorMsg}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1B4D3E] rounded-lg cursor-pointer"
          >
            Muat Ulang Katalog
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white border border-[#E5E0D5] rounded-2xl overflow-hidden h-[430px]"
            >
              <div className="aspect-[4/3] bg-[#EAE6DC]" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-28 bg-[#EAE6DC] rounded" />
                <div className="h-5 w-48 bg-[#EAE6DC] rounded" />
                <div className="h-3 w-full bg-[#F2EFE9] rounded" />
                <div className="h-3 w-2/3 bg-[#F2EFE9] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-[#E5E0D5] rounded-2xl p-12 text-center space-y-4">
          <h3 className="font-display text-xl font-semibold text-[#18231B]">
            Produk tidak ditemukan
          </h3>
          <p className="text-sm text-[#546158] max-w-md mx-auto">
            Tidak ada varietas beras yang cocok dengan kata kunci atau filter harga yang Anda
            pilih.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] rounded-lg cursor-pointer"
          >
            Tampilkan Semua Beras
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetail={(slug) => onNavigate(`/produk/${slug}`)}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
