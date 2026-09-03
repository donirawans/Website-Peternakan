import { getCattleImageUrl, FALLBACK_CATTLE_IMAGE } from '../utils/imageUrl';

const CattleCard = ({ cattle, onDetailClick, onScrollToKatalog, farmSettings }) => {
  const isBooked = cattle.status === 'Booked';
  const isTerjual = cattle.status === 'Terjual';

  const handleCariSapiLain = () => {
    if (onScrollToKatalog) {
      onScrollToKatalog();
    } else {
      document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChatWA = () => {
    const whatsappNumber = farmSettings?.whatsapp_number || '6281234567890';
    const message = isBooked
      ? `Halo Admin Kandas, saya lihat sapi ${cattle.name} (ID: ${cattle.id}) statusnya sudah di-booking. Apakah ada rekomendasi sapi serupa lainnya yang masih tersedia?`
      : `Halo, saya tertarik dengan sapi ${cattle.name} (ID: ${cattle.id}). Bisakah saya mendapatkan informasi lebih lanjut?`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-surface rounded-xl border border-outline-variant/30 ambient-shadow flex flex-col overflow-hidden transition-all duration-300 cursor-pointer group">
      {/* Card Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={getCattleImageUrl(
            cattle.media_urls?.length
              ? cattle.media_urls
              : cattle.image || cattle.photo_url
          )}
          alt={cattle.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_CATTLE_IMAGE;
          }}
        />
        {/* Status Badge */}
        <div
          className={`absolute top-4 right-4 font-label-sm text-label-sm font-bold px-3 py-1 rounded-full shadow-sm ${
            isBooked
              ? 'bg-[#FFB703] text-[#422006]'
              : isTerjual
              ? 'bg-outline/80 text-surface'
              : 'bg-secondary-container text-on-secondary-container'
          }`}
        >
          {cattle.status}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline-md text-headline-md text-on-surface">{cattle.name}</h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded">
            ID: {cattle.id}
          </span>
        </div>

        {/* Data Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
            {cattle.gender || cattle.kelamin || 'Jantan'}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
            {cattle.weight || cattle.bobot} Kg
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
            {cattle.age || cattle.age_phase || cattle.fase || cattle.category || 'Dewasa'}
          </span>
        </div>

        {/* Price & Actions */}
        <div className="mt-auto pt-4 border-t border-outline-variant/20 flex flex-col gap-4">
          <div className="flex items-baseline gap-1 text-slate-900">
            <span className="text-xs font-bold text-slate-500">Rp</span>
            <span className="text-xl font-extrabold tracking-tight">
              {Number(cattle.price || cattle.harga || 0).toLocaleString('id-ID')}
            </span>
          </div>

          {isBooked ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCariSapiLain}
                className="bg-secondary text-on-secondary font-label-md text-label-md py-2.5 rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                Cari Sapi Lain
              </button>
              <button
                onClick={() => onDetailClick(cattle)}
                className="bg-surface-container text-on-surface font-label-md text-label-md py-2.5 rounded-full hover:bg-surface-variant transition-all border border-outline-variant/30 flex items-center justify-center"
              >
                Detail
              </button>
            </div>
          ) : isTerjual ? (
            <button className="w-full bg-surface-container text-on-surface font-label-md text-label-md py-2.5 rounded-full hover:bg-surface-variant transition-all border border-outline-variant/30 flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">block</span>
              Terjual
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleChatWA}
                className="bg-secondary text-on-secondary font-label-md text-label-md py-2.5 rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                Chat WA
              </button>
              <button
                onClick={() => onDetailClick(cattle)}
                className="bg-surface-container text-on-surface font-label-md text-label-md py-2.5 rounded-full hover:bg-surface-variant transition-all border border-outline-variant/30 flex items-center justify-center"
              >
                Detail
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CattleCard;
