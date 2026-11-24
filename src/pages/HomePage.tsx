import { ArrowRight, Sprout, ShieldCheck, Truck, Handshake } from 'lucide-react';
import { motion } from 'motion/react';
import type { RiceProduct, TestimonialRecord } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';

interface HomePageProps {
  featuredProducts: RiceProduct[];
  testimonials: TestimonialRecord[];
  onNavigate: (path: string) => void;
  onQuickAdd: (product: RiceProduct) => void;
}

const HERO_IMAGE = '/src/assets/images/hero_taniberas_paddy_1795527040882.jpg';
const FARMERS_IMAGE = '/src/assets/images/about_indonesian_farmers_1795527040756.jpg';

const HIGHLIGHTS = [
  {
    icon: Sprout,
    number: '01.',
    title: '100% Asli Varietas Daerah',
    desc: 'Setiap karung berasal dari sentra padi spesifik seperti Cianjur, Magelang, dan Delanggu tanpa oplosan.',
  },
  {
    icon: ShieldCheck,
    number: '02.',
    title: 'Giling Segar Maks. 48 Jam',
    desc: 'Gabah digiling mendekati jadwal pengiriman sehingga aroma pandan alami dan tekstur pulen tetap terjaga.',
  },
  {
    icon: Handshake,
    number: '03.',
    title: 'Harga Adil Untuk Petani',
    desc: 'Kontrak serap langsung bersama kelompok tani memangkas perantara dan menaikkan pendapatan petani mitra.',
  },
  {
    icon: Truck,
    number: '04.',
    title: 'Pengemasan Higienis & Terjamin',
    desc: 'Penyortiran optik bebas batu serta kemasan kedap udara menjaga kebersihan beras hingga ke dapur Anda.',
  },
];

const IMPACT_STATS = [
  {
    value: '1.450+',
    label: 'Petani Mitra Terdaftar',
    detail: 'Tersebar di 6 sentra lumbung padi Jawa & Sumatera',
  },
  {
    value: '48 Jam',
    label: 'Batas Giling-ke-Kirim',
    detail: 'Kesegaran maksimal tanpa penimbunan gudang lama',
  },
  {
    value: '185 Ton',
    label: 'Beras Tersalurkan / Bulan',
    detail: 'Melayani keluarga, katering, dan mitra kuliner',
  },
  {
    value: '98,4%',
    label: 'Kepuasan Pelanggan',
    detail: 'Berdasarkan pesanan berulang kuartal IV 2026',
  },
];

