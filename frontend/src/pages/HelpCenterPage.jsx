const HelpCenterPage = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-container-max mx-auto space-y-6 sm:space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <header className="mb-4 sm:mb-8">
        <h2 className="font-headline-lg text-xl sm:text-2xl md:text-headline-lg text-primary mb-1 sm:mb-2 font-bold">
          Pusat Bantuan &amp; Panduan Kandang
        </h2>
        <p className="font-body-lg text-xs sm:text-sm md:text-body-lg text-on-surface-variant max-w-3xl">
          Pedoman standar kelayakan sapi kurban, SOP alur inventaris, dan kontak teknis
        </p>
      </header>

      {/* Top Banner CTA */}
      <div className="bg-[#2D6A4F] text-white rounded-2xl p-5 sm:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 sm:gap-6 shadow-md relative overflow-hidden">
        <div className="z-10 relative">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            IT &amp; Technical Support
          </div>
          <h3 className="font-headline-md text-lg sm:text-xl md:text-headline-md font-bold mb-1.5 sm:mb-2">
            Kendala Sistem / Laporan Bug
          </h3>
          <p className="font-body-md text-xs sm:text-sm md:text-body-md opacity-90">
            Tim IT Support kami siap membantu Anda dari pukul 08:00 - 21:00 WIB.
          </p>
        </div>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="z-10 shrink-0 bg-white text-[#2D6A4F] font-label-md text-xs sm:text-sm font-bold py-3 px-5 sm:px-6 rounded-full flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all active:scale-98 shadow-sm hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">forum</span>
          Chat WhatsApp Tim Teknis
        </a>
        {/* Decorative circle */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-12">
        {/* Left Column: SOP Status */}
        <div className="lg:col-span-6 space-y-6">
          <h4 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2D6A4F]">rule</span>
            SOP Pengelolaan Status Sapi &amp; Transaksi
          </h4>
          <div className="space-y-4">
            {/* Tersedia */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 ambient-shadow hover:-translate-y-0.5 transition-transform duration-200">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm font-bold mb-2 inline-block border border-secondary/20">
                Tersedia
              </span>
              <p className="text-body-md text-on-surface leading-relaxed mt-1">
                Sapi ready di kandang dan tampil di katalog publik website. Pengunjung dapat melihat spesifikasi detail dan menghubungi WA untuk reservasi.
              </p>
            </div>

            {/* Booked */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 ambient-shadow hover:-translate-y-0.5 transition-transform duration-200 border-l-4 border-l-amber-500">
              <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-label-sm text-label-sm font-bold mb-2 inline-block border border-amber-300">
                Booked
              </span>
              <p className="text-body-md text-on-surface leading-relaxed mt-1">
                Sudah menerima DP transfer (min. 30%), sistem mengunci sapi agar tidak dibeli pihak lain. Pengunjung website diarahkan menanyakan jadwal ketersediaan.
              </p>
            </div>

            {/* Terjual */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 ambient-shadow hover:-translate-y-0.5 transition-transform duration-200">
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-label-sm text-label-sm font-bold mb-2 inline-block border border-slate-300">
                Terjual
              </span>
              <p className="text-body-md text-on-surface leading-relaxed mt-1">
                Pembayaran lunas 100%, sapi tetap dirawat dengan pola pakan sehat hingga siap dikirim atau diambil saat hari H Idul Adha.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Standar Fisik Kurban */}
        <div className="lg:col-span-6 space-y-6">
          <h4 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2D6A4F]">verified_user</span>
            Standar Fisik Sapi Kurban (Pemeriksaan Lapangan)
          </h4>
          <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-outline-variant/30 space-y-6 shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div>
                <strong className="block font-label-md text-on-surface text-base mb-1">
                  Kriteria Umur (Poel)
                </strong>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Minimal 2 tahun ditandai tanggalnya 1 pasang gigi seri depan (poel 1) atau masuk tahun ketiga.
                </p>
              </div>
            </div>

            <div className="border-t border-outline-variant/20" />

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
              </div>
              <div>
                <strong className="block font-label-md text-on-surface text-base mb-1">
                  Kriteria Bebas Cacat
                </strong>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Mata tidak buta, daun telinga utuh (tidak terpotong lebih dari sepertiga), ekor tidak buntung/putus, dan kaki tidak pincang parah.
                </p>
              </div>
            </div>

            <div className="border-t border-outline-variant/20" />

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
              </div>
              <div>
                <strong className="block font-label-md text-on-surface text-base mb-1">
                  Kondisi Sehat &amp; Bugar
                </strong>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  Nafsu makan aktif, bulu halus dan mengkilap bersih, hidung lembap, serta mampu berdiri tegak dan lincah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
