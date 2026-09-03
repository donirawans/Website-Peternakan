import { useState, useEffect, useCallback } from 'react';
import TopNavBar from '../components/TopNavBar';
import Footer from '../components/Footer';
import CattleCard from '../components/CattleCard';
import CattleDetailModal from '../components/CattleDetailModal';
import { cattleAPI, farmSettingAPI } from '../services/api';
import { getCattleImageUrl, FALLBACK_CATTLE_IMAGE, resolveMediaUrl } from '../utils/imageUrl';
import { getLandingSettings, DEFAULT_FEATURES, DEFAULT_HERO_IMAGES } from '../utils/landingSettings';

const CATEGORIES = ['Semua Stok', 'Pedetan', 'Bakalan', 'Siap Qurban'];

const LandingPage = ({ cattleList = [] }) => {
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [activeTab, setActiveTab] = useState('Semua Stok');
  const [activeNav, setActiveNav] = useState('');
  const [displayCattle, setDisplayCattle] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [farmSettings, setFarmSettings] = useState({});
  const [landingConfig, setLandingConfig] = useState(getLandingSettings());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [soldOpen, setSoldOpen] = useState(false);
  const [showAllSold, setShowAllSold] = useState(false);

  const heroImages = [
    {
      url: resolveMediaUrl(landingConfig.hero_image_1 || farmSettings.hero_image_1) || DEFAULT_HERO_IMAGES[0],
      title: 'Sapi Dewasa Siap Qurban',
    },
    {
      url: resolveMediaUrl(landingConfig.hero_image_2 || farmSettings.hero_image_2) || DEFAULT_HERO_IMAGES[1],
      title: 'Pedetan & Bakalan Sehat',
    },
    {
      url: resolveMediaUrl(landingConfig.hero_image_3 || farmSettings.hero_image_3) || DEFAULT_HERO_IMAGES[2],
      title: 'Pakan Hijauan & Rawatan Telaten',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const loadFarmSettings = useCallback(async () => {
    try {
      const response = await farmSettingAPI.getPublic();
      if (response.status === 200 && response.data) {
        setFarmSettings(response.data);
        const landingData = response.data?.landing && typeof response.data.landing === 'object'
          ? {
              ...response.data.landing,
              hero_image_1: response.data.landing.hero_image_1 || response.data.hero_image_1 || '',
              hero_image_2: response.data.landing.hero_image_2 || response.data.hero_image_2 || '',
              hero_image_3: response.data.landing.hero_image_3 || response.data.hero_image_3 || '',
            }
          : {
              hero_image_1: response.data.hero_image_1 || '',
              hero_image_2: response.data.hero_image_2 || '',
              hero_image_3: response.data.hero_image_3 || '',
            };
        setLandingConfig(getLandingSettings(landingData));
      }
    } catch (error) {
      console.error('Failed to load farm settings:', error);
    }
  }, []);

  const loadCattleFromAPI = useCallback(async () => {
    try {
      setIsLoading(true);
      // Query database endpoint langsung
      const response = await cattleAPI.getAll({});
      
      if (response.status === 200 && response.data) {
        const mappedCattle = response.data.map((c) => {
          let mediaUrls = [];
          if (c.media_urls) {
            if (Array.isArray(c.media_urls)) {
              mediaUrls = c.media_urls;
            } else if (typeof c.media_urls === 'string') {
              try {
                mediaUrls = JSON.parse(c.media_urls);
              } catch {
                mediaUrls = c.media_urls.split(',').filter(Boolean);
              }
            }
          }
          
          const absoluteMediaUrls = mediaUrls.map(resolveMediaUrl).filter(Boolean);

          let images = [];
          if (Array.isArray(c.images) && c.images.length > 0) {
            images = c.images.map(resolveMediaUrl);
          } else {
            images = absoluteMediaUrls.filter((url) => !url.endsWith('.mp4') && !url.endsWith('.webm') && !url.includes('video'));
          }

          const videoUrl = c.video_url
            ? resolveMediaUrl(c.video_url)
            : absoluteMediaUrls.find((url) => url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video')) || null;

          const primaryImage = images[0] || absoluteMediaUrls[0] || resolveMediaUrl(c.foto) || resolveMediaUrl(c.photo_url) || FALLBACK_CATTLE_IMAGE;
          if (images.length === 0 && primaryImage) {
            images = [primaryImage];
          }
          
          return {
            id: c.ear_tag || `S-${c.id}`,
            db_id: c.id,
            ear_tag: c.ear_tag || `S-${c.id}`,
            name: c.name,
            breed: c.breed || 'Unknown',
            gender: c.gender || c.kelamin || 'Jantan',
            weight: c.weight || c.bobot || 0,
            age: c.age_phase || c.category || c.fase || 'Dewasa',
            price: c.price || c.harga || 0,
            harga: c.price || c.harga || 0,
            status: c.status || 'Tersedia',
            kondisi: c.kondisi || 'Kondisi Prima',
            category: c.age_phase || c.category || c.fase || 'Dewasa',
            age_phase: c.age_phase || c.fase || '',
            feed_pattern: c.feed_pattern || 'Rumput Hijauan',
            care_notes: c.care_notes || 'Tidak ada catatan',
            media_urls: absoluteMediaUrls,
            images: images,
            video_url: videoUrl,
            image: primaryImage,
            thumbnails: images.slice(1),
          };
        });
        setDisplayCattle(mappedCattle);
      } else {
        setDisplayCattle(cattleList);
      }
    } catch (error) {
      console.error('Failed to load cattle:', error);
      setDisplayCattle(cattleList);
    } finally {
      setIsLoading(false);
    }
  }, [cattleList]);

  useEffect(() => {
    loadCattleFromAPI();
    loadFarmSettings();
  }, [loadCattleFromAPI, loadFarmSettings]);

  const tabToCategoryMap = {
    'Semua Stok': '',
    'Pedetan': 'Pedet',
    'Bakalan': 'Bakalan',
    'Siap Qurban': 'Dewasa',
  };

  const activeCattles = displayCattle.filter((c) => c.status === 'Tersedia' || c.status === 'Booked');
  const soldCattles = displayCattle.filter((c) => c.status === 'Terjual');

  const filteredCattle = activeCattles.filter((c) => {
    const catFilter = tabToCategoryMap[activeTab];
    if (!catFilter) return true;
    const cat = String(c.category || c.age_phase || c.age || '').toLowerCase();
    const filterLower = catFilter.toLowerCase();
    if (filterLower === 'dewasa') {
      return cat.includes('dewasa') || cat.includes('qurban') || cat.includes('siap');
    }
    return cat.includes(filterLower);
  });

  const visibleCattle = showAll ? filteredCattle : filteredCattle.slice(0, 3);
  const visibleSoldCattles = soldOpen
    ? (showAllSold ? soldCattles : soldCattles.slice(0, 3))
    : [];

  const scrollToSection = (e, targetId, navKey) => {
    e.preventDefault();
    setActiveNav(navKey);
    const element = document.getElementById(targetId);
    if (element) {
      if (targetId === 'lokasi') {
        const navbarHeight = 80;
        const availableHeight = window.innerHeight - navbarHeight;
        const elementHeight = element.offsetHeight;
        const verticalMargin = Math.max((availableHeight - elementHeight) / 2, 20);
        const targetScrollY = element.getBoundingClientRect().top + window.pageYOffset - (navbarHeight + verticalMargin);

        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      } else {
        const navOffset = 75;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased selection:bg-primary/20 selection:text-primary">
      <TopNavBar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="flex-grow pt-[76px] sm:pt-[84px] overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-84px)] flex items-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* KOLOM KIRI: Teks & Aksi */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-5 sm:gap-6 z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#EBF1F9] border border-[#D9E3F0] text-slate-700 text-xs font-medium w-fit mb-3 sm:mb-4">
                  <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-slate-800 font-semibold tracking-wide text-xs">{landingConfig.heroBadge}</span>
                </div>

                <h1
                  className="font-display-lg text-3xl sm:text-4xl md:text-5xl lg:text-[56px] lg:leading-[64px] font-bold text-on-surface mb-3 sm:mb-4 tracking-tight"
                  style={{ color: 'rgb(15, 23, 42)' }}
                >
                  {landingConfig.heroTitle}
                </h1>

                <p className="font-body-lg text-sm sm:text-base md:text-lg text-on-surface-variant max-w-xl leading-relaxed">
                  {landingConfig.heroSubtitle}
                </p>
              </div>

              {/* Tombol CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-1">
                <a
                  href="#katalog"
                  onClick={(e) => scrollToSection(e, 'katalog', 'katalog')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm shadow-md transition-all active:scale-98"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Lihat Katalog Sapi
                </a>
                <a
                  href="#lokasi"
                  onClick={(e) => scrollToSection(e, 'lokasi', 'lokasi')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#EBF1F9] hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-all active:scale-98"
                >
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Kunjungi Kandang
                </a>
              </div>
            </div>

            {/* KOLOM KANAN: Slider Foto Showcase Kandang & Sapi */}
            <div className="lg:col-span-6 relative w-full h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm bg-slate-100 z-10 group mt-4 lg:mt-0">
              {heroImages.map((slide, idx) => (
                <img
                  key={idx}
                  src={slide.url}
                  alt="Dokumentasi Kandang Dastro"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none'
                  }`}
                  onError={(e) => {
                    if (DEFAULT_HERO_IMAGES[idx] && e.target.src !== DEFAULT_HERO_IMAGES[idx]) {
                      e.target.src = DEFAULT_HERO_IMAGES[idx];
                    }
                  }}
                />
              ))}

              {/* Titik Indikator Presisi di Tengah Bawah */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-md z-10">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Abstract background */}
          <div className="absolute top-0 right-0 -mr-[20%] -mt-[10%] w-[60%] h-[80%] bg-surface-container-low rounded-full blur-[100px] -z-10" />
        </section>

        {/* Cattle Catalog Grid (#katalog) */}
        <section id="katalog" className="scroll-mt-24 max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop pt-4 pb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4 sm:gap-6">
            <div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold mb-1">Katalog Stok Sapi</h2>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                Update stok terbaru langsung dari kandang kami.
              </p>
            </div>
            {/* Category Tabs (Scrollable on mobile) */}
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 bg-surface-container rounded-xl w-full sm:w-auto max-w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveTab(cat); setShowAll(false); }}
                  className={`px-3.5 sm:px-5 py-2 rounded-lg font-label-md text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeTab === cat
                      ? 'bg-surface text-[#2D6A4F] font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-variant/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {visibleCattle.map((cattle) => (
              <CattleCard
                key={cattle.id}
                cattle={cattle}
                onDetailClick={setSelectedCattle}
                farmSettings={farmSettings}
              />
            ))}
          </div>

           {filteredCattle.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
              <p className="font-headline-md text-headline-md font-bold">{isLoading ? 'Memuat data...' : 'Tidak ada sapi ditemukan'}</p>
              <p className="font-body-md text-body-md mt-2">Coba ubah filter pencarian Anda</p>
            </div>
          )}

          {filteredCattle.length > 3 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 text-[#2D6A4F] font-label-md text-label-md font-bold hover:text-emerald-800 px-6 py-3 rounded-full transition-colors"
              >
                {showAll ? 'Sembunyikan' : 'Lihat Semua Stok Sapi'}
                <svg className="w-4 h-4 text-inherit" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  {showAll
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />}
                </svg>
              </button>
            </div>
          )}

          {/* ── Seksi Khusus: Sapi Terjual ── */}
          {soldCattles.length > 0 && (
            <div className="mt-6 pt-8 border-t border-gray-100">
              <div className="text-center mb-8">
                <button
                  onClick={() => setSoldOpen(!soldOpen)}
                  className="inline-flex items-center gap-2 text-[#2D6A4F] font-label-md text-label-md font-bold hover:text-emerald-800 px-6 py-3 rounded-full transition-colors"
                >
                  Sapi Terjual
                  <svg className="w-4 h-4 text-inherit" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    {soldOpen
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />}
                  </svg>
                </button>
              </div>

              {/* Grid Kartu Sapi Terjual */}
              {soldOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleSoldCattles.map((cattle) => (
                  <div
                    key={cattle.id}
                    className="bg-gray-50/70 border border-gray-200/80 rounded-2xl overflow-hidden p-4 flex flex-col justify-between opacity-90 hover:opacity-100 transition-all shadow-sm"
                  >
                    <div>
                      {/* Foto dengan Watermark Stamp Terjual */}
                      <div className="relative h-52 w-full rounded-xl overflow-hidden bg-gray-200">
                        <img
                          src={getCattleImageUrl(cattle.media_urls)}
                          alt={cattle.name}
                          className="w-full h-full object-cover grayscale-[40%]"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_CATTLE_IMAGE;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-semibold tracking-wider px-4 py-1.5 rounded-full uppercase border border-white/20 shadow-md">
                            Telah Terjual
                          </span>
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-0.5 rounded-md font-mono">
                          ID: {cattle.code_id || cattle.id}
                        </span>
                      </div>

                      {/* Info Sapi */}
                      <div className="mt-4">
                        <h4 className="font-bold text-lg text-gray-800">{cattle.name}</h4>
                        <div className="flex flex-wrap gap-2 my-2.5">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                            {cattle.gender || cattle.kelamin || 'Jantan'}
                          </span>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                            {cattle.weight || cattle.bobot ? `${cattle.weight || cattle.bobot} Kg` : '-'}
                          </span>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                            {cattle.phase || cattle.age_phase || cattle.fase || cattle.category || 'Dewasa'}
                          </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-1 text-slate-900">
                          <span className="text-xs font-bold text-slate-500">Rp</span>
                          <span className="text-xl font-extrabold tracking-tight">
                            {Number(cattle.price || cattle.harga || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Aksi Riwayat */}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                      <button
                        onClick={() => setSelectedCattle(cattle)}
                        className="w-full py-2.5 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        Lihat Spesifikasi Sapi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {soldOpen && soldCattles.length > 3 && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setShowAllSold(!showAllSold)}
                    className="inline-flex items-center gap-2 text-[#2D6A4F] font-label-md text-label-md font-bold hover:text-emerald-800 px-6 py-3 rounded-full transition-colors"
                  >
                    {showAllSold ? 'Sembunyikan' : 'Lihat Semua Riwayat Terjual'}
                    <svg className="w-4 h-4 text-inherit" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      {showAllSold
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />}
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Trust Pillars (#tentang) */}
        <section className="w-full bg-white py-12 sm:py-20 md:py-24 scroll-mt-24" id="tentang">
          <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface font-bold mb-3 sm:mb-4">{landingConfig.aboutTitle}</h2>
              <p className="font-body-md text-sm sm:text-base text-on-surface-variant">
                {landingConfig.aboutSubtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {(landingConfig.features && landingConfig.features.length ? landingConfig.features : DEFAULT_FEATURES).map((pillar) => (
                <div key={pillar.icon + pillar.title} className="bg-surface p-6 sm:p-8 rounded-2xl border border-outline-variant/20 ambient-shadow text-center flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-2xl flex items-center justify-center mb-5 sm:mb-6">
                    <span className="material-symbols-outlined text-[28px] sm:text-[32px]">{pillar.icon}</span>
                  </div>
                  <h3 className="font-headline-md text-lg sm:text-xl text-on-surface font-bold mb-2 sm:mb-3">{pillar.title}</h3>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location Section (#lokasi) */}
        <section
          id="lokasi"
          className="w-full scroll-mt-20 min-h-[calc(100vh-80px)] flex items-center justify-center bg-white px-4 sm:px-6 md:px-margin-desktop py-8 sm:py-12"
        >
          <div className="w-full max-w-container-max">
          <div className="bg-surface rounded-2xl sm:rounded-3xl border border-outline-variant/30 ambient-shadow p-5 sm:p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#2D6A4F]/10 text-[#2D6A4F] px-4 py-1.5 rounded-full font-label-sm font-bold mb-4">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {farmSettings?.farm_name || 'Kandang Dastro Utama'}
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-4">
                  {landingConfig.locationTitle}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                  {landingConfig.locationSubtitle}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#2D6A4F] mt-1">pin_drop</span>
                    <div>
                      <p className="font-bold text-on-surface">Alamat Kandang</p>
                      <p className="text-body-md text-on-surface-variant">{farmSettings?.address || 'Jl. Peternakan Makmur No. 123, Desa Sukamaju, Kab. Agrikultura, Jawa Barat'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#2D6A4F] mt-1">schedule</span>
                    <div>
                      <p className="font-bold text-on-surface">Jam Survei Fisik</p>
                      <p className="text-body-md text-on-surface-variant">{farmSettings?.visiting_hours || 'Senin - Minggu (07:00 - 17:00 WIB)'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#2D6A4F] mt-1">directions_bus</span>
                    <div>
                      <p className="font-bold text-on-surface">Akses Kendaraan</p>
                      <p className="text-body-md text-on-surface-variant">{farmSettings?.truck_access_note || 'Dapat dilalui truk engkel & pick-up, area parkir luas'}</p>
                    </div>
                  </div>
                  {farmSettings?.whatsapp_number && (
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#2D6A4F] mt-1">chat</span>
                      <div>
                        <p className="font-bold text-on-surface">Kontak WhatsApp</p>
                        <a href={`https://wa.me/${farmSettings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="text-body-md text-primary hover:underline">{farmSettings.whatsapp_number}</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Box */}
              <div className="h-[320px] rounded-2xl overflow-hidden border border-outline-variant/30 relative shadow-inner bg-surface-container-low">
                {farmSettings?.google_maps_url ? (
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(farmSettings.address || 'Kandang Dastro')}&output=embed`}
                    className="w-full h-full border-0"
                    title="Lokasi Kandang"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl opacity-40">map</span>
                    <p className="text-sm opacity-50">Peta tidak tersedia</p>
                  </div>
                )}
                {farmSettings?.google_maps_url && (
                  <a
                    href={farmSettings.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-outline-variant/30 text-primary font-label-sm text-label-sm font-bold flex items-center gap-1 hover:bg-surface shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Detail Modal */}
      {selectedCattle && (
        <CattleDetailModal
          cattle={selectedCattle}
          onClose={() => setSelectedCattle(null)}
          farmSettings={farmSettings}
        />
      )}
    </div>
  );
};

export default LandingPage;