export function HomePage({
  featuredProducts,
  testimonials,
  onNavigate,
  onQuickAdd,
}: HomePageProps) {
  return (
    <div>
      {/* 1. Hero Section */}
      <section className="relative min-h-[540px] lg:min-h-[620px] flex items-center overflow-hidden bg-[#18231B]">
        <ResilientImage
          src={HERO_IMAGE}
          alt="Hamparan sawah terasering Indonesia saat panen pagi"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0F1B13]/90 via-[#15251A]/75 to-[#15251A]/30"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs sm:text-sm font-medium tracking-wide text-[#D4DEC9]">
              TANIBERAS · Dari Sawah ke Meja Makan, Kualitas Terbaik untuk Keluarga
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-white leading-[1.12] tracking-tight [text-wrap:balance]">
              Beras Berkualitas, Langsung dari Sumber Terbaik.
            </h1>
            <p className="text-base sm:text-lg text-[#E6ECE2] leading-relaxed max-w-xl">
              Platform perdagangan beras modern yang menghubungkan kelompok tani lokal Indonesia
              langsung dengan dapur keluarga Anda. Murni varietasnya, transparan asalnya, dan
              selalu digiling segar.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/produk')}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#18231B] bg-[#F5F2EB] hover:bg-white rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Lihat Produk
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/tentang-kami')}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white border border-white/40 hover:bg-white/10 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Kenali Kami
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Highlight Keunggulan Taniberas */}
      <section className="bg-white border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.number} className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4D3E]">
                    <Icon className="w-4 h-4" />
                    <span>{item.number}</span>
                  </div>
                  <h2 className="font-sans text-base font-semibold text-[#18231B]">
                    {item.title}
                  </h2>
                  <p className="text-sm text-[#546158] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Produk Unggulan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-semibold text-[#1B4D3E]">Pilihan Musim Panen Ini</p>
            <h2 className="font-display text-3xl font-semibold text-[#18231B] tracking-tight [text-wrap:balance]">
              Produk Beras Unggulan
            </h2>
            <p className="text-sm sm:text-base text-[#546158]">
              Dipilih dari panen terbaik kelompok tani mitra dengan standar kadar air 13% dan
              butir kepala utuh.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/produk')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4D3E] hover:text-[#153D31] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Semua Produk ({featuredProducts.length}+)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {featuredProducts.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetail={(slug) => onNavigate(`/produk/${slug}`)}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      </section>

      {/* 4. Statistik Bisnis & Cerita Petani (Claim-to-Proof Adjacency) */}
      <section className="bg-[#F2EFE9] border-y border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch"
          >
            <div className="lg:col-span-6">
              <div className="h-full min-h-[300px] rounded-2xl overflow-hidden border border-[#E5E0D5] bg-white">
                <ResilientImage
                  src={FARMERS_IMAGE}
                  alt="Petani mitra TANIBERAS memeriksa hasil panen gabah"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-[#1B4D3E]">
                  Transparansi Rantai Pasok
                </p>
                <h2 className="font-display text-3xl font-semibold text-[#18231B] tracking-tight [text-wrap:balance]">
                  Memberdayakan Petani Lokal, Menjamin Mutu Setiap Butir.
                </h2>
                <p className="text-sm sm:text-base text-[#3F4E44] leading-relaxed">
                  Kami bekerja berdampingan dengan Gapoktan di Jawa Barat, Jawa Tengah,
                  Yogyakarta, hingga Sumatera Barat. Dengan memangkas rantai distribusi yang
                  berlapis, petani memperoleh harga serap lebih layak dan konsumen menerima beras
                  berkualitas tinggi.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#DFD9CC]">
                {IMPACT_STATS.map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display text-2xl sm:text-3xl font-bold text-[#1B4D3E] tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-[#18231B] mt-1">
                      {stat.label}
                    </div>
                    <p className="text-xs text-[#546158] mt-0.5 leading-snug">
                      {stat.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Testimoni Pelanggan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-xl space-y-2 mb-10">
          <p className="text-xs font-semibold text-[#1B4D3E]">Kepercayaan Konsumen</p>
          <h2 className="font-display text-3xl font-semibold text-[#18231B] tracking-tight [text-wrap:balance]">
            Pengalaman Nyata Keluarga & Mitra Kuliner
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {testimonials.map((t) => (
            <blockquote
              key={t.id}
              className="bg-white border border-[#E5E0D5] rounded-2xl p-6 flex flex-col justify-between space-y-6"
            >
              <p className="text-sm text-[#3F4E44] leading-relaxed">“{t.quote}”</p>
              <footer className="pt-4 border-t border-[#E5E0D5]">
                <div className="text-sm font-semibold text-[#18231B]">{t.name}</div>
                <div className="text-xs text-[#546158] mt-0.5">
                  {t.role} · {t.location}
                </div>
                <div className="text-xs font-medium text-[#1B4D3E] mt-1.5">
                  Produk: {t.ricePurchased}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* 6. CTA Kemitraan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-[#1B4D3E] rounded-2xl px-6 py-12 sm:px-12 sm:py-14 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold text-[#C9DFD3]">
              Program Kemitraan Nasional
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-snug [text-wrap:balance]">
              Gabung Bersama Ekosistem Pertanian TANIBERAS
            </h2>
            <p className="text-sm sm:text-base text-[#D7E6DD] leading-relaxed">
              Terbuka bagi petani, kelompok tani (Gapoktan), distributor regional, reseller
              komunitas, serta agen penjualan di seluruh Indonesia.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/kemitraan')}
              className="px-6 py-3.5 text-sm font-semibold text-[#18231B] bg-[#F5F2EB] hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Daftar Kemitraan
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/kontak')}
              className="px-5 py-3.5 text-sm font-semibold text-white border border-white/35 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Hubungi Tim Kami
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
