import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const ProfilePage = ({ onProfileUpdated }) => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('admin_user') || 'null');
    } catch {
      user = null;
    }
    if (user) {
      setProfile((prev) => ({ ...prev, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
    }
    authAPI.getProfile()
      .then((res) => {
        const u = res?.data?.user;
        if (u) {
          setProfile((prev) => ({ ...prev, name: u.name || '', email: u.email || '', phone: u.phone || '' }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const profileData = {};
      if (profile.name) profileData.name = profile.name;
      if (profile.email) profileData.email = profile.email;
      if (profile.phone) profileData.phone = profile.phone;

      let profileUpdated = false;
      if (Object.keys(profileData).length > 0) {
        const res = await authAPI.updateProfile(profileData);
        if (res?.data?.user) {
          localStorage.setItem('admin_user', JSON.stringify(res.data.user));
          profileUpdated = true;
          if (typeof onProfileUpdated === 'function') onProfileUpdated(res.data.user);
        }
      }

      if (pwForm.newPw || pwForm.current) {
        if (pwForm.newPw !== pwForm.confirm) {
          alert('Konfirmasi password baru tidak cocok');
          setIsSaving(false);
          return;
        }
        if (pwForm.newPw.length < 6) {
          alert('Password baru minimal 6 karakter');
          setIsSaving(false);
          return;
        }
        await authAPI.updatePassword({
          old_password: pwForm.current,
          new_password: pwForm.newPw,
        });
        setPwForm({ current: '', newPw: '', confirm: '' });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      alert('Gagal menyimpan: ' + (error?.response?.data?.message || error?.message || 'Terjadi kesalahan'));
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-body-md text-on-surface focus:border-[#1E3A2B] focus:ring-2 focus:ring-[#1E3A2B]/20 outline-none transition-all text-sm';
  const fieldCls = 'block font-label-sm text-label-sm text-on-surface-variant mb-1.5 font-semibold';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1000px] mx-auto space-y-4 sm:space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-headline-lg text-xl sm:text-2xl md:text-headline-lg text-on-surface font-bold">Profil &amp; Keamanan Akun</h2>
        <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">Kelola informasi data diri dan kata sandi login Anda.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 shadow-sm">
        {/* ── Bagian 1: Data Diri Petugas ── */}
        <section>
          <h3 className="font-headline-md text-base sm:text-lg md:text-headline-md text-on-surface font-bold mb-4 sm:mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1E3A2B]">person</span>
            Data Diri Petugas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className={fieldCls}>Nama Lengkap</label>
              <input className={inputCls} type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Nama lengkap" />
            </div>
            <div>
              <label className={fieldCls}>Nomor WhatsApp / Kontak</label>
              <input className={inputCls} type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Contoh: 081234567890" />
            </div>
            <div>
              <label className={fieldCls}>Email Login</label>
              <input className={inputCls} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="email@kandas.com" />
            </div>
            <div>
              <label className={fieldCls}>Peran / Jabatan</label>
              <input className={inputCls} type="text" value="Staff Operasional Lapangan" readOnly />
            </div>
          </div>
        </section>

        <div className="border-t border-slate-200" />

        {/* ── Bagian 2: Ganti Kata Sandi ── */}
        <section>
          <h3 className="font-headline-md text-base sm:text-lg md:text-headline-md text-on-surface font-bold mb-4 sm:mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1E3A2B]">lock</span>
            Ganti Kata Sandi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className={fieldCls}>Password Saat Ini</label>
              <div className="relative">
                <input className={inputCls} type={showCurrent ? 'text' : 'password'} value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} placeholder="Password saat ini" />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[18px]">{showCurrent ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div>
              <label className={fieldCls}>Password Baru</label>
              <div className="relative">
                <input className={inputCls} type={showNew ? 'text' : 'password'} value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} placeholder="Password baru" />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[18px]">{showNew ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div>
              <label className={fieldCls}>Konfirmasi Password Baru</label>
              <div className="relative">
                <input className={inputCls} type={showConfirm ? 'text' : 'password'} value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Ulangi password baru" />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[18px]">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tombol Aksi */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving || saved}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#1E3A2B] text-white font-bold text-xs sm:text-sm hover:bg-[#15301f] transition-all shadow-sm active:scale-[0.99] disabled:opacity-70"
          >
            {saved ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>Tersimpan!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
