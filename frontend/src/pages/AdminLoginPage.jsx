import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BullLogo from '../components/BullLogo';
import { authAPI } from '../services/api';

const AdminLoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const isAuthenticated = token && token !== 'undefined' && token !== 'null';
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login(form.username, form.password);
      
      if (response.status === 200 && response.data) {
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        navigate('/admin/dashboard');
      } else {
        setError('Login gagal. Periksa email dan password Anda.');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah. Coba: admin@kandas.com / kandas2026');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-body-md text-on-surface p-4 sm:p-6 md:p-margin-desktop"
      style={{ backgroundColor: '#F4F9F5' }}
    >
      <main className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-2xl ambient-shadow p-5 sm:p-8 md:p-10 border border-outline-variant/30 flex flex-col gap-6 sm:gap-8 transition-all duration-300 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
            <div className="mb-1 sm:mb-2">
              <BullLogo size={80} className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>
            <div>
              <h1 className="font-headline-md text-xl sm:text-headline-md text-primary mb-1.5 sm:mb-2 font-bold">
                Login Pengelola KANDAS
              </h1>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                Akses panel inventaris untuk mengelola stok sapi, harga, dan update penjualan.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl flex items-center gap-3 text-body-md text-xs sm:text-sm animate-fade-in">
              <span className="material-symbols-outlined text-error">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-4 sm:gap-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="font-label-md text-xs sm:text-sm text-on-surface font-semibold" htmlFor="username">
                Username / Email
              </label>
              <div className="relative flex items-center group">
                <span className="material-symbols-outlined absolute left-4 text-outline group-focus-within:text-primary transition-colors z-10 text-[20px]">
                  person
                </span>
                <input
                  className="w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-surface rounded-2xl border border-outline-variant text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none transition-all text-xs sm:text-sm"
                  id="username"
                  placeholder="admin@kandas.com"
                  required
                  type="email"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="font-label-md text-xs sm:text-sm text-on-surface font-semibold" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center group">
                <span className="material-symbols-outlined absolute left-4 text-outline group-focus-within:text-primary transition-colors z-10 text-[20px]">
                  lock
                </span>
                <input
                  className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-2.5 sm:py-3 bg-surface rounded-2xl border border-outline-variant text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none transition-all text-xs sm:text-sm"
                  id="password"
                  placeholder="Password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 text-outline hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  className="w-4 h-4 rounded text-primary-container border-outline-variant focus:ring-primary-container cursor-pointer"
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                />
                <span className="font-label-md text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Ingat Perangkat Ini
                </span>
              </label>
              <a className="font-label-md text-primary hover:text-primary-container transition-colors" href="#">
                Lupa Password?
              </a>
            </div>

            {/* Submit Button (Centered without arrow icon) */}
            <button
              className="w-full py-3 sm:py-3.5 bg-primary-container hover:bg-primary text-on-primary rounded-full font-label-md text-xs sm:text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center text-center disabled:opacity-70 active:scale-98"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-on-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Memverifikasi...
                </span>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-6 border-t border-outline-variant/30 text-center">
            <p className="font-label-sm text-label-sm text-outline">
              Sistem Manajemen Inventaris &amp; Penjualan Ternak Terpadu
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLoginPage;
