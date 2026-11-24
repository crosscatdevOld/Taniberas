import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import type { CartItem, OrderRecord, PaymentMethod } from '../types.ts';
import { formatRupiah } from '../utils/format.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, variantId: string, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onClearCart: () => void;
  onBrowseProducts: () => void;
}

type DrawerStep = 'cart' | 'checkout' | 'success';

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onBrowseProducts,
}: CartDrawerProps) {
  const [step, setStep] = useState<DrawerStep>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transfer Bank');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const freeShippingThreshold = 250000;
  const shippingCost = items.length === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : 18000;
  const totalAmount = subtotal + shippingCost;

  const handleClose = () => {
    if (step === 'success') {
      setStep('cart');
      setConfirmedOrder(null);
      setWhatsappUrl('');
    }
    onClose();
  };

  const submitOrder = async (channel: 'website' | 'whatsapp') => {
    setErrorMsg('');
    if (!customerName.trim() || !customerPhone.trim() || !city.trim() || !address.trim()) {
      setErrorMsg('Mohon lengkapi nama, nomor WhatsApp, kota, dan alamat pengiriman.');
      return;
    }
    const digits = customerPhone.replace(/[^0-9]/g, '');
    if (digits.length < 9) {
      setErrorMsg('Nomor WhatsApp minimal 9 digit angka.');
      return;
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setErrorMsg('Format alamat email tidak valid.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          city: city.trim(),
          address: address.trim(),
          paymentMethod: channel === 'whatsapp' ? 'WhatsApp Order' : paymentMethod,
          channel,
          notes: notes.trim(),
          items: items.map((it) => ({
            productId: it.productId,
            variantId: it.variantId,
            quantity: it.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal memproses pesanan. Silakan coba lagi.');
        return;
      }
      setConfirmedOrder(data.order);
      setWhatsappUrl(data.whatsappUrl || '');
      onClearCart();
      setStep('success');
    } catch {
      setErrorMsg('Terjadi gangguan jaringan saat mengirim pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang Belanja TANIBERAS"
    >
      <div className="w-full max-w-md bg-[#FAF9F5] h-full flex flex-col border-l border-[#E5E0D5] shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E5E0D5] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setStep('cart');
                }}
                aria-label="Kembali ke keranjang"
                className="p-1.5 rounded-md hover:bg-[#F2EFE9] text-[#18231B] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-display text-lg font-semibold text-[#18231B]">
              {step === 'cart' && `Keranjang Belanja (${items.length})`}
              {step === 'checkout' && 'Informasi Pengiriman'}
              {step === 'success' && 'Pesanan Tercatat'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup keranjang"
            className="p-2 rounded-lg text-[#546158] hover:text-[#18231B] hover:bg-[#F2EFE9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-[#EAE6DC] text-[#1B4D3E] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#18231B] mb-2">
                    Keranjang Anda masih kosong
                  </h3>
                  <p className="text-sm text-[#546158] max-w-xs mb-6">
                    Pilih varietas beras giling segar langsung dari petani mitra TANIBERAS.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onBrowseProducts();
                    }}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] rounded-lg transition-colors cursor-pointer"
                  >
                    Lihat Katalog Beras
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="px-4 py-3 rounded-lg bg-[#EAE6DC]/70 border border-[#E5E0D5] text-xs text-[#18231B]">
                    {subtotal >= freeShippingThreshold
                      ? 'Pesanan Anda memenuhi syarat Gratis Ongkir Jabodetabek & Jawa Barat.'
                      : `Tambah ${formatRupiah(freeShippingThreshold - subtotal)} lagi untuk mendapatkan Gratis Ongkir.`}
                  </div>

                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex gap-4 p-3.5 bg-white border border-[#E5E0D5] rounded-xl"
                    >
                      <ResilientImage
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover shrink-0 border border-[#E5E0D5]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-[#18231B] truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-[#546158] mt-0.5">
                              {item.variety} · {item.weightLabel}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.productId, item.variantId)}
                            aria-label={`Hapus ${item.name}`}
                            className="p-1 text-[#546158] hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center border border-[#E5E0D5] rounded-lg bg-[#FAF9F5]">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.productId, item.variantId, -1)}
                              aria-label="Kurangi jumlah"
                              className="w-8 h-8 flex items-center justify-center text-[#18231B] hover:bg-[#EAE6DC] rounded-l-lg cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.productId, item.variantId, 1)}
                              disabled={item.quantity >= item.maxStock}
                              aria-label="Tambah jumlah"
                              className="w-8 h-8 flex items-center justify-center text-[#18231B] hover:bg-[#EAE6DC] disabled:opacity-40 rounded-r-lg cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-[#18231B] tabular-nums">
                            {formatRupiah(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form
              id="taniberas-checkout-form"
              onSubmit={(e) => {
                e.preventDefault();
                submitOrder('website');
              }}
              className="space-y-4"
            >
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Siti Aminah"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="nama@email.id"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Jakarta Selatan / Bandung"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['Transfer Bank', 'COD'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-[#1B4D3E] text-white border-[#1B4D3E]'
                          : 'bg-white text-[#18231B] border-[#E5E0D5] hover:border-[#1B4D3E]'
                      }`}
                    >
                      {method === 'COD' ? 'Bayar di Tempat (COD)' : 'Transfer Bank'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                  Catatan Pesanan (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: kirim pagi hari / titip ke pos satpam"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>
            </form>
          )}

          {step === 'success' && confirmedOrder && (
            <div className="py-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <p className="text-xs font-semibold text-[#1B4D3E]">
                  Pesanan Berhasil Dibuat
                </p>
                <h3 className="font-display text-2xl font-bold text-[#18231B] tabular-nums">
                  #{confirmedOrder.orderNumber}
                </h3>
                <p className="text-sm text-[#546158]">
                  Tim gudang TANIBERAS akan segera memproses penggilingan dan pengiriman ke{' '}
                  <span className="font-medium text-[#18231B]">{confirmedOrder.city}</span>.
                </p>
              </div>

              <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between text-xs text-[#546158] pb-2 border-b border-[#E5E0D5]">
                  <span>Penerima</span>
                  <span className="font-semibold text-[#18231B]">
                    {confirmedOrder.customerName}
                  </span>
                </div>
                {confirmedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-[#18231B]">
                      {it.productName} ({it.weightLabel}) × {it.quantity}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatRupiah(it.subtotal)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#E5E0D5] flex justify-between font-semibold text-[#18231B]">
                  <span>Total Pembayaran ({confirmedOrder.paymentMethod})</span>
                  <span className="tabular-nums">{formatRupiah(confirmedOrder.totalAmount)}</span>
                </div>
              </div>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#2E7D5B] hover:bg-[#1B4D3E] text-white text-sm font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Kirim Bukti Pesanan ke WhatsApp
                </a>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-lg border border-[#E5E0D5] bg-white hover:bg-[#F2EFE9] text-sm font-medium text-[#18231B] cursor-pointer"
              >
                Kembali Berbelanja
              </button>
            </div>
          )}
        </div>

        {/* Footer Totals */}
        {items.length > 0 && step !== 'success' && (
          <div className="p-6 bg-white border-t border-[#E5E0D5] space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#546158]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#546158]">
                <span>Ongkos Kirim</span>
                <span className="tabular-nums">
                  {shippingCost === 0 ? 'Gratis' : formatRupiah(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base text-[#18231B] pt-2 border-t border-[#E5E0D5]">
                <span>Total</span>
                <span className="tabular-nums">{formatRupiah(totalAmount)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 px-4 rounded-lg bg-[#1B4D3E] hover:bg-[#153D31] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Lanjut ke Checkout
              </button>
            ) : (
              <div className="space-y-2.5">
                <button
                  type="submit"
                  form="taniberas-checkout-form"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-lg bg-[#1B4D3E] hover:bg-[#153D31] disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {submitting ? 'Memproses Pesanan...' : 'Buat Pesanan Sekarang'}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submitOrder('whatsapp')}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-[#1B4D3E] text-[#1B4D3E] hover:bg-[#1B4D3E]/5 disabled:opacity-60 text-sm font-semibold transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Pesan & Konfirmasi via WhatsApp
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
