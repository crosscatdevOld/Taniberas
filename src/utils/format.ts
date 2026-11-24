export function formatRupiah(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
}

export function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export const WHATSAPP_ADMIN_PHONE = '6281122334455';

export function buildWhatsAppDirectUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
}

export const AVAILABLE_ASSET_IMAGES = [
  {
    label: 'Beras Pandan Wangi (Kemasan & Mangkuk)',
    url: '/src/assets/images/product_pandan_wangi_1795527041071.jpg',
  },
  {
    label: 'Beras Mentik Susu Organik (Karung Linen)',
    url: '/src/assets/images/product_mentik_susu_1795527040974.jpg',
  },
  {
    label: 'Beras Merah Organik (Kemasan & Mangkuk)',
    url: '/src/assets/images/product_beras_merah_1795527040443.jpg',
  },
  {
    label: 'Tiga Varietas Beras Nusantara',
    url: '/src/assets/images/article_rice_quality_1795527040679.jpg',
  },
  {
    label: 'Petani Padi & Panen Gabah',
    url: '/src/assets/images/about_indonesian_farmers_1795527040756.jpg',
  },
  {
    label: 'Hamparan Sawah Terasering Indonesia',
    url: '/src/assets/images/hero_taniberas_paddy_1795527040882.jpg',
  },
];
