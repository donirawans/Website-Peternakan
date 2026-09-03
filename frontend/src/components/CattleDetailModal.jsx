import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatPrice } from '../data/cattleData';
import { visitRequestAPI } from '../services/api';
import { resolveMediaUrl, FALLBACK_CATTLE_IMAGE } from '../utils/imageUrl';

const safeParseMedia = (mediaUrls) => {
  if (!mediaUrls) return [];
  if (Array.isArray(mediaUrls)) return mediaUrls;
  if (typeof mediaUrls === 'string') {
    try { return JSON.parse(mediaUrls); } catch { return mediaUrls.split(',').filter(Boolean); }
  }
  return [];
};

const resolveUrl = (url) => {
  if (!url) return '';
  return resolveMediaUrl(url);
};

const isVideoUrl = (url) => {
  if (!url) return false;
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video');
};

const ScheduleVisitModal = ({ cattle, farmSettings, onClose }) => {
  const [form, setForm] = useState({ buyer_name: '', buyer_phone: '', visit_date: '', visit_time: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await visitRequestAPI.create({
        cattle_id: cattle?.db_id || cattle?.id || 0,
        cattle_name: cattle?.name || '',
        buyer_name: form.buyer_name,
        buyer_phone: form.buyer_phone,
        visit_date: form.visit_date,
        visit_time: form.visit_time,
        notes: form.notes,
      });
      const whatsappNumber = farmSettings?.whatsapp_number || '6281234567890';
      const message = `Halo Admin Kandas, saya ingin konfirmasi jadwal survei fisik:\n- Nama: ${form.buyer_name}\n- No. WA: ${form.buyer_phone}\n- Rencana Tanggal/Jam: ${form.visit_date} pukul ${form.visit_time} WIB\n- Tertarik pada Sapi: ${cattle?.id || '-'} - ${cattle?.name || '-'}\n- Catatan: ${form.notes || '-'}`;
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
      onClose();
    } catch (error) {
      alert('Gagal mengirim jadwal: ' + (error?.response?.data?.message || error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 bg-surface w-full max-w-md rounded-2xl shadow-2xl p-6 m-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Jadwalkan Kunjungan</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-variant"><span className="material-symbols-outlined">close</span></button>
        </div>
        <p className="text-sm text-on-surface-variant mb-4">Sapi: <strong>{cattle?.name || '-'}</strong> (ID: {cattle?.id || '-'})</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nama Lengkap *</label>
            <input required type="text" value={form.buyer_name} onChange={(e) => setForm({...form, buyer_name: e.target.value})} className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Masukkan nama lengkap" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Nomor WhatsApp</label>
            <input type="tel" value={form.buyer_phone} onChange={(e) => setForm({...form, buyer_phone: e.target.value})} className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Contoh: 08123456789" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Tanggal Kunjungan *</label>
              <input required type="date" value={form.visit_date} onChange={(e) => setForm({...form, visit_date: e.target.value})} className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Jam Rencana *</label>
              <input required type="time" value={form.visit_time} onChange={(e) => setForm({...form, visit_time: e.target.value})} className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Catatan / Estimasi Rombongan</label>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="w-full rounded-xl border border-outline-variant px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Jumlah rombongan, keperluan, dll." />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
            {submitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Mengirim...</>) : (<><span className="material-symbols-outlined text-[18px]">calendar_today</span> Konfirmasi & Kirim via WhatsApp</>)}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

const CattleDetailModal = ({ cattle, onClose, farmSettings = {}, isAdmin = false, onEdit }) => {
  const [showScheduleVisit, setShowScheduleVisit] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [fullMedia, setFullMedia] = useState(null);

  const parseAllMedia = () => {
    let list = [];
    if (Array.isArray(cattle?.images)) {
      list.push(...cattle.images);
    }
    if (cattle?.media_urls) {
      list.push(...safeParseMedia(cattle.media_urls).map(resolveUrl));
    }
    if (cattle?.video_url) {
      list.push(resolveUrl(cattle.video_url));
    }
    if (cattle?.image || cattle?.foto || cattle?.photo_url) {
      list.push(resolveUrl(cattle.image || cattle.foto || cattle.photo_url));
    }
    if (cattle?.thumbnails) {
      list.push(...cattle.thumbnails.map(resolveUrl));
    }
    const unique = Array.from(new Set(list.filter(Boolean)));
    return unique.length > 0 ? unique : [FALLBACK_CATTLE_IMAGE];
  };

  const imageList = parseAllMedia();

  const [activeImg, setActiveImg] = useState(
    cattle?.images?.[0] || cattle?.foto || cattle?.image || cattle?.photo_url || imageList[0] || FALLBACK_CATTLE_IMAGE
  );

  useEffect(() => {
    if (cattle) {
      const all = parseAllMedia();
      setActiveImg(cattle.images?.[0] || cattle.foto || cattle.image || cattle.photo_url || all[0] || FALLBACK_CATTLE_IMAGE);
    }
  }, [cattle]);

  if (!cattle) return null;

  const currentIsVideo = isVideoUrl(activeImg);
  const isBooked = cattle.status === 'Booked';
  const isTersedia = cattle.status === 'Tersedia';

  const handleWhatsAppClick = () => {
    const whatsappNumber = farmSettings?.whatsapp_number || farmSettings?.whatsapp || '6281234567890';
    const message = `Halo, saya tertarik dengan sapi ${cattle.name || '-'} (ID: ${cattle.id || '-'}).\nSpesifikasi:\n- Jenis: ${cattle.breed || '-'}\n- Jenis Kelamin: ${cattle.gender || '-'}\n- Bobot: ${cattle.weight || 0} Kg\n- Kategori: ${cattle.category || '-'}\n- Harga: ${formatPrice(cattle.price || 0)}\n\nBisakah saya mendapatkan informasi lebih lanjut?`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleLihatSapiTersedia = () => {
    onClose();
    setTimeout(() => {
      document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(cattle);
    }
    onClose();
  };

  return (
    <>
    {createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 bg-surface w-full max-w-[1100px] max-h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden m-auto animate-fade-in relative" role="dialog" aria-modal="true">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors flex-shrink-0 z-20"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
        <div className="overflow-y-auto flex-grow modal-scroll">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Media Gallery */}
            <div className="bg-surface-container-low p-6 lg:p-10 flex flex-col gap-4 border-r border-outline-variant/20">
              <div
                onClick={() => setFullMedia(activeImg)}
                className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative group shadow-md bg-surface-container cursor-zoom-in"
              >
                {currentIsVideo ? (
                  <video className="w-full h-full object-cover rounded-2xl" controls autoPlay src={activeImg} onClick={(e) => e.stopPropagation()} />
                ) : (
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    src={activeImg}
                    alt={cattle.name || 'Sapi'}
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_CATTLE_IMAGE; }}
                  />
                )}

                {/* Badge Zoom on Hover for images */}
                {!currentIsVideo && (
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                  </div>
                )}

                {imageList.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const curIdx = imageList.indexOf(activeImg);
                        const prevIdx = curIdx > 0 ? curIdx - 1 : imageList.length - 1;
                        setActiveImg(imageList[prevIdx]);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-surface/80 hover:bg-surface p-2 rounded-full shadow-md transition-all z-10"
                    >
                      <span className="material-symbols-outlined text-on-surface">chevron_left</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const curIdx = imageList.indexOf(activeImg);
                        const nextIdx = curIdx < imageList.length - 1 ? curIdx + 1 : 0;
                        setActiveImg(imageList[nextIdx]);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface/80 hover:bg-surface p-2 rounded-full shadow-md transition-all z-10"
                    >
                      <span className="material-symbols-outlined text-on-surface">chevron_right</span>
                    </button>
                  </>
                )}
              </div>

              {/* Dynamic Thumbnails (All photos + videos) */}
              {imageList.length > 1 && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1 max-w-full scrollbar-thin">
                  {imageList.map((media, idx) => {
                    const isVid = isVideoUrl(media);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImg(media)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 relative group ${
                          activeImg === media
                            ? 'border-emerald-600 ring-2 ring-emerald-600/20 opacity-100'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        {isVid ? (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                            <video src={media} className="w-full h-full object-cover opacity-60 pointer-events-none" muted />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <span className="material-symbols-outlined text-white text-[22px] drop-shadow-md">
                                play_circle
                              </span>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 py-0.2 rounded font-mono">
                              VID
                            </div>
                          </div>
                        ) : (
                          <img
                            src={media}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_CATTLE_IMAGE;
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 lg:p-10 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex flex-col gap-1">
                  <span className="font-label-md text-label-md text-outline">ID: {cattle.id || '-'}</span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface pr-8">Sapi {cattle.name || '-'} {cattle.gender || ''}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    cattle.status === 'Tersedia'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : cattle.status === 'Booked'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cattle.status === 'Tersedia' ? 'check_circle' : cattle.status === 'Booked' ? 'schedule' : 'block'}
                  </span>
                  {cattle.status || 'Tersedia'}
                </span>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1 text-slate-900">
                  <span className="text-xs font-bold text-slate-500">Rp</span>
                  <span className="text-2xl font-extrabold tracking-tight">
                    {Number(cattle.price || cattle.harga || 0).toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-slate-400 font-normal ml-0.5">/ ekor</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-surface-bright rounded-xl p-4 border border-outline-variant/30 shadow-sm flex flex-col gap-2 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 text-primary"><span className="material-symbols-outlined">weight</span><span className="font-label-md text-label-md text-on-surface-variant">Bobot</span></div>
                  <div><div className="font-headline-md text-headline-md text-on-surface">{cattle.weight || 0} Kg</div><div className="font-label-sm text-label-sm text-outline mt-1">Timbangan Real</div></div>
                </div>
                <div className="bg-surface-bright rounded-xl p-4 border border-outline-variant/30 shadow-sm flex flex-col gap-2 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 text-primary"><span className="material-symbols-outlined">{cattle.gender === 'Jantan' ? 'male' : 'female'}</span><span className="font-label-md text-label-md text-on-surface-variant">Kelamin</span></div>
                  <div><div className="font-headline-md text-[20px] font-semibold text-on-surface leading-tight mt-1">{cattle.gender || '-'}</div><div className="font-label-sm text-label-sm text-outline mt-2">Kandang Utama</div></div>
                </div>
                <div className="bg-surface-bright rounded-xl p-4 border border-outline-variant/30 shadow-sm flex flex-col gap-2 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 text-primary"><span className="material-symbols-outlined">calendar_month</span><span className="font-label-md text-label-md text-on-surface-variant">Fase / Usia</span></div>
                  <div><div className="font-headline-md text-[20px] font-semibold text-on-surface leading-tight mt-1">{cattle.category || '-'}</div><div className="font-label-sm text-label-sm text-outline mt-2">{cattle.age_phase || '-'}</div></div>
                </div>
                <div className="bg-surface-bright rounded-xl p-4 border border-outline-variant/30 shadow-sm flex flex-col gap-2 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 text-primary"><span className="material-symbols-outlined">grass</span><span className="font-label-md text-label-md text-on-surface-variant">Pola Pakan</span></div>
                  <div><div className="font-label-md text-label-md text-on-surface leading-snug mt-1">{cattle.feed_pattern || '-'}</div></div>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-xl p-5 border-l-4 border-secondary mb-8">
                <h3 className="font-label-md text-label-md text-on-surface mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-secondary">info</span>Catatan Perawatan</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{cattle.care_notes || '-'}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto flex flex-col gap-3">
                {isAdmin ? (
                  <>
                    <button onClick={handleEditClick} className="w-full bg-primary text-on-primary font-label-md text-[16px] py-4 px-6 rounded-full hover-lift transition-all duration-200 flex items-center justify-center gap-2 font-bold shadow-md">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span>Edit Sapi
                    </button>
                    <button onClick={onClose} className="w-full bg-surface-container text-on-surface font-label-md text-[16px] py-3.5 px-6 rounded-full hover:bg-surface-variant transition-all duration-200 flex items-center justify-center gap-2 border border-outline-variant/30 font-semibold">
                      Tutup
                    </button>
                  </>
                ) : isTersedia ? (
                  <button onClick={() => setShowActionSheet(true)} className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-white bg-[#134E35] hover:bg-[#0E3D29] transition-all shadow-sm active:scale-[0.99]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>Beli / Nego via WhatsApp
                  </button>
                ) : isBooked ? (
                  <button onClick={handleLihatSapiTersedia} className="w-full bg-secondary text-on-secondary font-label-md text-[16px] py-4 px-6 rounded-full hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 font-bold shadow-md">
                    <span className="material-symbols-outlined">search</span>Lihat Sapi Tersedia Lainnya
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
    )}
    {showActionSheet && createPortal(
      <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) setShowActionSheet(false); }}>
        <div className="fixed inset-0" onClick={() => setShowActionSheet(false)} />
        <div className="relative z-10 bg-surface w-full max-w-sm rounded-2xl shadow-2xl p-6 m-auto animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Beli / Nego Sapi</h3>
            <button onClick={() => setShowActionSheet(false)} className="p-1 rounded-full hover:bg-surface-variant"><span className="material-symbols-outlined">close</span></button>
          </div>
          <p className="text-sm text-on-surface-variant mb-5">
            Sapi <strong>{cattle.name || '-'}</strong> (ID: {cattle.id || '-'}). Pilih cara Anda ingin melanjutkan:
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setShowActionSheet(false); handleWhatsAppClick(); }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-white bg-[#134E35] hover:bg-[#0E3D29] transition-all shadow-sm active:scale-[0.99]"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>Chat Sekarang via WhatsApp
            </button>
            <button
              onClick={() => { setShowActionSheet(false); setShowScheduleVisit(true); }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-[#134E35] bg-white border-2 border-[#134E35] hover:bg-[#134E35]/5 transition-all active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[#134E35]">calendar_today</span>Jadwalkan Kunjungan Kandang
            </button>
            <button
              onClick={() => setShowActionSheet(false)}
              className="w-full py-2.5 rounded-xl text-on-surface-variant font-semibold text-sm hover:bg-surface-variant transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>,
      document.body
      )}
    {showScheduleVisit && <ScheduleVisitModal cattle={cattle} farmSettings={farmSettings} onClose={() => setShowScheduleVisit(false)} />}
    {/* Lightbox Fullscreen Preview Modal */}
    {fullMedia && createPortal(
      <div
        className="fixed inset-0 z-[999999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
        onClick={() => setFullMedia(null)}
      >
        <button
          aria-label="Tutup Preview"
          onClick={() => setFullMedia(null)}
          className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-20"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          {isVideoUrl(fullMedia) ? (
            <video
              src={fullMedia}
              controls
              autoPlay
              className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            />
          ) : (
            <img
              src={fullMedia}
              alt="Preview Full"
              className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            />
          )}
        </div>
      </div>,
      document.body
    )}
    </>
  );
};

export default CattleDetailModal;
