import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';

export type AppRoute =
  | '/'
  | '/tentang-kami'
  | '/produk'
  | '/kemitraan'
  | '/artikel'
  | '/kontak'
  | '/admin'
  | `/produk/${string}`;

interface NavbarProps {
  currentPath: string;
  cartCount: number;
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
}

const NAV_LINKS = [
  { label: 'Beranda', path: '/' },
  { label: 'Tentang Kami', path: '/tentang-kami' },
  { label: 'Produk', path: '/produk' },
  { label: 'Kemitraan', path: '/kemitraan' },
  { label: 'Artikel', path: '/artikel' },
  { label: 'Kontak', path: '/kontak' },
];

export function Navbar({
  currentPath,
  cartCount,
  onNavigate,
  onOpenCart,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLinkActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const handleLinkClick = (path: string) => {
    setMobileOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-sm border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick('/')}
          className="font-display text-xl font-bold tracking-tight text-[#1B4D3E] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] rounded-sm cursor-pointer"
        >
          TANIBERAS
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#546158]"
        >
          {NAV_LINKS.map((item) => {
            const active = isLinkActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleLinkClick(item.path)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E] rounded-sm ${
                  active
                    ? 'text-[#18231B] font-semibold'
                    : 'text-[#546158] hover:text-[#18231B]'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#1B4D3E]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary storefront action + cart trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Buka keranjang belanja, ${cartCount} item`}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E5E0D5] bg-white text-[#18231B] hover:border-[#1B4D3E] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D3E]"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#1B4D3E] text-white text-[11px] font-semibold tabular-nums flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleLinkClick('/produk')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B4D3E]"
          >
            Belanja Sekarang
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E5E0D5] bg-white text-[#18231B] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E5E0D5] bg-[#FAF9F5] px-4 py-4 space-y-1">
          {NAV_LINKS.map((item) => {
            const active = isLinkActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleLinkClick(item.path)}
                className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#EAE6DC] text-[#18231B] font-semibold'
                    : 'text-[#546158] hover:bg-[#F2EFE9]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-[#E5E0D5] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleLinkClick('/produk')}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#1B4D3E] rounded-lg cursor-pointer"
            >
              Belanja Sekarang
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('/admin')}
              className="w-full py-2 px-4 text-xs font-medium text-[#546158] hover:text-[#18231B] text-center cursor-pointer"
            >
              Masuk Dashboard Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
