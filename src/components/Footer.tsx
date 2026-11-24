interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#18231B] text-[#E6E3DA] border-t border-[#26362B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#2C3E32]">
          <div className="md:col-span-5 space-y-4">
            <div className="font-display text-2xl font-bold tracking-tight text-white">
              TANIBERAS
            </div>
            <p className="text-sm text-[#C4CCC5] leading-relaxed max-w-md">
              Dari Sawah ke Meja Makan, Kualitas Terbaik untuk Keluarga. Platform agribisnis
              beras lokal Indonesia yang mengutamakan kesegaran giling, keaslian varietas, dan
              kesejahteraan petani.
            </p>
            <div className="text-xs text-[#9BA89E] space-y-1 pt-1">
              <p>Sentra Penggilingan: Jl. Raya Sukabumi KM 8, Warungkondang, Cianjur 43261</p>
              <p>Hub Distribusi: Jl. Raya Pasar Minggu No. 42, Jakarta Selatan 12520</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-white">Jelajahi</h3>
            <ul className="space-y-2.5 text-sm text-[#C4CCC5]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tentang-kami')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tentang Kami
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/produk')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Katalog Beras
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/artikel')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Artikel Pertanian
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-white">Kolaborasi</h3>
            <ul className="space-y-2.5 text-sm text-[#C4CCC5]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/kemitraan')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Kemitraan Petani
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/kemitraan')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Distributor & Reseller
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/kontak')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Hubungi Kami
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Dashboard Admin
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-white">Layanan Pelanggan</h3>
            <div className="text-sm text-[#C4CCC5] space-y-2">
              <p className="tabular-nums">WhatsApp: +62 811-2233-4455</p>
              <p>Email: halo@taniberas.id</p>
              <p className="text-xs text-[#9BA89E]">Senin – Sabtu, 08.00 – 17.00 WIB</p>
            </div>
            <div className="flex items-center gap-4 pt-2 text-xs text-[#C4CCC5]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                YouTube
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9BA89E]">
          <p>© {new Date().getFullYear()} TANIBERAS Indonesia. Seluruh hak cipta dilindungi.</p>
          <p>Beras Lokal Terverifikasi · Giling Segar Langsung dari Petani Mitra</p>
        </div>
      </div>
    </footer>
  );
}
