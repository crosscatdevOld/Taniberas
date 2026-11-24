import { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { buildWhatsAppDirectUrl } from '../utils/format.ts';

const LOCATIONS = [
  {
    id: 'cianjur',
    name: 'Sentra Penggilingan & Kantor Operasional',
    address: 'Jl. Raya Sukabumi KM 8, Warungkondang, Cianjur, Jawa Barat 43261',
    coords: '-6.8542, 107.0956',
    hours: 'Senin – Sabtu, 07.30 – 16.30 WIB',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.8542,107.0956',
  },
  {
    id: 'jakarta',
    name: 'Gudang Distribusi Jabodetabek',
    address: 'Jl. Raya Pasar Minggu No. 42, Pejaten Timur, Jakarta Selatan 12520',
    coords: '-6.2784, 106.8442',
    hours: 'Senin – Sabtu, 08.00 – 17.00 WIB',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-6.2784,106.8442',
  },
];

export function ContactPage() {
  const [selectedLocId, setSelectedLocId] = useState(LOCATIONS[0].id);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sent, setSent] = useState(false);

  const activeLocation = LOCATIONS.find((l) => l.id === selectedLocId) || LOCATIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('Nama, email, subjek, dan pesan wajib diisi.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Format alamat email tidak valid.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mengirim pesan.');
        return;
      }
      setSent(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch {
      setErrorMsg('Gangguan koneksi saat mengirim pesan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-14">
      <div className="space-y-2 max-w-2xl">
        <p className="text-xs font-semibold text-[#1B4D3E]">Hubungi TANIBERAS</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#18231B] [text-wrap:balance]">
          Siap Melayani Kebutuhan Beras Keluarga & Usaha Anda
        </h1>
        <p className="text-sm sm:text-base text-[#546158]">
          Konsultasikan pilihan varietas beras, pengiriman grosir, maupun kunjungan ke sentra
          penggilingan kami di Cianjur.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info & Map Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-6 space-y-5">
            <h2 className="font-display text-xl font-semibold text-[#18231B]">
              Saluran Resmi
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#1B4D3E] mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-[#18231B]">WhatsApp Layanan Pelanggan</div>
                  <div className="text-[#546158] tabular-nums">+62 811-2233-4455</div>
                  <a
                    href={buildWhatsAppDirectUrl(
                      'Halo Tim TANIBERAS, saya ingin bertanya mengenai produk beras.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] hover:underline mt-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat WhatsApp Sekarang
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#1B4D3E] mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-[#18231B]">Email Resmi</div>
                  <div className="text-[#546158]">halo@taniberas.id</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#1B4D3E] mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-[#18231B]">Lokasi Operasional</div>
                  <p className="text-[#546158] text-xs mt-0.5 leading-relaxed">
                    {activeLocation.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E0D5]">
              <div className="text-xs font-semibold text-[#18231B] mb-2">Media Sosial</div>
              <div className="flex flex-wrap gap-3 text-xs font-medium text-[#1B4D3E]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Instagram (@taniberas.id)
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  YouTube
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Location Selector & Directions Card */}
          <div className="bg-white border border-[#E5E0D5] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-[#18231B]">
                Peta Lokasi & Gudang
              </h2>
              <span className="text-[11px] font-mono text-[#546158] tabular-nums">
                {activeLocation.coords}
              </span>
            </div>

            <div className="flex gap-1.5 bg-[#F2EFE9] p-1 rounded-lg">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    selectedLocId === loc.id
                      ? 'bg-white text-[#18231B] shadow-sm'
                      : 'text-[#546158] hover:text-[#18231B]'
                  }`}
                >
                  {loc.id === 'cianjur' ? 'Penggilingan Cianjur' : 'Hub Jakarta Selatan'}
                </button>
              ))}
            </div>

            {/* Clean Architectural Vector Map Pin Display */}
            <div className="relative h-48 rounded-xl bg-[#EAE6DC] border border-[#E5E0D5] overflow-hidden p-4 flex flex-col justify-between">
              <svg
                aria-hidden="true"
                viewBox="0 0 400 180"
                className="absolute inset-0 w-full h-full opacity-35 text-[#1B4D3E]"
                fill="none"
              >
                <path
                  d="M0 40 Q110 25 220 75 T400 50"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 120 Q150 95 260 135 T400 110"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path d="M90 0 L130 180" stroke="currentColor" strokeWidth="1" />
                <path d="M270 0 L245 180" stroke="currentColor" strokeWidth="1" />
              </svg>
              <div className="relative z-10 inline-flex items-center gap-2 bg-white/95 border border-[#E5E0D5] rounded-lg px-3 py-2 w-fit">
                <MapPin className="w-4 h-4 text-[#1B4D3E]" />
                <span className="text-xs font-semibold text-[#18231B]">
                  {activeLocation.name}
                </span>
              </div>
              <div className="relative z-10 bg-white/95 border border-[#E5E0D5] rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="text-xs text-[#3F4E44]">
                  <div className="font-semibold text-[#18231B]">{activeLocation.hours}</div>
                  <div className="line-clamp-1">{activeLocation.address}</div>
                </div>
                <a
                  href={activeLocation.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] rounded-lg whitespace-nowrap shrink-0"
                >
                  Buka Maps
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border border-[#E5E0D5] rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-[#18231B] mb-2">
            Kirim Pesan Langsung
          </h2>
          <p className="text-sm text-[#546158] mb-6">
            Punya pertanyaan seputar stok varietas, pemesanan rutin kantor, atau jadwal
            pengiriman? Tuliskan pesan Anda di bawah ini.
          </p>

          {sent ? (
            <div className="p-6 rounded-xl bg-[#F2EFE9] border border-[#E5E0D5] space-y-3">
              <div className="flex items-center gap-2 font-semibold text-[#1B4D3E]">
                <CheckCircle2 className="w-5 h-5" />
                Pesan Anda Telah Diterima
              </div>
              <p className="text-sm text-[#3F4E44]">
                Terima kasih telah menghubungi TANIBERAS. Tim layanan pelanggan kami akan
                membalas melalui email atau WhatsApp Anda.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1B4D3E] rounded-lg cursor-pointer"
              >
                Kirim Pesan Baru
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
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.id"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                    Nomor WhatsApp (Opsional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                    Subjek Pesan *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Misal: Pemesanan rutin restoran"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18231B] mb-1.5">
                  Isi Pesan *
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan kebutuhan atau pertanyaan Anda secara rinci..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-[#E5E0D5] rounded-lg focus:outline-none focus:border-[#1B4D3E]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#1B4D3E] hover:bg-[#153D31] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                {submitting ? 'Mengirim Pesan...' : 'Kirim Pesan'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
