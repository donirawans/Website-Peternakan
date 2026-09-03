export const LANDING_STORAGE_KEY = 'kandas_landing_settings';

export const FEATURE_ICONS = [
  'grass',
  'monitor_heart',
  'handshake',
  'verified',
  'shield',
  'pets',
  'eco',
  'local_shipping',
  'storefront',
  'schedule',
  'location_on',
  'favorite',
  'support_agent',
  'groups',
  'check_circle',
  'spa',
];

export const DEFAULT_FEATURES = [
  {
    icon: 'grass',
    title: 'Pakan Rumput Hijauan Alami',
    desc: 'Sapi diberi makan rumput hijauan segar setiap hari, menjaga kesehatan dan kualitas daging secara alami.',
  },
  {
    icon: 'monitor_heart',
    title: 'Perawatan Telaten Harian',
    desc: 'Pemantauan kesehatan harian, vaksinasi rutin, dan penanganan profesional oleh tenaga terlatih.',
  },
  {
    icon: 'handshake',
    title: 'Bebas Survei ke Kandang',
    desc: 'Silaturahmi langsung, cek fisik sepuasnya, dan pantau kondisi makan sapi sebelum transaksi.',
  },
];

export const DEFAULT_LANDING_CONFIG = {
  // Hero Section
  heroBadge: 'Rawatan Asli Peternak Lokal',
  heroTitle: 'Dari Pedetan Sampai Sapi Qurban, Semua Ada di Sini',
  heroSubtitle:
    'Sedia bibit pedet lepas sapih, bakalan penggemukan, hingga sapi dewasa siap Qurban. Dirawat telaten dengan pakan hijauan segar harian—bebas survei dan cek kondisi fisik langsung di kandang.',

  // Section Tentang / Keunggulan
  aboutTitle: 'Kenapa Harus Pilih Sapi di Sini?',
  aboutSubtitle: 'Komitmen kami menghadirkan sapi sehat dan transaksi jujur langsung di tempat.',
  features: DEFAULT_FEATURES,

  // Section Lokasi & Kontak (teks judul/subjudul)
  locationTitle: 'Kunjungi Kandang Kami Kapan Saja',
  locationSubtitle:
    'Kami membuka pintu untuk Anda yang ingin melihat langsung kondisi fisik sapi, pola pakan hijauan, dan kebersihan kandang sebelum bertransaksi.',
};

// Gabungkan sumber: backend (farmSettings.landing) > localStorage > default
export const getLandingSettings = (backendLanding) => {
  let merged = { ...DEFAULT_LANDING_CONFIG };

  if (backendLanding && typeof backendLanding === 'object') {
    merged = mergeLanding(merged, backendLanding);
  } else {
    try {
      const saved = localStorage.getItem(LANDING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          merged = mergeLanding(merged, parsed);
        }
      }
    } catch (err) {
      console.error('Gagal memuat pengaturan landing:', err);
    }
  }

  return merged;
};

const mergeLanding = (base, override) => {
  const result = { ...base, ...override };
  if (Array.isArray(override.features)) {
    result.features = override.features.map((f) => ({
      icon: f.icon || 'grass',
      title: f.title || '',
      desc: f.desc || '',
    }));
  }
  return result;
};

export const saveLandingSettings = (settings) => {
  try {
    localStorage.setItem(LANDING_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Gagal menyimpan pengaturan landing:', err);
    return false;
  }
};
