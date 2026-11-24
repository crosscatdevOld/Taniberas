import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  ArticleRecord,
  ContactRecord,
  CustomerRecord,
  OrderRecord,
  PartnershipRecord,
  RiceCategory,
  RiceProduct,
  TestimonialRecord,
} from '../types.ts';

export interface AdminCredential {
  salt: string;
  hash: string;
  claimedAt: string;
}

export interface TaniberasStoreData {
  categories: RiceCategory[];
  products: RiceProduct[];
  articles: ArticleRecord[];
  testimonials: TestimonialRecord[];
  orders: OrderRecord[];
  customers: CustomerRecord[];
  partnerships: PartnershipRecord[];
  contacts: ContactRecord[];
  adminCredential: AdminCredential | null;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'taniberas-db.json');

const HERO_IMG = '/src/assets/images/hero_taniberas_paddy_1795527040882.jpg';
const PANDAN_IMG = '/src/assets/images/product_pandan_wangi_1795527041071.jpg';
const MENTIK_IMG = '/src/assets/images/product_mentik_susu_1795527040974.jpg';
const MERAH_IMG = '/src/assets/images/product_beras_merah_1795527040443.jpg';
const FARMERS_IMG = '/src/assets/images/about_indonesian_farmers_1795527040756.jpg';
const VARIETIES_IMG = '/src/assets/images/article_rice_quality_1795527040679.jpg';

