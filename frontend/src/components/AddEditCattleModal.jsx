import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { uploadAPI } from '../services/api';
import ImageCropper from './ImageCropper';

const defaultForm = {
  ear_tag: '',
  name: '',
  breed: '',
  gender: 'Jantan',
  category: 'Dewasa',
  age_phase: '',
  weight: '',
  price: '',
  status: 'Tersedia',
  feed_pattern: '',
  pola_pakan: '',
  care_notes: '',
  catatan: '',
  media_urls: [],
};

const pad3 = (n) => String(n).padStart(3, '0');

const generateNextId = (cattleList = [], current = '') => {
  const existing = cattleList.map((c) => c?.id || c?.ear_tag || '');
  if (current) existing.push(current);
  let max = 0;
  existing.forEach((tag) => {
    const m = String(tag).match(/S-(\d+)/i);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return `S-${pad3(max + 1)}`;
};

const AddEditCattleModal = ({ onClose, onSave, initialData = null, cattleList = [] }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState(
    initialData
      ? {
          ...defaultForm,
          ...initialData,
          ear_tag: initialData.ear_tag || initialData.id || '',
          price: initialData.price ? String(initialData.price) : '',
          weight: initialData.weight ? String(initialData.weight) : '',
          catatan: initialData.catatan || initialData.care_notes || '',
          care_notes: initialData.care_notes || initialData.catatan || '',
          pola_pakan: initialData.pola_pakan || initialData.feed_pattern || '',
          feed_pattern: initialData.feed_pattern || initialData.pola_pakan || '',
          media_urls: initialData.media_urls || [],
        }
      : { ...defaultForm, ear_tag: generateNextId(cattleList) }
  );
  const form = formData;
  const setForm = setFormData;
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    setForm((prev) => ({
      ...prev,
      media_urls: [...prev.media_urls, manualUrl.trim()],
      image: prev.image || manualUrl.trim(),
    }));
    setManualUrl('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'ear_tag' ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleGenerateId = () => {
    const tag = generateNextId(cattleList, formData.ear_tag);
    setFormData((prev) => ({ ...prev, ear_tag: tag }));
    if (errors.ear_tag) setErrors((prev) => ({ ...prev, ear_tag: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.ear_tag.trim()) newErrors.ear_tag = 'Kode ID (Ear Tag) wajib diisi';
    if (!formData.name.trim()) newErrors.name = 'Nama sapi wajib diisi';
    if (!formData.breed) newErrors.breed = 'Jenis ras wajib dipilih';
    if (!formData.category) newErrors.category = 'Fase usia wajib dipilih';
    if (!formData.weight || isNaN(Number(formData.weight))) newErrors.weight = 'Bobot harus berupa angka';
    if (!formData.price) newErrors.price = 'Harga wajib diisi';
    return newErrors;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Parse price from formatted string to number
    const rawPrice = String(formData.price).replace(/\./g, '').replace(/\D/g, '');
    
    const mediaUrls = formData.media_urls || [];
    const imageList = mediaUrls.filter(url => !url.endsWith('.mp4') && !url.endsWith('.webm') && !url.includes('video'));
    const videoList = mediaUrls.filter(url => url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video'));

    // Build payload matching backend
    const cattleData = {
      ear_tag: formData.ear_tag,
      name: formData.name,
      breed: formData.breed,
      gender: formData.gender,
      category: formData.category,
      age_phase: formData.age_phase,
      weight: Number(formData.weight),
      price: Number(rawPrice) || 0,
      status: formData.status,
      feed_pattern: formData.pola_pakan || formData.feed_pattern || '',
      care_notes: formData.catatan || formData.care_notes || '',
      media_urls: mediaUrls,
      images: imageList,
      video_url: videoList[0] || null,
    };
    
    setSaved(true);
    setTimeout(() => {
      onSave(cattleData);
    }, 300);
  };

  const formatPriceInput = (value) => {
    const num = String(value).replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm'
    ];
    
    const invalidFiles = Array.from(files).filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      alert('Tipe file tidak didukung. Gunakan JPG, PNG, GIF, WEBP, MP4, atau WEBM.');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert('Ukuran file maksimal 50MB.');
      return;
    }

    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const videoFiles = Array.from(files).filter(f => f.type.startsWith('video/'));

    if (videoFiles.length > 0) {
      await uploadFilesToServer(videoFiles);
    }

    if (imageFiles.length === 1) {
      const url = URL.createObjectURL(imageFiles[0]);
      setCropImage({ url, file: imageFiles[0], remaining: [] });
    } else if (imageFiles.length > 1) {
      const [first, ...rest] = imageFiles;
      const url = URL.createObjectURL(first);
      setCropImage({ url, file: first, remaining: rest });
    }
  };

  const uploadFilesToServer = async (files) => {
    try {
      setIsUploading(true);
      const response = await uploadAPI.uploadFiles(files);
      if (response.status === 201 && response.data?.urls) {
        setForm((prev) => ({
          ...prev,
          media_urls: [...prev.media_urls, ...response.data.urls],
          image: prev.image || response.data.urls[0],
        }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Gagal mengupload file: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropApply = async (croppedUrl, blob) => {
    setCropImage(null);
    const file = new File([blob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
    await uploadFilesToServer([file]);
    if (cropImage?.remaining?.length > 0) {
      const [next, ...rest] = cropImage.remaining;
      const url = URL.createObjectURL(next);
      setCropImage({ url, file: next, remaining: rest });
    }
  };

  const handleCropCancel = () => {
    setCropImage(null);
  };

  const handleRemoveMedia = (index) => {
    setForm((prev) => {
      const newMediaUrls = prev.media_urls.filter((_, i) => i !== index);
      return {
        ...prev,
        media_urls: newMediaUrls,
        image: prev.image === prev.media_urls[index] ? (newMediaUrls[0] || '') : prev.image,
      };
    });
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleUploadBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
    {createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden m-auto animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-edit-modal-title"
      >
        {/* Modal Header (Sticky) */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 md:px-8 py-5 border-b border-outline-variant/20 bg-surface/95">
          <div>
            <h2 id="add-edit-modal-title" className="font-headline-md text-headline-md font-bold text-on-surface">
              {isEdit ? 'Edit Data Sapi' : 'Tambah Data Sapi Baru'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">
              {isEdit
                ? 'Perbarui informasi ternak yang sudah ada.'
                : 'Masukkan informasi detail untuk menambahkan ternak ke inventaris.'}
            </p>
          </div>
          <button
            aria-label="Tutup modal"
            onClick={onClose}
            className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-container/50 focus:outline-none"
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body & Form */}
        <form id="add-edit-form" className="flex-1 overflow-y-auto p-6 space-y-6" onSubmit={handleSubmit}>
            {/* Media Upload Section */}
            <div className="space-y-3">
              <label className="font-label-md text-label-md text-on-surface block font-semibold">
                Media Sapi (Foto/Video)
              </label>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/webm"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {/* Thumbnail Grid Preview */}
              {form.media_urls.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {form.media_urls.map((media, index) => {
                      const isVideo = media.endsWith('.mp4') || media.endsWith('.webm');
                      const fullUrl = media.startsWith('http') ? media : `http://localhost:8080${media}`;
                      
                      return (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-outline-variant/30 shadow-sm">
                          {/* Thumbnail Content */}
                          {isVideo ? (
                            <div className="w-full h-full bg-gradient-to-br from-surface-container to-surface-container-high flex flex-col items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-3xl text-on-surface-variant">videocam</span>
                              <span className="text-xs text-on-surface-variant font-medium">Video</span>
                            </div>
                          ) : (
                            <img
                              src={fullUrl}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x300?text=Error';
                              }}
                            />
                          )}
                          
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMedia(index);
                            }}
                            className="absolute top-1 right-1 bg-error hover:bg-error/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                          
                          {/* Video Indicator */}
                          {isVideo && (
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">play_circle</span>
                              Video
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Add More Button */}
                    <button
                      type="button"
                      onClick={handleUploadBoxClick}
                      disabled={isUploading}
                      className="aspect-square rounded-xl border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary-container/10 flex flex-col items-center justify-center gap-2 transition-all group disabled:opacity-50"
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-3xl text-outline group-hover:text-primary transition-colors">add</span>
                          <span className="text-xs text-outline group-hover:text-primary transition-colors">Tambah</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Upload Info */}
                  <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    {form.media_urls.length} file media terupload. Drag & drop atau klik "+" untuk menambah.
                  </p>
                </div>
              )}
              
              {/* Empty State - Upload Area */}
              {form.media_urls.length === 0 && (
                <div
                  onClick={handleUploadBoxClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    rounded-2xl border-2 border-dashed p-8 transition-all duration-200 cursor-pointer
                    flex flex-col items-center justify-center min-h-[200px]
                    ${dragActive 
                      ? 'border-primary bg-primary-container/20 scale-[1.02]' 
                      : 'border-outline-variant hover:border-primary hover:bg-primary-container/5'
                    }
                    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                      <p className="text-on-surface-variant font-medium">Mengupload file...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-on-primary-container">cloud_upload</span>
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">
                          <span className="text-primary">Klik untuk upload</span> atau drag & drop
                        </p>
                        <p className="text-sm text-on-surface-variant mt-1">
                          JPG, PNG, WEBP, GIF, MP4, WEBM (max 50MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Input URL Video / Foto Langsung */}
              <div className="flex gap-2 pt-1">
                <input
                  type="url"
                  placeholder="Atau tempel URL Video / Foto (cth: https://.../video.mp4 atau link foto)"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddManualUrl();
                    }
                  }}
                  className="flex-1 rounded-xl border border-outline-variant bg-surface px-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddManualUrl}
                  disabled={!manualUrl.trim()}
                  className="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">add_link</span>
                  Tambah URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Kode ID (Ear Tag) */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="ear_tag">
                  Kode ID Sapi (Ear Tag) <span className="text-error">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className={`w-full rounded-xl border bg-surface px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none ${errors.ear_tag ? 'border-error' : 'border-outline-variant'}`}
                    id="ear_tag" name="ear_tag" placeholder="S-001 (otomatis, bisa diedit)" type="text"
                    value={form.ear_tag} onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateId}
                    title="Generate kode ID baru"
                    className="shrink-0 px-4 rounded-xl bg-primary/10 text-primary font-label-md text-label-md font-bold hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">autorenew</span>
                    Generate
                  </button>
                </div>
                {errors.ear_tag && <p className="text-error text-xs mt-1">{errors.ear_tag}</p>}
              </div>

              {/* Nama Sapi */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="name">
                  Nama Sapi <span className="text-error">*</span>
                </label>
                <input
                  className={`w-full rounded-xl border bg-surface px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none ${errors.name ? 'border-error' : 'border-outline-variant'}`}
                  id="name" name="name" placeholder="Contoh: Limousin Super" type="text"
                  value={form.name} onChange={handleChange}
                />
                {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Jenis/Ras */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="breed">
                  Jenis / Ras <span className="text-error">*</span>
                </label>
                <input
                  className={`w-full rounded-xl border bg-surface px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none ${errors.breed ? 'border-error' : 'border-outline-variant'}`}
                  id="breed" name="breed" placeholder="Contoh: Limousin, PO, Brahman, Madura, dsb." type="text"
                  value={form.breed} onChange={handleChange}
                />
                {errors.breed && <p className="text-error text-xs mt-1">{errors.breed}</p>}
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface block mb-2">Jenis Kelamin</label>
                <div className="flex p-1 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  {['Jantan', 'Betina'].map((g) => (
                    <label key={g} className="flex-1 cursor-pointer">
                      <input className="peer sr-only" name="gender" type="radio" value={g} checked={form.gender === g} onChange={handleChange} />
                      <div className="text-center py-2.5 px-4 rounded-lg font-label-md text-label-md text-on-surface-variant peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-sm peer-checked:font-bold transition-all">
                        {g}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fase Usia */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="category">
                  Fase Usia <span className="text-error">*</span>
                </label>
                <input
                  className={`w-full rounded-xl border bg-surface px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none ${errors.category ? 'border-error' : 'border-outline-variant'}`}
                  id="category" name="category" placeholder="Contoh: Pedet / Bakalan / Dewasa" type="text"
                  value={form.category} onChange={handleChange}
                />
                {errors.category && <p className="text-error text-xs mt-1">{errors.category}</p>}
              </div>

              {/* Bobot */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="weight">
                  Bobot (Kg) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    className={`w-full rounded-xl border bg-surface px-4 py-3 pr-12 font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none ${errors.weight ? 'border-error' : 'border-outline-variant'}`}
                    id="weight" min="0" name="weight" placeholder="Contoh: 650" type="number"
                    value={form.weight} onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <span className="text-on-surface-variant font-label-md text-sm">Kg</span>
                  </div>
                </div>
                {errors.weight && <p className="text-error text-xs mt-1">{errors.weight}</p>}
              </div>

              {/* Fase Usia Detail */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="age_phase">
                  Estimasi Umur / Status Gigi
                </label>
                <input
                  className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  id="age_phase" name="age_phase" placeholder="Contoh: Poel 1 Pasang / 6 Bulan" type="text"
                  value={form.age_phase} onChange={handleChange}
                />
              </div>

              {/* Harga */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="price">
                  Harga Jual (IDR) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-on-surface-variant font-label-md text-sm">Rp</span>
                  </div>
                  <input
                    className={`w-full rounded-xl border bg-surface pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none ${errors.price ? 'border-error' : 'border-outline-variant'}`}
                    id="price" name="price" placeholder="Contoh: 38500000" type="text"
                    value={form.price}
                    onChange={(e) => {
                      const formatted = formatPriceInput(e.target.value);
                      setForm((p) => ({ ...p, price: formatted }));
                      if (errors.price) setErrors((p) => ({ ...p, price: '' }));
                    }}
                  />
                </div>
                {errors.price && <p className="text-error text-xs mt-1">{errors.price}</p>}
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {/* Baris 1: Catatan (Kiri) & Pola Pakan (Kanan) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Catatan Kondisi & Perawatan
                  </label>
                  <textarea
                    name="catatan"
                    rows="3"
                    value={formData.catatan || ''}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    placeholder="Nafsu makan, riwayat vaksin, catatan kurban..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pola Pakan
                  </label>
                  <textarea
                    name="pola_pakan"
                    rows="3"
                    value={formData.pola_pakan || ''}
                    onChange={(e) => setFormData({ ...formData, pola_pakan: e.target.value })}
                    placeholder="Contoh: Rumput Gajah Segar + Konsentrat"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 resize-none"
                  />
                </div>
              </div>

              {/* Baris 2: Status Ketersediaan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status Ketersediaan
                </label>
                <div className="flex items-center gap-6 py-1">
                  {['Tersedia', 'Booked', 'Terjual'].map((statusOption) => (
                    <label key={statusOption} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                      <input
                        type="radio"
                        name="status"
                        value={statusOption}
                        checked={formData.status === statusOption}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="text-emerald-700 focus:ring-emerald-700 h-4 w-4 accent-emerald-700"
                      />
                      {statusOption}
                    </label>
                  ))}
                </div>
              </div>
            </div>

        </form>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-slate-50 border-t flex-shrink-0 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-container transition-all flex-shrink-0"
          >
            Batal
          </button>
          <button
            type="submit"
            form="add-edit-form"
            disabled={saved || isUploading}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-md transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saved ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Tersimpan!
              </>
            ) : isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Mengupload...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                {isEdit ? 'Simpan Perubahan' : 'Simpan Sapi'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
    )}
    {cropImage && (
      <ImageCropper
        imageSrc={cropImage.url}
        onApply={handleCropApply}
        onCancel={handleCropCancel}
      />
    )}
    </>
  );
};

export default AddEditCattleModal;
