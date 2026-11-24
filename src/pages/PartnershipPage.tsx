import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { PartnerType } from '../types.ts';
import { ResilientImage } from '../components/ResilientImage.tsx';

const FARMERS_IMAGE = '/src/assets/images/about_indonesian_farmers_1795527040756.jpg';

const PARTNER_PROGRAMS: Array<{
  type: PartnerType;
  number: string;
  headline: string;
  description: string;
  benefit: string;
}> = [
  {
    type: 'Petani',
    number: '01.',
    headline: 'Petani Padi Individu',
    description:
      'Bagi petani penggarap maupun pemilik lahan yang ingin menjual gabah kering panen atau kering giling dengan harga transparan.',
    benefit: 'Pendampingan agronomis dan kepastian serap setiap musim panen.',
  },
  {
    type: 'Kelompok Tani',
    number: '02.',
    headline: 'Kelompok Tani & Gapoktan',
    description:
      'Kontrak kemitraan volume komunal untuk sentra produksi padi daerah yang mengutamakan kemurnian varietas lokal.',
    benefit: 'Akses pembiayaan pascapanen, penyediaan karung kemasan, dan pembayaran terjadwal.',
  },
  {
    type: 'Distributor',
    number: '03.',
    headline: 'Distributor Regional & Horeka',
    description:
      'Suplai rutin kemasan 10 kg hingga 25 kg bagi hotel, restoran, katering, maupun distributor bahan pokok antarkota.',
    benefit: 'Harga grosir bertingkat, prioritas jadwal giling, dan jaminan mutu seragam.',
  },
  {
    type: 'Reseller',
    number: '04.',
    headline: 'Reseller & Toko Sembako Modern',
    description:
      'Peluang usaha pemasaran beras kemasan ritel 1 kg, 2 kg, dan 5 kg dengan perputaran cepat untuk kebutuhan rumah tangga.',
    benefit: 'Modal awal ringan, materi promosi siap pakai, dan margin menarik.',
  },
  {
    type: 'Agen Penjualan',
    number: '05.',
    headline: 'Agen Penjualan Komunitas',
    description:
      'Koordinator pemesanan kolektif untuk komplek perumahan, koperasi karyawan, atau komunitas keluarga sehat.',
    benefit: 'Komisi penjualan langsung per kilogram dan pengiriman kolektif gratis ongkir.',
  },
];