function createInitialData(): TaniberasStoreData {
  const categories: RiceCategory[] = [
    {
      id: 'cat-1',
      slug: 'beras-putih',
      name: 'Beras Putih Aromatik',
      description: 'Varietas lokal unggulan beraroma alami dengan tekstur pulen untuk sajian keluarga.',
    },
    {
      id: 'cat-2',
      slug: 'beras-organik',
      name: 'Beras Organik',
      description: 'Dibudidayakan tanpa pestisida sintetis dengan pemupukan kompos alami terverifikasi.',
    },
    {
      id: 'cat-3',
      slug: 'beras-merah-hitam',
      name: 'Beras Merah & Hitam',
      description: 'Kaya serat, antioksidan antosianin, dan rendah indeks glikemik untuk gaya hidup sehat.',
    },
    {
      id: 'cat-4',
      slug: 'beras-ketan',
      name: 'Beras Ketan Nusantara',
      description: 'Ketan pilihan berbutir utuh untuk olahan kuliner tradisional dan industri kue.',
    },
    {
      id: 'cat-5',
      slug: 'paket-hemat',
      name: 'Paket Keluarga & Horeka',
      description: 'Kemasan besar dan bundel hemat bagi rumah tangga, restoran, maupun katering.',
    },
  ];

  const products: RiceProduct[] = [
    {
      id: 'prod-pandan-wangi',
      slug: 'pandan-wangi-cianjur-asli',
      name: 'Pandan Wangi Cianjur Asli',
      variety: 'Pandan Wangi (Sintanur Lokal)',
      categorySlug: 'beras-putih',
      origin: 'Warungkondang, Cianjur, Jawa Barat',
      farmerGroup: 'Gapoktan Mekar Tani Cianjur',
      shortDescription:
        'Beras pulen beraroma daun pandan alami khas Cianjur, digiling segar tanpa pemutih atau pewangi buatan.',
      description:
        'Dipanen dari sawah irigasi pegunungan Warungkondang pada ketinggian 450 mdpl. Gabah dikeringkan perlahan dengan penjemuran lantai bersih hingga kadar air stabil 13%, lalu digiling maksimal 48 jam sebelum pengiriman agar aroma pandan alaminya tetap utuh hingga ke penanak nasi Anda.',
      texture: 'Sangat Pulen & Lembut',
      aroma: 'Pandan Alami',
      moistureContent: '13,2%',
      brokenGrainMax: 'Maks. 5% (Kepala)',
      harvestBatch: 'Panen November 2026',
      images: [PANDAN_IMG, VARIETIES_IMG, FARMERS_IMG],
      variants: [
        { id: 'pw-2', weightKg: 2, label: '2 kg', price: 42000, stock: 64 },
        { id: 'pw-5', weightKg: 5, label: '5 kg', price: 98000, stock: 120 },
        { id: 'pw-10', weightKg: 10, label: '10 kg', price: 189000, stock: 45 },
        { id: 'pw-25', weightKg: 25, label: '25 kg', price: 455000, stock: 18 },
      ],
      isFeatured: true,
      popularity: 98,
      createdAt: '2026-11-01T08:00:00.000Z',
    },
    {
      id: 'prod-mentik-susu',
      slug: 'mentik-susu-organik-magelang',
      name: 'Mentik Susu Organik Magelang',
      variety: 'Mentik Susu Putih',
      categorySlug: 'beras-organik',
      origin: 'Sawangan, Magelang, Jawa Tengah',
      farmerGroup: 'Paguyuban Tani Merapi Lestari',
      shortDescription:
        'Bulir pendek putih susu yang ekstra pulen dan manis alami, dibudidayakan secara organik di lereng Merapi.',
      description:
        'Mentik Susu merupakan varietas pusaka Jawa Tengah yang ditanam menggunakan pengairan mata air vulkanik lereng Merapi dan pupuk hayati lokal. Menghasilkan nasi yang pulen lengket menyerupai beras Jepang namun bercita rasa manis gurih khas Nusantara—sangat disukai anak-anak dan lansia.',
      texture: 'Ekstra Pulen & Mengkilap',
      aroma: 'Harum Susu Alami',
      moistureContent: '13,0%',
      brokenGrainMax: 'Maks. 4%',
      harvestBatch: 'Panen November 2026',
      images: [MENTIK_IMG, PANDAN_IMG, FARMERS_IMG],
      variants: [
        { id: 'ms-2', weightKg: 2, label: '2 kg', price: 46000, stock: 52 },
        { id: 'ms-5', weightKg: 5, label: '5 kg', price: 108000, stock: 85 },
        { id: 'ms-10', weightKg: 10, label: '10 kg', price: 205000, stock: 34 },
      ],
      isFeatured: true,
      popularity: 94,
      createdAt: '2026-11-02T08:00:00.000Z',
    },
    {
      id: 'prod-beras-merah',
      slug: 'beras-merah-organik-banyuwangi',
      name: 'Beras Merah Organik Banyuwangi',
      variety: 'Inpari 24 / Merah Lokal',
      categorySlug: 'beras-merah-hitam',
      origin: 'Glenmore, Banyuwangi, Jawa Timur',
      farmerGroup: 'Komunitas Tani Mandiri Alas Purwo',
      shortDescription:
        'Beras merah pecah kulit kaya serat pangan dan rendah indeks glikemik, cocok untuk program diet sehat keluarga.',
      description:
        'Digiling dengan metode pecah kulit satu kali proses (single-pass hulling) agar lapisan kulit ari merah yang kaya vitamin B1, zat besi, dan serat tetap terjaga. Teksturnya lebih empuk dibandingkan beras merah konvensional bila direndam 20 menit sebelum dimasak.',
      texture: 'Empuk Berserat',
      aroma: 'Alami Segar Sekam',
      moistureContent: '12,8%',
      brokenGrainMax: 'Maks. 5%',
      harvestBatch: 'Panen Oktober 2026',
      images: [MERAH_IMG, VARIETIES_IMG, HERO_IMG],
      variants: [
        { id: 'bm-1', weightKg: 1, label: '1 kg', price: 26000, stock: 95 },
        { id: 'bm-2', weightKg: 2, label: '2 kg', price: 49000, stock: 70 },
        { id: 'bm-5', weightKg: 5, label: '5 kg', price: 115000, stock: 40 },
      ],
      isFeatured: true,
      popularity: 91,
      createdAt: '2026-11-03T08:00:00.000Z',
    },
    {
      id: 'prod-rojolele-delanggu',
      slug: 'rojolele-delanggu-super',
      name: 'Rojolele Delanggu Super',
      variety: 'Rojolele Srinuk',
      categorySlug: 'beras-putih',
      origin: 'Delanggu, Klaten, Jawa Tengah',
      farmerGroup: 'Koperasi Tani Maju Delanggu',
      shortDescription:
        'Legenda beras pulen gurih dari lumbung Klaten dengan butir bersih mengkilap, ideal untuk sajian harian.',
      description:
        'Beras Rojolele Srinuk asli Delanggu dibudidayakan pada tanah subur aluvial Klaten. Dikenal sejak lama sebagai beras pilihan hidangan rumahan hingga jamuan restoran karena nasinya tidak cepat mengeras meski sudah dingin.',
      texture: 'Pulen Gurih Klasik',
      aroma: 'Harum Sedang Alami',
      moistureContent: '13,5%',
      brokenGrainMax: 'Maks. 5%',
      harvestBatch: 'Panen November 2026',
      images: [PANDAN_IMG, MENTIK_IMG, FARMERS_IMG],
      variants: [
        { id: 'rj-5', weightKg: 5, label: '5 kg', price: 92000, stock: 76 },
        { id: 'rj-10', weightKg: 10, label: '10 kg', price: 178000, stock: 48 },
        { id: 'rj-25', weightKg: 25, label: '25 kg', price: 430000, stock: 22 },
      ],
      isFeatured: false,
      popularity: 88,
      createdAt: '2026-11-04T08:00:00.000Z',
    },
    {
      id: 'prod-beras-hitam',
      slug: 'beras-hitam-cempo-ireng-sleman',
      name: 'Beras Hitam Cempo Ireng',
      variety: 'Cempo Ireng (Heirloom)',
      categorySlug: 'beras-merah-hitam',
      origin: 'Pakem, Sleman, DI Yogyakarta',
      farmerGroup: 'Kelompok Tani Sembada Organik',
      shortDescription:
        'Beras hitam purba kaya antioksidan antosianin dengan cita rasa gurih legit, ditanam organik di kaki Merapi.',
      description:
        'Varietas lokal langka berumur panen lebih panjang (140 hari) yang menyimpan konsentrasi pigmen antosianin alami berwarna ungu kehitaman pekat. Dapat dimasak tunggal maupun dicampur 1:3 dengan beras putih untuk nutrisi harian sekeluarga.',
      texture: 'Sedikit Kenyal & Legit',
      aroma: 'Khas Kacang Panggang',
      moistureContent: '12,6%',
      brokenGrainMax: 'Maks. 3%',
      harvestBatch: 'Panen Oktober 2026',
      images: [VARIETIES_IMG, MERAH_IMG, FARMERS_IMG],
      variants: [
        { id: 'bh-1', weightKg: 1, label: '1 kg', price: 32000, stock: 44 },
        { id: 'bh-2', weightKg: 2, label: '2 kg', price: 60000, stock: 31 },
        { id: 'bh-5', weightKg: 5, label: '5 kg', price: 142000, stock: 12 },
      ],
      isFeatured: false,
      popularity: 85,
      createdAt: '2026-11-05T08:00:00.000Z',
    },
    {
      id: 'prod-setra-ramos',
      slug: 'setra-ramos-karawang-premium',
      name: 'Setra Ramos IR64 Karawang',
      variety: 'IR64 Setra Ramos',
      categorySlug: 'paket-hemat',
      origin: 'Rengasdengklok, Karawang, Jawa Barat',
      farmerGroup: 'Gapoktan Lumbung Padi Karawang',
      shortDescription:
        'Beras putih bersih ekonomis dengan kepulenan seimbang, tidak mudah basi, andalan dapur rumah dan usaha kuliner.',
      description:
        'Beras Setra Ramos pilihan dari sentra lumbung padi Karawang. Diproses dengan penyortiran optik modern (color sorter) sehingga bebas gabah, bebas batu, dan sangat bersih sebelum dimasak.',
      texture: 'Pulen Sedang Seimbang',
      aroma: 'Netral Bersih',
      moistureContent: '13,5%',
      brokenGrainMax: 'Maks. 8%',
      harvestBatch: 'Panen November 2026',
      images: [MENTIK_IMG, PANDAN_IMG, HERO_IMG],
      variants: [
        { id: 'sr-5', weightKg: 5, label: '5 kg', price: 78000, stock: 140 },
        { id: 'sr-10', weightKg: 10, label: '10 kg', price: 152000, stock: 80 },
        { id: 'sr-25', weightKg: 25, label: '25 kg', price: 368000, stock: 36 },
      ],
      isFeatured: false,
      popularity: 92,
      createdAt: '2026-11-06T08:00:00.000Z',
    },
    {
      id: 'prod-sokan-solok',
      slug: 'beras-sokan-solok-minang',
      name: 'Sokan Solok Sumatera Barat',
      variety: 'Anak Daro / Sokan',
      categorySlug: 'beras-putih',
      origin: 'Kubung, Kab. Solok, Sumatera Barat',
      farmerGroup: 'Kelompok Tani Bareh Solok',
      shortDescription:
        'Beras pera-lembut berbutir ramping khas Ranah Minang, sempurna untuk rendang, gulai, dan nasi goreng.',
      description:
        'Bareh Solok varietas Sokan tumbuh di dataran tinggi lembah Bukit Barisan dengan pengairan sungai jernih. Karakteristiknya yang tidak lembek dan tidak lengket membuat setiap butir nasi terpisah sempurna saat dipadukan dengan kuah berbumbu kaya.',
      texture: 'Pera Lembut & Berbutir',
      aroma: 'Harum Alami Pegunungan',
      moistureContent: '13,1%',
      brokenGrainMax: 'Maks. 5%',
      harvestBatch: 'Panen November 2026',
      images: [PANDAN_IMG, VARIETIES_IMG, HERO_IMG],
      variants: [
        { id: 'ss-5', weightKg: 5, label: '5 kg', price: 95000, stock: 54 },
        { id: 'ss-10', weightKg: 10, label: '10 kg', price: 184000, stock: 28 },
      ],
      isFeatured: false,
      popularity: 82,
      createdAt: '2026-11-07T08:00:00.000Z',
    },
    {
      id: 'prod-ketan-subang',
      slug: 'ketan-putih-lusi-subang',
      name: 'Ketan Putih Lusi Subang',
      variety: 'Ketan Putih Lokal',
      categorySlug: 'beras-ketan',
      origin: 'Pagaden, Subang, Jawa Barat',
      farmerGroup: 'Mitra Tani Subang Jaya',
      shortDescription:
        'Beras ketan putih kapur berbutir utuh dengan daya rekat tinggi dan aroma sedap untuk lemper, wajik, hingga bubur.',
      description:
        'Ditanam khusus oleh petani mitra Subang untuk menjaga kemurnian varietas tanpa campuran beras biasa. Menghasilkan ketan yang lembut, kenyal, dan mengkilap sempurna untuk keperluan rumah tangga maupun produksi kue tradisional.',
      texture: 'Sangat Lengket & Kenyal',
      aroma: 'Khas Ketan Segar',
      moistureContent: '13,0%',
      brokenGrainMax: 'Maks. 4%',
      harvestBatch: 'Panen Oktober 2026',
      images: [MENTIK_IMG, VARIETIES_IMG, FARMERS_IMG],
      variants: [
        { id: 'kt-2', weightKg: 2, label: '2 kg', price: 39000, stock: 48 },
        { id: 'kt-5', weightKg: 5, label: '5 kg', price: 92000, stock: 30 },
      ],
      isFeatured: false,
      popularity: 79,
      createdAt: '2026-11-08T08:00:00.000Z',
    },
  ];

  const articles: ArticleRecord[] = [
    {
      id: 'art-1',
      slug: 'cara-membedakan-pandan-wangi-asli',
      title: 'Cara Membedakan Beras Pandan Wangi Asli dan Beras Berpewangi Sintetis',
      category: 'Edukasi Kualitas',
      author: 'Dr. Hendra Wijaya — Kepala Uji Mutu Taniberas',
      readTime: '5 menit baca',
      publishedAt: '18 November 2026',
      coverImage: PANDAN_IMG,
      excerpt:
        'Mengenal ciri fisik bulir bulat khas varietas Pandan Wangi Cianjur dan cara mendeteksi aroma alami versus semprotan pewangi buatan.',
      content: [
        'Banyak konsumen mengira semua beras yang harum daun pandan berasal dari varietas Pandan Wangi asli. Padahal, di pasar konvensional kerap ditemukan beras biasa bertipe butir panjang yang disemprot cairan perisa buatan agar menyerupai beras premium.',
        'Ciri paling mudah dikenali terletak pada bentuk fisik bulirnya. Pandan Wangi asli asal Cianjur memiliki bentuk butir agak bulat dan pendek (tidak lonjong ramping), dengan bagian tengah sedikit berwarna putih susu atau kapur tipis.',
        'Kedua, perhatikan daya tahan aromanya. Pewangi sintetis cenderung berbau sangat menyengat ketika kantong baru dibuka, lalu menguap dan hilang total setelah beras dicuci dua kali. Sebaliknya, aroma alami Pandan Wangi terasa lembut ketika mentah dan justru menguat hangat saat nasi mulai mendidih di penanak nasi.',
        'Di TANIBERAS, setiap karung gabah dari Gapoktan Cianjur diuji keaslian varietas serta keseragaman kadar air sebelum masuk lini penggilingan.',
      ],
    },
    {
      id: 'art-2',
      slug: 'giling-segar-48-jam-menjaga-pulen',
      title: 'Mengapa Menggiling Gabah Mendekati Waktu Kirim Menjaga Rasa Pulen Alami',
      category: 'Pertanian & Pascapanen',
      author: 'Siti Rahmawati — Manajer Pascapanen Taniberas',
      readTime: '4 menit baca',
      publishedAt: '12 November 2026',
      coverImage: FARMERS_IMG,
      excerpt:
        'Beras yang disimpan terlalu lama setelah digiling mengalami oksidasi lemak permukaan. Model giling-segar menjaga nasi tetap wangi dan empuk.',
      content: [
        'Sebagian besar beras di ritel modern telah digiling 3 hingga 6 bulan sebelum sampai ke dapur konsumen. Selama masa simpan panjang tersebut, lapisan minyak alami pada permukaan beras teroksidasi sehingga memunculkan bau apek dan tekstur nasi yang keras.',
        'Petani sebenarnya menyimpan cadangan pangan dalam bentuk gabah kering giling (GKG), bukan beras kupas. Kulit sekam berfungsi sebagai segel pelindung alami yang menjaga kesegaran endosperma hingga lebih dari satu tahun.',
        'Dengan menerapkan prinsip giling sesuai permintaan (milled-to-order) maksimal 48 jam sebelum dikirim, TANIBERAS memastikan konsumen mendapatkan kesegaran panen yang sama seperti menikmati nasi langsung di lumbung desa.',
      ],
    },
    {
      id: 'art-3',
      slug: 'panduan-beras-rendah-glikemik-keluarga',
      title: 'Panduan Memilih Beras Rendah Indeks Glikemik untuk Menu Harian Keluarga',
      category: 'Tips Memilih Beras',
      author: 'Nadia Kusuma, S.Gz — Konsultan Nutrisi Pangan',
      readTime: '6 menit baca',
      publishedAt: '5 November 2026',
      coverImage: VARIETIES_IMG,
      excerpt:
        'Perbandingan kadar serat, antosianin, serta teknik pencampuran beras merah dan hitam agar tetap nikmat disantap seluruh anggota keluarga.',
      content: [
        'Menjaga kestabilan gula darah bukan berarti harus berhenti mengonsumsi nasi. Kuncinya adalah memilih varietas dengan proses penyosohan minimal atau kadar amilosa yang tepat sehingga pelepasan glukosa berlangsung bertahap.',
        'Beras Merah Organik Banyuwangi dan Beras Hitam Cempo Ireng masih mempertahankan lapisan kulit ari (bekatul alami) yang kaya serat larut, magnesium, dan antioksidan polifenol.',
        'Bagi keluarga yang baru beralih dari beras putih, Anda dapat memulai dengan mencampur 1 bagian beras merah atau beras hitam dengan 2 bagian beras putih Mentik Susu atau Pandan Wangi, lalu merendamnya 20 menit sebelum dimasak untuk hasil nasi yang tetap pulen namun jauh lebih bernutrisi.',
      ],
    },
    {
      id: 'art-4',
      slug: 'memotong-rantai-tengkulak-jawa-barat',
      title: 'Kemitraan Adil: Bagaimana Taniberas Menjaga Harga Gabah Petani Tetap Layak',
      category: 'Kabar Petani',
      author: 'Tim Lapangan TANIBERAS',
      readTime: '5 menit baca',
      publishedAt: '28 Oktober 2026',
      coverImage: HERO_IMG,
      excerpt:
        'Menghubungkan kelompok tani langsung dengan konsumen kota memberi kepastian serapan panen serta meningkatkan pendapatan bersih petani hingga 24%.',
      content: [
        'Dalam rantai distribusi beras tradisional, hasil panen petani sering berpindah hingga lima lapis perantara sebelum tiba di meja makan. Akibatnya, harga jual konsumen melambung sementara margin petani tetap tertekan saat panen raya.',
        'Melalui skema kontrak serap langsung bersama Gapoktan di Cianjur, Karawang, Klaten, dan Magelang, TANIBERAS membeli gabah kering di atas rata-rata harga pasar lokal disertai pendampingan pengeringan dan seleksi benih.',
        'Transparansi ini tidak hanya menyejahterakan petani penggarap, tetapi juga menjamin ketertelusuran asal-usul setiap kemasan beras yang diterima keluarga Indonesia.',
      ],
    },
  ];

  const testimonials: TestimonialRecord[] = [
    {
      id: 'test-1',
      name: 'Ibu Ratna Dewi Pratiwi',
      role: 'Ibu Rumah Tangga',
      location: 'Kebayoran Baru, Jakarta Selatan',
      quote:
        'Sebelumnya sering kecewa beli beras kemasan yang cepat kering dan baunya apek. Sejak langganan Pandan Wangi Cianjur di TANIBERAS, nasinya harum alami dan anak-anak selalu nambah makan.',
      ricePurchased: 'Pandan Wangi Cianjur 10 kg',
    },
    {
      id: 'test-2',
      name: 'Chef Bagus Santoso',
      role: 'Pemilik & Kepala Dapur',
      location: 'Warung Sunda Rasa, Bandung',
      quote:
        'Konsistensi kualitas beras sangat krusial untuk restoran kami. Pengiriman rutin 25 kg dari TANIBERAS selalu seragam tingkat kepulenannya dan datang tepat waktu dalam kondisi baru giling.',
      ricePurchased: 'Rojolele Delanggu 25 kg',
    },
    {
      id: 'test-3',
      name: 'dr. Aditya Pratama',
      role: 'Dokter Umum & Pegiat Gizi',
      location: 'Sleman, Yogyakarta',
      quote:
        'Saya merekomendasikan Beras Merah Organik Banyuwangi dari TANIBERAS kepada pasien yang menjaga gula darah. Teksturnya lebih empuk dibanding merek lain dan asal petaninya jelas tercantum.',
      ricePurchased: 'Beras Merah Organik 5 kg',
    },
  ];

  const orders: OrderRecord[] = [
    {
      id: 'ord-1001',
      orderNumber: 'TB-261101',
      customerName: 'Ratna Dewi Pratiwi',
      customerPhone: '081288901122',
      customerEmail: 'ratna.pratiwi@contoh.id',
      city: 'Jakarta Selatan',
      address: 'Jl. Wijaya IX No. 14, Kebayoran Baru',
      paymentMethod: 'Transfer Bank',
      channel: 'website',
      status: 'Selesai',
      notes: 'Mohon dikirim pagi hari',
      items: [
        {
          productId: 'prod-pandan-wangi',
          productName: 'Pandan Wangi Cianjur Asli',
          variety: 'Pandan Wangi (Sintanur Lokal)',
          variantId: 'pw-10',
          weightLabel: '10 kg',
          quantity: 1,
          unitPrice: 189000,
          subtotal: 189000,
        },
      ],
      shippingCost: 0,
      totalAmount: 189000,
      createdAt: '2026-11-20T09:15:00.000Z',
    },
    {
      id: 'ord-1002',
      orderNumber: 'TB-261102',
      customerName: 'Bagus Santoso',
      customerPhone: '081322450987',
      customerEmail: 'dapur@warungsundarasa.id',
      city: 'Bandung',
      address: 'Jl. Cimanuk No. 28, Bandung Wetan',
      paymentMethod: 'Transfer Bank',
      channel: 'whatsapp',
      status: 'Dikirim',
      notes: 'Langganan mingguan restoran',
      items: [
        {
          productId: 'prod-rojolele-delanggu',
          productName: 'Rojolele Delanggu Super',
          variety: 'Rojolele Srinuk',
          variantId: 'rj-25',
          weightLabel: '25 kg',
          quantity: 2,
          unitPrice: 430000,
          subtotal: 860000,
        },
      ],
      shippingCost: 0,
      totalAmount: 860000,
      createdAt: '2026-11-22T14:30:00.000Z',
    },
    {
      id: 'ord-1003',
      orderNumber: 'TB-261103',
      customerName: 'Aditya Pratama',
      customerPhone: '081567891234',
      customerEmail: 'aditya.pratama@kliniksehat.id',
      city: 'Sleman',
      address: 'Jl. Kaliurang KM 7, Depok, Sleman',
      paymentMethod: 'COD',
      channel: 'website',
      status: 'Diproses',
      notes: 'Kemasan aman anti basah',
      items: [
        {
          productId: 'prod-beras-merah',
          productName: 'Beras Merah Organik Banyuwangi',
          variety: 'Inpari 24 / Merah Lokal',
          variantId: 'bm-5',
          weightLabel: '5 kg',
          quantity: 1,
          unitPrice: 115000,
          subtotal: 115000,
        },
        {
          productId: 'prod-beras-hitam',
          productName: 'Beras Hitam Cempo Ireng',
          variety: 'Cempo Ireng (Heirloom)',
          variantId: 'bh-2',
          weightLabel: '2 kg',
          quantity: 1,
          unitPrice: 60000,
          subtotal: 60000,
        },
      ],
      shippingCost: 15000,
      totalAmount: 190000,
      createdAt: '2026-11-23T11:20:00.000Z',
    },
  ];

  const customers: CustomerRecord[] = [
    {
      id: 'cust-1',
      name: 'Ratna Dewi Pratiwi',
      phone: '081288901122',
      email: 'ratna.pratiwi@contoh.id',
      city: 'Jakarta Selatan',
      address: 'Jl. Wijaya IX No. 14, Kebayoran Baru',
      segment: 'Rumah Tangga',
      totalOrders: 4,
      totalSpent: 756000,
      lastOrderAt: '2026-11-20T09:15:00.000Z',
    },
    {
      id: 'cust-2',
      name: 'Bagus Santoso',
      phone: '081322450987',
      email: 'dapur@warungsundarasa.id',
      city: 'Bandung',
      address: 'Jl. Cimanuk No. 28, Bandung Wetan',
      segment: 'Horeka',
      totalOrders: 6,
      totalSpent: 5160000,
      lastOrderAt: '2026-11-22T14:30:00.000Z',
    },
    {
      id: 'cust-3',
      name: 'Aditya Pratama',
      phone: '081567891234',
      email: 'aditya.pratama@kliniksehat.id',
      city: 'Sleman',
      address: 'Jl. Kaliurang KM 7, Depok, Sleman',
      segment: 'Rumah Tangga',
      totalOrders: 2,
      totalSpent: 355000,
      lastOrderAt: '2026-11-23T11:20:00.000Z',
    },
  ];

  const partnerships: PartnershipRecord[] = [
    {
      id: 'part-1',
      fullName: 'H. Deden Suryana',
      organizationName: 'Gapoktan Harapan Jaya',
      partnerType: 'Kelompok Tani',
      phone: '085211009988',
      email: 'deden.gapoktan@contoh.id',
      region: 'Cianjur Selatan, Jawa Barat',
      estimatedCapacity: '12 ton gabah kering panen / bulan',
      message: 'Kami membina 45 petani Pandan Wangi dan siap menyuplai panen rutin setiap bulan.',
      status: 'Disetujui',
      createdAt: '2026-11-15T10:00:00.000Z',
    },
    {
      id: 'part-2',
      fullName: 'Rina Kusumawati',
      organizationName: 'Toko Sembako Berkah Mandiri',
      partnerType: 'Reseller',
      phone: '081900223344',
      email: 'rina.berkah@contoh.id',
      region: 'Bekasi Timur, Jawa Barat',
      estimatedCapacity: '600 kg / bulan',
      message: 'Tertarik memasarkan kemasan 2 kg dan 5 kg untuk komplek perumahan di Bekasi.',
      status: 'Ditinjau',
      createdAt: '2026-11-21T16:40:00.000Z',
    },
  ];

  const contacts: ContactRecord[] = [
    {
      id: 'cnt-1',
      name: 'Budi Hartono',
      email: 'budi.hartono@contoh.id',
      phone: '081299008811',
      subject: 'Penawaran Pasokan Katering Karyawan',
      message: 'Apakah tersedia kontrak pasokan bulanan untuk kebutuhan 300 kg beras Setra Ramos per bulan?',
      status: 'Baru',
      createdAt: '2026-11-23T08:45:00.000Z',
    },
  ];

  return {
    categories,
    products,
    articles,
    testimonials,
    orders,
    customers,
    partnerships,
    contacts,
    adminCredential: null,
  };
}

let cachedStore: TaniberasStoreData | null = null;

export function getStore(): TaniberasStoreData {
  if (cachedStore) {
    return cachedStore;
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as TaniberasStoreData;
      cachedStore = parsed;
      return cachedStore;
    } catch (err) {
      console.error('Gagal membaca store, memuat ulang seed data:', err);
    }
  }
  const initial = createInitialData();
  cachedStore = initial;
  saveStore(initial);
  return cachedStore;
}

export function saveStore(data: TaniberasStoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  cachedStore = data;
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DATA_FILE);
}

export function hashPassword(password: string, salt?: string): AdminCredential {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return {
    salt: actualSalt,
    hash: derived,
    claimedAt: new Date().toISOString(),
  };
}

export function verifyPassword(password: string, credential: AdminCredential): boolean {
  const candidate = crypto.scryptSync(password, credential.salt, 64);
  const expected = Buffer.from(credential.hash, 'hex');
  if (candidate.length !== expected.length) {
    return false;
  }
  return crypto.timingSafeEqual(candidate, expected);
}
