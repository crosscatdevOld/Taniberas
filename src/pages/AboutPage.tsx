import { ArrowRight } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage.tsx';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

const FARMERS_IMAGE = '/src/assets/images/about_indonesian_farmers_1795527040756.jpg';
const VARIETIES_IMAGE = '/src/assets/images/article_rice_quality_1795527040679.jpg';

const SUPPLY_CHAIN_STEPS = [
  {
    step: '01. Pendampingan Budidaya & Seleksi Benih',
    text: 'Agronom lapangan kami mendampingi kelompok tani memilih benih varietas murni serta menjaga pemupukan berimbang dan ramah lingkungan.',
  },
  {
    step: '02. Penyerapan Gabah Harga Adil',
    text: 'Panen gabah kering dibeli langsung dari petani tanpa tengkulak bertingkat dengan skema pembayaran transparan dan tepat waktu.',
  },
  {
    step: '03. Penggilingan Segar & Sortir Optik',
    text: 'Gabah disimpan utuh dalam sekam dan hanya digiling mendekati jadwal pengiriman, melewati uji kadar air dan penyortiran bebas batu.',
  },
  {
    step: '04. Distribusi Terlacak ke Konsumen',
    text: 'Setiap kemasan mencantumkan nama kelompok tani asal, tanggal panen, dan wilayah budidaya agar konsumen tahu persis sumber pangannya.',
  },
];

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 space-y-20">
      {/* Intro Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
          <p className="text-xs font-semibold text-[#1B4D3E]">Tentang TANIBERAS</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#18231B] leading-[1.15] tracking-tight [text-wrap:balance]">
            Menghubungkan Kembali Dapur Keluarga dengan Sawah Indonesia.
          </h1>
          <p className="text-base text-[#3F4E44] leading-relaxed">
            TANIBERAS lahir dari kegelisahan sederhana: mengapa petani padi bekerja paling keras
            namun menerima margin paling kecil, sementara konsumen kota sering kesulitan
            memastikan keaslian dan kesegaran beras yang mereka beli?
          </p>
          <p className="text-base text-[#3F4E44] leading-relaxed">
            Sejak 2023, kami membangun jaringan kemitraan langsung bersama kelompok tani di
            Cianjur, Karawang, Magelang, Klaten, Sleman, Banyuwangi, hingga Solok untuk
            menghadirkan beras varietas lokal terbaik yang digiling segar sesuai pesanan.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/produk')}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] rounded-lg transition-colors cursor-pointer"
            >
              Jelajahi Katalog Beras
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/kemitraan')}
              className="px-5 py-3 text-sm font-semibold text-[#18231B] border border-[#E5E0D5] bg-white hover:border-[#1B4D3E] rounded-lg transition-colors cursor-pointer"
            >
              Program Kemitraan
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="h-full min-h-[340px] rounded-2xl overflow-hidden border border-[#E5E0D5]">
            <ResilientImage
              src={FARMERS_IMAGE}
              alt="Aktivitas panen dan penyortiran gabah petani mitra TANIBERAS"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Visi, Misi & Filosofi */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-7">
        <div className="bg-white border border-[#E5E0D5] rounded-2xl p-7 space-y-3">
          <p className="text-xs font-semibold text-[#1B4D3E]">Visi Perusahaan</p>
          <h2 className="font-display text-xl font-semibold text-[#18231B]">
            Lumbung Pangan Modern yang Adil & Berkelanjutan
          </h2>
          <p className="text-sm text-[#546158] leading-relaxed">
            Menjadi platform distribusi beras lokal terpercaya di Indonesia yang memakmurkan
            petani dan menjamin standar gizi serta kesegaran terbaik di setiap rumah tangga.
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D5] rounded-2xl p-7 space-y-3">
          <p className="text-xs font-semibold text-[#1B4D3E]">Misi Utama</p>
          <h2 className="font-display text-xl font-semibold text-[#18231B]">
            Transparansi Asal, Harga, dan Mutu Panen
          </h2>
          <p className="text-sm text-[#546158] leading-relaxed">
            Menjaga kemurnian varietas padi Nusantara, menerapkan prinsip giling-segar maksimal 48
            jam, serta membangun ekosistem kemitraan distribusi yang inklusif.
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D5] rounded-2xl p-7 space-y-3">
          <p className="text-xs font-semibold text-[#1B4D3E]">Filosofi Bisnis</p>
          <h2 className="font-display text-xl font-semibold text-[#18231B]">
            Tumbuh Bersama dari Hulu ke Hilir
          </h2>
          <p className="text-sm text-[#546158] leading-relaxed">
            Kualitas nasi di meja makan adalah cerminan kesejahteraan petani di sawah. Tanpa
            petani yang sejahtera, ketahanan pangan berkualitas tidak akan pernah terwujud.
          </p>
        </div>
      </section>

      {/* Komitmen & Rantai Pasok */}
      <section className="bg-white border border-[#E5E0D5] rounded-2xl p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-semibold text-[#1B4D3E]">
              Komitmen Kami kepada Petani & Konsumen
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#18231B] [text-wrap:balance]">
              Empat Tahap Penjaminan Mutu dari Sawah hingga Dapur
            </h2>
            <p className="text-sm text-[#546158] leading-relaxed">
              Tidak ada pengawet, pemutih klorin, maupun pewangi sintetis dalam seluruh lini
              produksi TANIBERAS.
            </p>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#E5E0D5]">
              <ResilientImage
                src={VARIETIES_IMAGE}
                alt="Ragam varietas beras putih, merah, dan hitam Nusantara"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 divide-y divide-[#E5E0D5]">
            {SUPPLY_CHAIN_STEPS.map((item) => (
              <div key={item.step} className="py-5 first:pt-0 last:pb-0 space-y-1.5">
                <h3 className="text-base font-semibold text-[#18231B]">{item.step}</h3>
                <p className="text-sm text-[#546158] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
