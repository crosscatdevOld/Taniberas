import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import type { RiceProduct, RiceVariant } from '../types.ts';
import { formatRupiah } from '../utils/format.ts';
import { ResilientImage } from '../components/ResilientImage.tsx';

interface ProductDetailPageProps {
  slug: string;
  products: RiceProduct[];
  onNavigate: (path: string) => void;
  onAddToCart: (product: RiceProduct, variant: RiceVariant, quantity: number) => void;
}

export function ProductDetailPage({
  slug,
  products,
  onNavigate,
  onAddToCart,
}: ProductDetailPageProps) {
  const [product, setProduct] = useState<RiceProduct | null>(
    () => products.find((p) => p.slug === slug) || null
  );
  const [loading, setLoading] = useState(!product);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Quick WhatsApp Modal State
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waName, setWaName] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [waCity, setWaCity] = useState('');
  const [waAddress, setWaAddress] = useState('');
  const [waSubmitting, setWaSubmitting] = useState(false);
  const [waError, setWaError] = useState('');
  const [waOrderUrl, setWaOrderUrl] = useState('');
  const [waOrderNum, setWaOrderNum] = useState('');

  useEffect(() => {
    const found = products.find((p) => p.slug === slug);
    if (found) {
      setProduct(found);
      setSelectedVariantId(
        (found.variants.find((v) => v.weightKg === 5) || found.variants[0])?.id || ''
      );
      setActiveImageIdx(0);
      setQuantity(1);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (mounted && data.product) {
          setProduct(data.product);
          const def =
            data.product.variants.find((v: RiceVariant) => v.weightKg === 5) ||
            data.product.variants[0];
          setSelectedVariantId(def?.id || '');
        }
      })
      .catch(() => {
        if (mounted) setProduct(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug, products]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-96 bg-white border border-[#E5E0D5] rounded-2xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl font-semibold text-[#18231B]">
          Produk tidak ditemukan
        </h1>
        <p className="text-sm text-[#546158]">
          Varietas beras yang Anda cari mungkin sudah tidak tersedia atau alamat URL berubah.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/produk')}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1B4D3E] rounded-lg cursor-pointer"
        >
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const handleAdd = () => {
    if (!activeVariant || activeVariant.stock <= 0) return;
    onAddToCart(product, activeVariant, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVariant) return;
    setWaError('');
    if (!waName.trim() || !waPhone.trim() || !waCity.trim() || !waAddress.trim()) {
      setWaError('Mohon lengkapi seluruh kolom pengiriman.');
      return;
    }
    setWaSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: waName.trim(),
          customerPhone: waPhone.trim(),
          city: waCity.trim(),
          address: waAddress.trim(),
          paymentMethod: 'WhatsApp Order',
          channel: 'whatsapp',
          items: [
            {
              productId: product.id,
              variantId: activeVariant.id,
              quantity,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWaError(data.error || 'Gagal mencatat pesanan.');
        return;
      }
      setWaOrderUrl(data.whatsappUrl);
      setWaOrderNum(data.order?.orderNumber || '');
    } catch {
      setWaError('Gangguan jaringan saat memproses pesanan WhatsApp.');
    } finally {
      setWaSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">
      <button
        type="button"
        onClick={() => onNavigate('/produk')}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#546158] hover:text-[#18231B] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Katalog Produk
      </button>

      {/* Contiguous Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Sticky Image Gallery Left */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#F2EFE9] border border-[#E5E0D5]">
            <ResilientImage
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-[4/3] rounded-xl overflow-hidden border transition-all cursor-pointer ${
                    activeImageIdx === idx
                      ? 'border-[#1B4D3E] ring-2 ring-[#1B4D3E]/25'
                      : 'border-[#E5E0D5] opacity-75 hover:opacity-100'
                  }`}
                >
                  <ResilientImage
                    src={img}
                    alt={`${product.name} galeri ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Module Right */}
        <div className="lg:col-span-6 bg-white border border-[#E5E0D5] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#1B4D3E]">
              {product.variety} · {product.origin}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#18231B] tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs text-[#546158]">
              Sumber Petani: <strong className="text-[#18231B]">{product.farmerGroup}</strong> ·{' '}
              {product.harvestBatch}
            </p>
          </div>

          <div className="pt-4 border-t border-[#E5E0D5] flex items-baseline justify-between gap-4">
            <div className="font-display text-3xl font-bold text-[#18231B] tabular-nums">
              {activeVariant ? formatRupiah(activeVariant.price) : '-'}
            </div>
            <div className="text-xs font-semibold tabular-nums text-[#1B4D3E]">
              {activeVariant && activeVariant.stock > 0
                ? `Stok Tersedia: ${activeVariant.stock} kemasan`
                : 'Stok Habis'}
            </div>
          </div>

          <p className="text-sm text-[#3F4E44] leading-relaxed">{product.description}</p>

          {/* Weight Variant Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-[#18231B]">
              Pilih Berat Kemasan
            </label>
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((v) => {
                const selected = v.id === activeVariant?.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={v.stock <= 0}
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setQuantity(1);
                    }}
                    className={`px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors tabular-nums cursor-pointer disabled:opacity-40 ${
                      selected
                        ? 'bg-[#1B4D3E] text-white border-[#1B4D3E]'
                        : 'bg-[#FAF9F5] text-[#18231B] border-[#E5E0D5] hover:border-[#1B4D3E]'
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-[#18231B]">Jumlah Pembelian</span>
              <div className="inline-flex items-center border border-[#E5E0D5] rounded-lg bg-[#FAF9F5]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Kurangi jumlah"
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#EAE6DC] rounded-l-lg cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(activeVariant?.stock || 1, q + 1))
                  }
                  aria-label="Tambah jumlah"
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#EAE6DC] rounded-r-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm font-semibold text-[#18231B] tabular-nums ml-auto">
                Subtotal: {activeVariant ? formatRupiah(activeVariant.price * quantity) : '-'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={!activeVariant || activeVariant.stock <= 0}
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] disabled:opacity-45 rounded-lg transition-colors cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    Ditambahkan ke Keranjang
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Tambah ke Keranjang
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={!activeVariant || activeVariant.stock <= 0}
                onClick={() => {
                  setWaOrderUrl('');
                  setWaError('');
                  setWaModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-semibold text-[#1B4D3E] border border-[#1B4D3E] bg-white hover:bg-[#1B4D3E]/5 disabled:opacity-45 rounded-lg transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Checkout via WhatsApp
              </button>
            </div>
          </div>

          {/* Quality Specifications Table */}
          <div className="pt-5 border-t border-[#E5E0D5]">
            <h2 className="text-xs font-semibold text-[#18231B] mb-3">
              Informasi Mutu & Spesifikasi Beras
            </h2>
            <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
              <div>
                <dt className="text-[#546158]">Tekstur Nasi</dt>
                <dd className="font-semibold text-[#18231B] mt-0.5">{product.texture}</dd>
              </div>
              <div>
                <dt className="text-[#546158]">Aroma Alami</dt>
                <dd className="font-semibold text-[#18231B] mt-0.5">{product.aroma}</dd>
              </div>
              <div>
                <dt className="text-[#546158]">Kadar Air Terukur</dt>
                <dd className="font-semibold text-[#18231B] tabular-nums mt-0.5">
                  {product.moistureContent}
                </dd>
              </div>
              <div>
                <dt className="text-[#546158]">Toleransi Butir Patah</dt>
                <dd className="font-semibold text-[#18231B] tabular-nums mt-0.5">
                  {product.brokenGrainMax}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Direct WhatsApp Order Modal */}
      {waModalOpen && activeVariant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45"
          role="dialog"
          aria-modal="true"
          aria-label="Checkout Langsung via WhatsApp"
        >
          <div className="w-full max-w-md bg-white border border-[#E5E0D5] rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#18231B]">
                  Checkout via WhatsApp
                </h2>
                <p className="text-xs text-[#546158] mt-1">
                  {product.name} ({activeVariant.label}) × {quantity} —{' '}
                  <span className="font-semibold text-[#18231B] tabular-nums">
                    {formatRupiah(activeVariant.price * quantity)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWaModalOpen(false)}
                className="text-xs font-semibold text-[#546158] hover:text-[#18231B] cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {waOrderUrl ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-[#F2EFE9] border border-[#E5E0D5] text-sm space-y-1">
                  <div className="font-semibold text-[#1B4D3E]">
                    Pesanan #{waOrderNum} Tercatat
                  </div>
                  <p className="text-xs text-[#3F4E44]">
                    Klik tombol di bawah untuk mengirim ringkasan pesanan langsung ke WhatsApp
                    Admin TANIBERAS.
                  </p>
                </div>
                <a
                  href={waOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#2E7D5B] hover:bg-[#1B4D3E] text-white text-sm font-semibold"
                >
                  <MessageCircle className="w-4 h-4" />
                  Buka WhatsApp Sekarang
                </a>
              </div>
            ) : (
              <form onSubmit={handleWhatsAppSubmit} className="space-y-3">
                {waError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                    {waError}
                  </div>
                )}
                <input
                  type="text"
                  required
                  value={waName}
                  onChange={(e) => setWaName(e.target.value)}
                  placeholder="Nama lengkap penerima *"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                />
                <input
                  type="tel"
                  required
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="Nomor WhatsApp aktif (08xx...) *"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                />
                <input
                  type="text"
                  required
                  value={waCity}
                  onChange={(e) => setWaCity(e.target.value)}
                  placeholder="Kota / Kabupaten *"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                />
                <textarea
                  rows={2}
                  required
                  value={waAddress}
                  onChange={(e) => setWaAddress(e.target.value)}
                  placeholder="Alamat lengkap pengiriman *"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                />
                <button
                  type="submit"
                  disabled={waSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#1B4D3E] hover:bg-[#153D31] text-white text-sm font-semibold cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  {waSubmitting ? 'Memproses...' : 'Buat Pesanan & Lanjut ke WhatsApp'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
