import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { farmSettingAPI, bankAccountAPI, uploadAPI, authAPI } from '../services/api';
import ImageCropper from '../components/ImageCropper';
import { DEFAULT_LANDING_CONFIG, getLandingSettings, saveLandingSettings, FEATURE_ICONS } from '../utils/landingSettings';

const TABS = [
  { key: 'profil', label: 'Profil & Operasional Kandang' },
  { key: 'rekening', label: 'Rekening Bank DP' },
  { key: 'akun', label: 'Akun & Keamanan Admin' },
  { key: 'landing', label: 'Konten Landing Page' },
];

// ─── Tab 1: Profil & Operasional ────────────────────────────────────────────
const ProfilTab = ({ settings, onChange }) => (
  <div className="space-y-6">
    <div className="bg-primary/5 text-primary border border-primary/20 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
      <span className="material-symbols-outlined text-[18px]">info</span>
      <span>
        Data identitas &amp; operasional kandang (nama, alamat, WhatsApp, jam, peta). Ini dipakai di navbar, footer, dan lokasi landing page. Teks marketing (hero, fitur) diatur di tab <strong>Konten Landing Page</strong>.
      </span>
    </div>
    <section className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">store</span>
        Profil Usaha &amp; Operasional
      </h3>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Nama Usaha Peternakan</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              type="text"
              value={settings.farm_name || ''}
              onChange={(e) => onChange('farm_name', e.target.value)}
            />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Slogan / Tagline Bisnis</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              type="text"
              value={settings.tagline || ''}
              onChange={(e) => onChange('tagline', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
            Deskripsi Singkat Kandang &amp; Komitmen Pakan Alami
          </label>
          <textarea
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            rows={3}
            value={settings.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Contoh: Peternakan kami mengutamakan perawatan alami..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Nomor WhatsApp CS / Penjual</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              type="text"
              value={settings.whatsapp_number || ''}
              onChange={(e) => onChange('whatsapp_number', e.target.value)}
            />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Jam Kunjungan Survei Fisik</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              type="text"
              value={settings.visiting_hours || ''}
              onChange={(e) => onChange('visiting_hours', e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>

    <section className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">location_on</span>
        Alamat &amp; Titik Lokasi Kandang
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Alamat Lengkap Kandang</label>
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              rows={4}
              value={settings.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Jl. Raya Peternakan No. 123..."
            />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Catatan Akses Truk/Pick-up</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              type="text"
              value={settings.truck_access_note || ''}
              onChange={(e) => onChange('truck_access_note', e.target.value)}
              placeholder="Contoh: Bisa dilalui truk engkel/double"
            />
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Link Google Maps</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              type="text"
              value={settings.google_maps_url || ''}
              onChange={(e) => onChange('google_maps_url', e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </div>
          <div className="w-full h-40 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-center overflow-hidden">
            {settings.google_maps_url ? (
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.address || '')}&output=embed`}
                className="w-full h-full border-0"
                title="Map Preview"
                loading="lazy"
              />
            ) : (
              <div className="text-center">
                <span className="material-symbols-outlined text-on-surface-variant opacity-40 text-5xl">map</span>
                <p className="text-label-sm text-on-surface-variant opacity-50 mt-1">Map Preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  </div>
);

// ─── Tab 2: Rekening Bank DP ─────────────────────────────────────────────────
const BankStatusChip = ({ isActive }) => {
  if (isActive) return <div className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded uppercase">Aktif</div>;
  return <div className="bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded uppercase">Nonaktif</div>;
};

const RekeningTab = ({ settings, onChange }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [bankForm, setBankForm] = useState({ bank_name: '', account_number: '', account_holder: '', is_active: true });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const qrisInputRef = useRef(null);

  // Fetch bank accounts from API on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await bankAccountAPI.getAll();
        if (response.status === 200 && response.data) {
          setBankAccounts(response.data);
        }
      } catch (err) {
        console.error('Failed to load bank accounts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const openAddModal = () => {
    setEditingBank(null);
    setBankForm({ bank_name: '', account_number: '', account_holder: '', is_active: true });
    setShowModal(true);
  };

  const openEditModal = (bank) => {
    setEditingBank(bank);
    setBankForm({
      bank_name: bank.bank_name,
      account_number: bank.account_number,
      account_holder: bank.account_holder,
      is_active: bank.is_active,
    });
    setShowModal(true);
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    if (!bankForm.bank_name || !bankForm.account_number || !bankForm.account_holder) return;

    try {
      setIsSaving(true);
      if (editingBank) {
        const response = await bankAccountAPI.update(editingBank.id, bankForm);
        if (response.status === 200) {
          setBankAccounts((prev) => prev.map((b) => (b.id === editingBank.id ? response.data : b)));
          alert('Rekening berhasil diperbarui!');
        }
      } else {
        const response = await bankAccountAPI.create(bankForm);
        if (response.status === 201) {
          setBankAccounts((prev) => [response.data, ...prev]);
          alert('Rekening berhasil ditambahkan!');
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save bank:', error);
      alert('Gagal menyimpan rekening: ' + (error?.response?.data?.message || error?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBank = async (id) => {
    try {
      const response = await bankAccountAPI.delete(id);
      if (response.status === 200) {
        setBankAccounts((prev) => prev.filter((b) => b.id !== id));
        setDeleteConfirm(null);
        alert('Rekening berhasil dihapus!');
      }
    } catch (error) {
      console.error('Failed to delete bank:', error);
      alert('Gagal menghapus rekening: ' + (error?.response?.data?.message || error?.message || 'Unknown error'));
    }
  };

  const handleQrisUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange('qrisImage', url);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Pengaturan Rekening &amp; Metode Pembayaran DP
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2D6A4F] text-white rounded-xl font-label-md font-bold hover:bg-[#23533e] transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Rekening Bank
        </button>
      </div>

      {/* Bank Account Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : bankAccounts.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">account_balance</span>
          </div>
          <p className="text-on-surface font-medium mb-1">Belum ada rekening bank yang ditambahkan.</p>
          <p className="text-on-surface-variant text-sm mb-4">Klik tombol "+ Tambah Rekening Bank" untuk menambahkan rekening tujuan transfer.</p>
          <button onClick={openAddModal} className="text-primary font-bold hover:underline text-sm">
            + Tambah Rekening Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankAccounts.map((bank) => (
            <div
              key={bank.id}
              className={`bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm relative hover:shadow-md transition-shadow ${
                !bank.is_active ? 'opacity-70' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <BankStatusChip isActive={bank.is_active} />
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditModal(bank)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-blue-600 hover:bg-surface-variant/50 transition-colors"
                    title="Edit Rekening"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(bank)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Rekening"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
              <p className="font-label-sm text-on-surface-variant mb-1 font-medium">{bank.bank_name}</p>
              <p
                className={`font-headline-md text-xl tracking-wide font-bold mb-1 ${
                  !bank.is_active ? 'text-on-surface-variant' : 'text-primary'
                }`}
              >
                {bank.account_number}
              </p>
              <p className={`font-label-md ${!bank.is_active ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}>
                a/n {bank.account_holder}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* QRIS & Transfer Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QRIS Upload Box */}
        <div className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-label-md text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">qr_code_2</span>
              QRIS Static Pembayaran
            </h3>
            {settings.qrisImage && (
              <button
                onClick={() => onChange('qrisImage', null)}
                className="text-xs text-error hover:underline font-semibold"
              >
                Hapus QRIS
              </button>
            )}
          </div>
          <input
            type="file"
            ref={qrisInputRef}
            onChange={handleQrisUpload}
            accept="image/*"
            className="hidden"
          />
          {settings.qrisImage ? (
            <div className="relative group rounded-xl overflow-hidden border border-outline-variant/30 max-h-56 bg-slate-50 flex items-center justify-center p-3">
              <img src={settings.qrisImage} alt="QRIS Preview" className="max-h-48 object-contain rounded-lg shadow-sm" />
              <div onClick={() => qrisInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                <span className="material-symbols-outlined text-3xl">photo_camera</span>
                <span className="text-sm font-semibold mt-1">Ganti Gambar QRIS</span>
              </div>
            </div>
          ) : (
            <div onClick={() => qrisInputRef.current?.click()} className="border-2 border-dashed border-outline-variant rounded-xl h-48 flex flex-col items-center justify-center gap-2 bg-surface-container-lowest cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">qr_code_2</span>
              </div>
              <p className="font-label-md text-on-surface font-bold text-sm">Klik untuk upload QRIS</p>
              <p className="font-label-sm text-xs text-outline">Format PNG, JPG maks 5MB</p>
            </div>
          )}
        </div>

        {/* Transfer Notes */}
        <div className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
          <h3 className="font-label-md text-on-surface font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
            Instruksi Catatan Transfer untuk Pembeli
          </h3>
          <textarea
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            placeholder="Harap cantumkan ID Sapi pada berita transfer"
            rows={5}
            value={settings.transferNote}
            onChange={(e) => onChange('transferNote', e.target.value)}
          />
          <p className="text-xs text-outline mt-2">
            Catatan ini akan ditampilkan kepada pembeli saat melakukan konfirmasi pembayaran DP melalui WhatsApp.
          </p>
        </div>
      </div>

      {/* Modal Add/Edit Bank Account */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0" onClick={() => setShowModal(false)} />
          <div className="relative z-10 bg-surface rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-outline-variant/30 m-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {editingBank ? 'Edit Rekening Bank' : 'Tambah Rekening Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveBank} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Nama Bank</label>
                <input type="text" required placeholder="e.g., Bank BCA / Mandiri / BRI / BSI"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  value={bankForm.bank_name} onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Nomor Rekening</label>
                <input type="text" required placeholder="e.g., 123-456-7890"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  value={bankForm.account_number} onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Atas Nama (Pemilik Rekening)</label>
                <input type="text" required placeholder="e.g., Dastro Farm"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  value={bankForm.account_holder} onChange={(e) => setBankForm({ ...bankForm, account_holder: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Status Rekening</label>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  value={bankForm.is_active ? 'true' : 'false'}
                  onChange={(e) => setBankForm({ ...bankForm, is_active: e.target.value === 'true' })}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100 transition text-sm">
                  Batal
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] text-white font-bold hover:bg-[#23533e] transition shadow-md text-sm disabled:opacity-60">
                  {isSaving ? 'Menyimpan...' : editingBank ? 'Simpan Perubahan' : 'Tambah Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 text-center m-auto">
            <div className="w-14 h-14 rounded-full bg-red-100 text-error flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">delete</span>
            </div>
            <h3 className="font-headline-md font-bold text-on-surface text-lg mb-1">Hapus Rekening?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Rekening <strong>{deleteConfirm.bank_name}</strong> ({deleteConfirm.account_number}) akan dihapus dari daftar.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100 transition text-sm">
                Batal
              </button>
              <button onClick={() => handleDeleteBank(deleteConfirm.id)} className="flex-1 py-2.5 rounded-xl bg-error text-white font-bold hover:opacity-90 transition text-sm shadow-sm">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// ─── Tab 3: Akun & Keamanan ──────────────────────────────────────────────────
const AkunTab = ({ settings, onChange, registerSave }) => {
  const admin = settings?.admin || {};
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwStrength, setPwStrength] = useState(0);
  const avatarInputRef = useRef(null);
  const [cropImage, setCropImage] = useState(null);
  const [, setIsUploadingAvatar] = useState(false);

  const submitPasswordChange = async () => {
    if (!pwForm.current && !pwForm.newPw) return { ok: true };
    if (pwForm.newPw && pwForm.newPw !== pwForm.confirm) {
      return { ok: false, error: 'Konfirmasi kata sandi baru tidak cocok' };
    }
    if (pwForm.newPw && pwForm.newPw.length < 6) {
      return { ok: false, error: 'Kata sandi baru minimal 6 karakter' };
    }
    if (pwForm.newPw) {
      await authAPI.updatePassword({
        old_password: pwForm.current,
        new_password: pwForm.newPw,
      });
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwStrength(0);
    }
    return { ok: true };
  };

  registerSave?.(submitPasswordChange);

  const calcStrength = (pw) => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const strengthColor = ['', 'bg-error', 'bg-[#f57f17]', 'bg-secondary', 'bg-primary'];

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setCropImage({ url, file });
    }
    e.target.value = '';
  };

  const handleCropApply = async (croppedUrl, blob) => {
    setCropImage(null);
    setIsUploadingAvatar(true);
    try {
      const file = new File([blob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const response = await uploadAPI.uploadFiles([file]);
      if (response.status === 201 && response.data?.urls?.[0]) {
        onChange('admin.avatar', response.data.urls[0]);
        await authAPI.updateProfile({ photo_url: response.data.urls[0] });
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Gagal mengupload foto profil');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      {/* Left: Profile Info + Login History */}
      <div className="lg:col-span-1 flex flex-col gap-gutter">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-outline-variant/30">
          <h3 className="font-headline-md text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            Informasi Profil
          </h3>
          <div className="flex flex-col items-center mb-6">
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-low bg-surface-container-high flex items-center justify-center">
                {admin.avatar ? (
                  <img src={admin.avatar} alt="Admin Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-5xl">person</span>
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-md hover:bg-primary-container transition-colors"
                title="Ganti Foto"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="font-label-sm text-xs bg-primary text-white px-3 py-1.5 rounded-full hover:bg-primary-container transition-colors"
              >
                Ubah Foto
              </button>
              <button
                onClick={() => onChange('admin.avatar', '')}
                className="font-label-sm text-xs border border-error text-error px-3 py-1.5 rounded-full hover:bg-error-container transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Nama Lengkap', key: 'name', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'No. Handphone', key: 'phone', type: 'tel' },
            ].map((f) => (
              <div key={f.key}>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">{f.label}</label>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                  type={f.type}
                  value={admin[f.key] || ''}
                  onChange={(e) => onChange(`admin.${f.key}`, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Role</label>
              <span className="inline-block bg-secondary-container text-on-secondary-container font-label-sm px-2.5 py-1 rounded-md font-semibold">
                {admin.role || 'admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Login History */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-outline-variant/30">
          <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span>
            Riwayat Aktivitas
          </h3>
          <div className="flex items-start gap-4 p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
            <div className="p-2 bg-surface-container-high rounded-full text-on-surface-variant flex-shrink-0">
              <span className="material-symbols-outlined">computer</span>
            </div>
            <div>
              <p className="font-label-md text-on-surface font-semibold text-sm">Login Terakhir: {admin.lastLogin || '-'}</p>
              <p className="font-body-md text-xs text-on-surface-variant">{admin.device || '-'}</p>
              <p className="font-body-md text-xs text-outline mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                IP: {admin.ip || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Password Change */}
      <div className="lg:col-span-2">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-outline-variant/30 h-full">
          <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lock</span>
            Keamanan &amp; Ganti Kata Sandi
          </h3>
          <p className="font-body-md text-on-surface-variant mb-6 pb-6 border-b border-outline-variant/20 text-sm">
            Pastikan akun Anda menggunakan kata sandi yang kuat untuk menjaga keamanan data peternakan.
          </p>
          <form className="max-w-md space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Current Password */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-2">Kata Sandi Saat Ini</label>
              <div className="relative">
                <input
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg pl-4 pr-10 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Masukkan kata sandi saat ini"
                  type={showCurrent ? 'text' : 'password'}
                  value={pwForm.current}
                  onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                >
                  <span className="material-symbols-outlined">{showCurrent ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            {/* New Password */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-2">Kata Sandi Baru</label>
              <div className="relative mb-2">
                <input
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg pl-4 pr-10 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Buat kata sandi baru"
                  type={showNew ? 'text' : 'password'}
                  value={pwForm.newPw}
                  onChange={(e) => {
                    setPwForm((p) => ({ ...p, newPw: e.target.value }));
                    setPwStrength(calcStrength(e.target.value));
                  }}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                >
                  <span className="material-symbols-outlined">{showNew ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {/* Strength Bar */}
              {pwForm.newPw && (
                <>
                  <div className="flex gap-1 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden mt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 rounded-full transition-all ${
                          i <= pwStrength ? strengthColor[pwStrength] : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`font-label-sm text-xs mt-1 text-right ${pwStrength >= 3 ? 'text-primary font-bold' : 'text-[#f57f17]'}`}>
                    Kekuatan: {strengthLabel[pwStrength]}
                  </p>
                </>
              )}
            </div>
            {/* Confirm Password */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-2">Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <input
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg pl-4 pr-10 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Ketik ulang kata sandi baru"
                  type={showConfirm ? 'text' : 'password'}
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  <span className="material-symbols-outlined">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                <p className="text-error text-xs mt-1 font-semibold">Kata sandi tidak cocok</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
    {cropImage && (
      <ImageCropper imageSrc={cropImage.url} onApply={handleCropApply} onCancel={() => setCropImage(null)} aspect={1} />
    )}
    </>
  );
};

// ─── Tab 4: Konten Landing Page ─────────────────────────────────────────────
const LandingTab = ({ settings, onChange }) => {
  const landing = getLandingSettings(settings.landing);

  const set = (patch) => onChange('landing', { ...landing, ...patch });

  const updateFeature = (index, field, value) => {
    const features = landing.features.map((f, i) => (i === index ? { ...f, [field]: value } : f));
    set({ features });
  };

  const addFeature = () => {
    set({ features: [...landing.features, { icon: 'grass', title: '', desc: '' }] });
  };

  const removeFeature = (index) => {
    set({ features: landing.features.filter((_, i) => i !== index) });
  };

  const inputCls =
    'w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all';
  const labelCls = 'block font-label-sm text-label-sm text-on-surface-variant mb-1';

  return (
    <div className="space-y-8">
      <div className="bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
        <span className="material-symbols-outlined text-[18px]">info</span>
        <span>
          Kelola teks tampilan landing page (hero, tentang, fitur, judul lokasi). Alamat, WhatsApp, jam kunjungan, dan peta tetap diatur lewat tab <strong>Profil &amp; Operasional Kandang</strong>.
        </span>
      </div>
      {/* Hero Section */}
      <section className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">campaign</span>
          Hero Section
        </h3>
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Badge / Label Atas</label>
            <input className={inputCls} type="text" value={landing.heroBadge} onChange={(e) => set({ heroBadge: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Judul Utama (Hero Title)</label>
            <textarea className={inputCls} rows={2} value={landing.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Subjudul / Deskripsi Hero</label>
            <textarea className={inputCls} rows={3} value={landing.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} />
          </div>
        </div>
      </section>

      {/* About / Keunggulan */}
      <section className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">verified</span>
          Section Tentang &amp; Keunggulan
        </h3>
        <div className="space-y-5 mb-6">
          <div>
            <label className={labelCls}>Judul Tentang</label>
            <input className={inputCls} type="text" value={landing.aboutTitle} onChange={(e) => set({ aboutTitle: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Subjudul Tentang</label>
            <textarea className={inputCls} rows={2} value={landing.aboutSubtitle} onChange={(e) => set({ aboutSubtitle: e.target.value })} />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h4 className="font-label-md text-label-md text-on-surface font-bold">Fitur / Keunggulan (3 kartu)</h4>
          <button
            type="button"
            onClick={addFeature}
            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-label-sm text-label-sm font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Tambah
          </button>
        </div>
        <div className="space-y-4">
          {landing.features.map((f, i) => (
            <div key={i} className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">Fitur {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="text-error hover:bg-error-container/40 rounded-lg p-1 transition-colors"
                  title="Hapus fitur"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
              <div>
                <label className={labelCls}>Icon</label>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => updateFeature(i, 'icon', icon)}
                      title={icon}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                        f.icon === icon
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              <input
                className={inputCls}
                type="text"
                placeholder="Judul fitur"
                value={f.title}
                onChange={(e) => updateFeature(i, 'title', e.target.value)}
              />
              <textarea
                className={inputCls}
                rows={2}
                placeholder="Deskripsi fitur"
                value={f.desc}
                onChange={(e) => updateFeature(i, 'desc', e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Location text */}
      <section className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">location_on</span>
          Teks Section Lokasi
        </h3>
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Judul Lokasi</label>
            <input className={inputCls} type="text" value={landing.locationTitle} onChange={(e) => set({ locationTitle: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Subjudul Lokasi</label>
            <textarea className={inputCls} rows={3} value={landing.locationSubtitle} onChange={(e) => set({ locationSubtitle: e.target.value })} />
          </div>
        </div>
      </section>
    </div>
  );
};

// ─── Main FarmSettingsPage ───────────────────────────────────────────────────
const FarmSettingsPage = ({ settings, onSave, defaultTab = 'profil' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const akunSaveRef = useRef(null);

  // Fetch fresh settings from API when profil/landing tab opens
  useEffect(() => {
    if (activeTab === 'profil' || activeTab === 'landing') {
      const loadSettings = async () => {
        try {
          const response = await farmSettingAPI.getPublic();
          if (response.status === 200 && response.data) {
            setLocalSettings((prev) => ({ ...prev, ...response.data }));
          }
        } catch (err) {
          console.error('Failed to load settings:', err);
        }
      };
      loadSettings();
    }
  }, [activeTab]);

  const handleChange = (key, value) => {
    if (key.startsWith('admin.')) {
      const adminKey = key.replace('admin.', '');
      setLocalSettings((prev) => ({ ...prev, admin: { ...prev.admin, [adminKey]: value } }));
    } else {
      setLocalSettings((prev) => ({ ...prev, [key]: value }));
    }
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (activeTab === 'profil') {
        const payload = {
          farm_name: localSettings.farm_name || '',
          tagline: localSettings.tagline || '',
          description: localSettings.description || '',
          whatsapp_number: localSettings.whatsapp_number || '',
          visiting_hours: localSettings.visiting_hours || '',
          address: localSettings.address || '',
          google_maps_url: localSettings.google_maps_url || '',
          truck_access_note: localSettings.truck_access_note || '',
        };
        const response = await farmSettingAPI.update(payload);
        if (response?.data) {
          setLocalSettings((prev) => ({ ...prev, ...response.data }));
        }
      } else if (activeTab === 'akun') {
        const admin = localSettings.admin || {};
        const changedProfile = {};
        if (admin.name !== undefined && admin.name !== null && admin.name !== '') changedProfile.name = admin.name;
        if (admin.email !== undefined && admin.email !== null && admin.email !== '') changedProfile.email = admin.email;
        if (admin.avatar !== undefined && admin.avatar !== null) changedProfile.photo_url = admin.avatar;
        if (Object.keys(changedProfile).length > 0) {
          await authAPI.updateProfile(changedProfile);
        }
        if (typeof akunSaveRef.current === 'function') {
          const result = await akunSaveRef.current();
          if (!result.ok) {
            alert(result.error || 'Gagal memperbarui akun');
            setIsSaving(false);
            return;
          }
        }
        if (Object.keys(changedProfile).length > 0) {
          alert('Profil akun berhasil diperbarui!');
        } else if (admin.email === '' && admin.name === '') {
          alert('Data akun berhasil diperbarui!');
        }
      } else if (activeTab === 'rekening') {
        // Rekening disimpan per-item via API; simpan hanya metadata ui lokal.
        onSave(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        setIsSaving(false);
        return;
      } else if (activeTab === 'landing') {
        const landingPayload = getLandingSettings(localSettings.landing);
        saveLandingSettings(landingPayload);
        await farmSettingAPI.update({ landing: landingPayload });
        setLocalSettings((prev) => ({ ...prev, landing: landingPayload }));
        onSave(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        setIsSaving(false);
        return;
      }
      onSave(localSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Gagal menyimpan pengaturan: ' + (error?.response?.data?.message || error?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const tabLabels = {
    profil: 'Simpan Profil Kandang',
    rekening: 'Simpan Rekening',
    akun: 'Perbarui Akun & Keamanan',
    landing: 'Simpan Konten Landing Page',
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-6 md:p-8 max-w-container-max mx-auto w-full">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-outline-variant/20 mb-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 font-label-md text-label-md whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-on-surface-variant hover:text-primary font-medium'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'profil' && <ProfilTab settings={localSettings} onChange={handleChange} />}
            {activeTab === 'rekening' && <RekeningTab settings={localSettings} onChange={handleChange} />}
            {activeTab === 'landing' && <LandingTab settings={localSettings} onChange={handleChange} />}
            {activeTab === 'akun' && (
              <AkunTab
                settings={localSettings}
                onChange={handleChange}
                registerSave={(fn) => { akunSaveRef.current = fn; }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 px-6 md:px-8 py-4 flex justify-end gap-4 z-30 shadow-[0_-4px_20px_rgba(15,23,42,0.04)]">
        <button
          className="px-6 py-2.5 rounded-full border border-outline-variant font-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm font-semibold"
          onClick={() => setLocalSettings(settings)}
        >
          Batal
        </button>
       <button
          onClick={handleSave}
          disabled={isSaving || saved}
          className={`px-6 py-2.5 rounded-full bg-[#2D6A4F] text-white font-label-md hover:bg-[#23533e] transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200 flex items-center gap-2 text-sm font-bold ${
            saved ? 'opacity-80' : ''
          }`}
        >
          {saved ? (
            <>
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Tersimpan!
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              {tabLabels[activeTab]}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FarmSettingsPage;