export function PartnershipPage() {
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [partnerType, setPartnerType] = useState<PartnerType>('Kelompok Tani');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [estimatedCapacity, setEstimatedCapacity] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmittedSuccess(false);

    if (!fullName.trim() || !phone.trim() || !email.trim() || !region.trim()) {
      setErrorMsg('Mohon lengkapi nama lengkap, WhatsApp, email, dan wilayah operasional.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Format alamat email tidak valid.');
      return;
    }
    if (phone.replace(/[^0-9]/g, '').length < 9) {
      setErrorMsg('Nomor WhatsApp minimal 9 digit angka.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          organizationName: organizationName.trim(),
          partnerType,
          phone: phone.trim(),
          email: email.trim(),
          region: region.trim(),
          estimatedCapacity: estimatedCapacity.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mengirim pendaftaran kemitraan.');
        return;
      }
      setSubmittedSuccess(true);
      setFullName('');
      setOrganizationName('');
      setPhone('');
      setEmail('');
      setRegion('');
      setEstimatedCapacity('');
      setMessage('');
    } catch {
      setErrorMsg('Gangguan jaringan saat mengirim formulir. Silakan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
      {/* Header Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
          <p className="text-xs font-semibold text-[#1B4D3E]">Kemitraan Agribisnis TANIBERAS</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#18231B] leading-tight [text-wrap:balance]">
            Bangun Rantai Pangan Beras Nusantara yang Saling Menguatkan.
          </h1>
          <p className="text-base text-[#3F4E44] leading-relaxed">
            Baik Anda seorang petani di sentra produksi padi maupun distributor dan agen di kota
            tujuan konsumsi, TANIBERAS membuka kolaborasi jangka panjang yang transparan dan
            berkeadilan.
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="h-full min-h-[260px] rounded-2xl overflow-hidden border border-[#E5E0D5]">
            <ResilientImage
              src={FARMERS_IMAGE}
              alt="Kemitraan petani dan kelompok tani TANIBERAS"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5 Jalur Kemitraan */}
      <section className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#18231B]">
            Skema Kerja Sama Mitra
          </h2>
          <p className="text-sm text-[#546158]">
            Pilih peran yang paling sesuai dengan kapasitas produksi atau jaringan distribusi Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PARTNER_PROGRAMS.map((prog) => (
            <div
              key={prog.type}
              className="bg-white border border-[#E5E0D5] rounded-2xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#1B4D3E]">
                  {prog.number} {prog.type}
                </div>
                <h3 className="text-lg font-semibold text-[#18231B]">{prog.headline}</h3>
                <p className="text-sm text-[#546158] leading-relaxed">{prog.description}</p>
              </div>
              <div className="pt-4 border-t border-[#E5E0D5] flex items-center justify-between gap-3">
                <span className="text-xs text-[#3F4E44] leading-snug">{prog.benefit}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPartnerType(prog.type);
                    document
                      .getElementById('form-pendaftaran-mitra')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-[#1B4D3E] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Pilih Skema
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formulir Pendaftaran Mitra */}
      <section
        id="form-pendaftaran-mitra"
        className="bg-white border border-[#E5E0D5] rounded-2xl p-6 sm:p-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-semibold text-[#1B4D3E]">Formulir Pendaftaran</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#18231B]">
              Ajukan Kemitraan TANIBERAS
            </h2>
            <p className="text-sm text-[#546158] leading-relaxed">
              Tim kemitraan kami akan meninjau profil Anda dan menghubungi melalui WhatsApp atau
              email dalam maksimal 2 hari kerja untuk jadwal survei lahan atau pembahasan skema
              harga grosir.
            </p>
          </div>

          <div className="lg:col-span-7">
            {submittedSuccess ? (
              <div className="p-6 rounded-xl bg-[#F2EFE9] border border-[#E5E0D5] space-y-3">
                <div className="flex items-center gap-2 text-[#1B4D3E] font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  Pendaftaran Kemitraan Terkirim
                </div>
                <p className="text-sm text-[#3F4E44]">
                  Terima kasih telah mendaftar sebagai calon mitra TANIBERAS. Data Anda sudah masuk
                  ke sistem tim kemitraan kami untuk ditindaklanjuti.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1B4D3E] rounded-lg cursor-pointer"
                >
                  Daftarkan Mitra Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                      Nama Lengkap Penanggung Jawab *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                      Jenis Kemitraan *
                    </label>
                    <select
                      value={partnerType}
                      onChange={(e) => setPartnerType(e.target.value as PartnerType)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                    >
                      <option value="Petani">Petani</option>
                      <option value="Kelompok Tani">Kelompok Tani (Gapoktan)</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Reseller">Reseller</option>
                      <option value="Agen Penjualan">Agen Penjualan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                      Nama Kelompok Tani / Toko / Usaha
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Opsional jika perorangan"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                      Wilayah / Kabupaten & Provinsi *
                    </label>
                    <input
                      type="text"
                      required
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Contoh: Cianjur, Jawa Barat"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                      Alamat Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.id"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                    Estimasi Kapasitas Panen atau Penjualan per Bulan
                  </label>
                  <input
                    type="text"
                    value={estimatedCapacity}
                    onChange={(e) => setEstimatedCapacity(e.target.value)}
                    placeholder="Contoh: 5 ton gabah / panen atau 500 kg / bulan"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ceritakan varietas yang dibudidayakan atau target pasar Anda..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? 'Mengirim Pengajuan...' : 'Kirim Pendaftaran Kemitraan'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
