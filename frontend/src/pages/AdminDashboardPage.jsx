import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import BullLogo from '../components/BullLogo';
import AddEditCattleModal from '../components/AddEditCattleModal';
import CattleDetailModal from '../components/CattleDetailModal';
import SalesReportPage from './SalesReportPage';
import FarmSettingsPage from './FarmSettingsPage';
import ProfilePage from './ProfilePage';
import HelpCenterPage from './HelpCenterPage';
import { formatPrice } from '../data/cattleData';
import { formatDateIndo, formatVisitSchedule } from '../utils/dateFormatter';
import { cattleAPI, notificationAPI } from '../services/api';
import { getCattleImageUrl, FALLBACK_CATTLE_IMAGE, resolveMediaUrl } from '../utils/imageUrl';

const ITEMS_PER_PAGE = 8;

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, unit, icon, color }) => (
  <div className="bg-surface rounded-xl p-6 border border-outline-variant/20 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
    <div
      className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"
      style={{ backgroundColor: `${color}0D` }}
    />
    <div className="flex items-start justify-between">
      <div>
        <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">{label}</p>
        <h3 className="font-headline-lg text-headline-lg font-bold" style={{ color }}>
          {value}{' '}
          <span className="font-body-md text-body-md text-on-surface-variant font-normal">{unit}</span>
        </h3>
      </div>
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusBadge = (status) => {
  if (status === 'Tersedia')
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/30 text-secondary font-label-sm text-label-sm font-bold border border-secondary/20">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
        Tersedia
      </span>
    );
  if (status === 'Booked')
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/10 text-tertiary-container font-label-sm text-label-sm font-bold border border-tertiary-container/20">
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
        Booked
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-outline/10 text-outline font-label-sm text-label-sm font-bold border border-outline/20">
      <span className="w-1.5 h-1.5 rounded-full bg-outline" />
      Terjual
    </span>
  );
};

// ─── Cattle List View ────────────────────────────────────────────────────────
const CattleListView = ({ cattleList, dashStats, onAddCattle, onEditCattle, onDeleteCattle, farmSettings }) => {
  const searchQuery = '';
  const [filterFase, setFilterFase] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCattle, setEditingCattle] = useState(null);
  const [detailCattle, setDetailCattle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = cattleList.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.breed || '').toLowerCase().includes(q);
    const matchFase = filterFase === 'semua' || c.category.toLowerCase() === filterFase;
    const matchStatus = filterStatus === 'semua' || c.status.toLowerCase() === filterStatus;
    return matchSearch && matchFase && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalStok = cattleList.length;
  const tersedia = cattleList.filter((c) => c.status === 'Tersedia').length;
  const booked = cattleList.filter((c) => c.status === 'Booked').length;
  const terjual = cattleList.filter((c) => c.status === 'Terjual').length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 sm:space-y-8 pb-20">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard label="Total Stok Sapi" value={totalStok} unit="Ekor" icon="dataset" color="#2d6a4f" />
        <KpiCard label="Sapi Tersedia" value={tersedia} unit="Ekor" icon="check_circle" color="#006c48" />
        <KpiCard label="Status Booked" value={booked} unit="Ekor" icon="shopping_cart" color="#914d00" />
        <KpiCard label="Sapi Terjual" value={terjual} unit="Ekor" icon="sell" color="#707973" />
      </div>

      {/* Table Card */}
      <div className="bg-surface rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {/* Action Bar */}
        <div className="p-4 sm:p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 bg-surface-container-lowest">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <span className="font-label-md text-label-md text-on-surface-variant font-semibold text-xs sm:text-sm">Filter:</span>
            <select
              className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 sm:px-4 py-2 font-body-md text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none flex-1 sm:flex-initial"
              value={filterFase}
              onChange={(e) => {
                setFilterFase(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="semua">Semua Fase</option>
              <option value="pedet">Pedet</option>
              <option value="bakalan">Bakalan</option>
              <option value="dewasa">Dewasa</option>
            </select>
            <select
              className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 sm:px-4 py-2 font-body-md text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none flex-1 sm:flex-initial"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="semua">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="booked">Booked</option>
              <option value="terjual">Terjual</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-[#2D6A4F] hover:bg-[#23533e] text-white font-label-md text-xs sm:text-sm py-2.5 sm:py-3 px-5 sm:px-6 rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 font-bold"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              add
            </span>
            Tambah Sapi Baru
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[1120px]">
            <colgroup>
              <col style={{ width: '12%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                {['Kode ID', 'Info Sapi', 'Spesifikasi', 'Harga Jual', 'Status', 'Aksi'].map((h, i) => (
                  <th
                    key={h}
                    className={`py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider ${
                      i === 4 ? 'text-center' : i === 5 ? 'text-center' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginated.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="font-label-md text-label-md font-bold text-on-surface whitespace-nowrap">{c.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <img
                        className="w-14 h-14 rounded-lg object-cover border border-outline-variant/20 shadow-sm"
                        src={getCattleImageUrl(
                          c.media_urls?.length
                            ? c.media_urls
                            : c.image || c.photo_url
                        )}
                        alt={c.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_CATTLE_IMAGE;
                        }}
                      />
                      <div>
                        <p className="font-label-md text-label-md font-bold text-on-surface">{c.name}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{c.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-body-md text-body-md text-on-surface">{c.age || c.category}</span>
                      <span className="data-chip w-fit font-label-sm text-label-sm rounded px-2 py-0.5">
                        {c.weight} Kg
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-label-md text-label-md font-bold text-on-surface whitespace-nowrap">
                      {formatPrice(c.price)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">{statusBadge(c.status)}</td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDetailCattle(c)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-blue-600 hover:bg-surface-variant/50 transition-colors"
                        title="Detail"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        onClick={() => setEditingCattle(c)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-blue-600 hover:bg-surface-variant/50 transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(c)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3">search_off</span>
              <p className="font-headline-md text-headline-md">Tidak ada data ditemukan</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Menampilkan {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}-
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} Data
          </p>
          <div className="flex gap-1">
            <button
              className="p-1.5 rounded border border-outline-variant/30 text-on-surface-variant disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded font-label-sm text-label-sm transition-colors ${
                  page === currentPage
                    ? 'bg-primary-container text-on-primary font-bold'
                    : 'hover:bg-surface-container border border-transparent text-on-surface'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              className="p-1.5 rounded border border-outline-variant/30 text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddEditCattleModal
          cattleList={cattleList}
          onClose={() => setShowAddModal(false)}
          onSave={(d) => {
            onAddCattle(d);
            setShowAddModal(false);
          }}
        />
      )}
      {editingCattle && (
        <AddEditCattleModal
          cattleList={cattleList}
          onClose={() => setEditingCattle(null)}
          onSave={(d) => {
            onEditCattle(d);
            setEditingCattle(null);
          }}
          initialData={editingCattle}
        />
      )}
      {detailCattle && <CattleDetailModal cattle={detailCattle} onClose={() => setDetailCattle(null)} farmSettings={farmSettings} isAdmin={true} onEdit={(c) => { setDetailCattle(null); setEditingCattle(c); }} />}

      {deleteConfirm && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 bg-surface rounded-2xl p-8 max-w-sm w-full m-auto shadow-2xl animate-fade-in border border-outline-variant/30">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[32px]">delete_forever</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Hapus Data Sapi?</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Data <strong>{deleteConfirm.name}</strong> (ID: {deleteConfirm.id}) akan dihapus permanen.
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-full border border-outline font-label-md text-label-md text-on-surface hover:bg-surface-variant/50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteCattle(deleteConfirm.db_id || deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-3 rounded-full bg-error text-on-error font-label-md text-label-md hover:opacity-90 transition-all shadow-sm"
              >
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

// ─── Main AdminDashboardPage ──────────────────────────────────────────────────
const getNavItems = (isStaff) => {
  if (isStaff) {
    return [
      { key: 'daftar', icon: 'list_alt', label: 'Daftar Sapi' },
      { key: 'tambah', icon: 'add_circle', label: 'Tambah Sapi Baru' },
      { key: 'laporan', icon: 'payments', label: 'Laporan Penjualan' },
      { key: 'profil', icon: 'person', label: 'Profil Saya' },
    ];
  }
  return [
    { key: 'daftar', icon: 'list_alt', label: 'Daftar Sapi' },
    { key: 'laporan', icon: 'payments', label: 'Laporan Penjualan' },
    { key: 'pengaturan', icon: 'settings', label: 'Pengaturan Kandang' },
  ];
};

const PAGE_TITLES = {
  daftar: { title: 'Inventaris Sapi', subtitle: 'Kelola seluruh stok sapi dari satu tempat' },
  laporan: { title: 'Laporan Penjualan & Transaksi', subtitle: 'Rekapitulasi penjualan, status DP, dan riwayat pelunasan' },
  pengaturan: { title: 'Pengaturan Kandang & Profil', subtitle: 'Kelola informasi operasional, rekening DP, dan akun admin' },
  profil: { title: 'Profil Saya', subtitle: 'Kelola data diri dan keamanan akun Anda' },
  bantuan: { title: 'Pusat Bantuan & Panduan Kandang', subtitle: 'Pedoman standar kelayakan sapi kurban, SOP alur inventaris, dan kontak teknis' },
};

const initialNotifications = [
  {
    id: 1,
    title: 'DP Sapi Limousin Diterima',
    desc: 'Invoice #INV-1102 dari CV. Berkah Daging telah membayar DP Rp 12.600.000.',
    time: '5 menit lalu',
    unread: true,
    icon: 'payments',
    iconColor: 'text-[#2D6A4F]',
    iconBg: 'bg-emerald-100',
  },
  {
    id: 2,
    title: 'Pertanyaan Kurban Baru',
    desc: 'Bpk. Wahyu Santoso menanyakan ketersediaan sapi jenis Brahman Cross via WhatsApp.',
    time: '1 jam lalu',
    unread: true,
    icon: 'chat',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    id: 3,
    title: 'Pelunasan Transaksi',
    desc: 'Invoice #INV-1103 (Koperasi Tani Jaya) status lunas Rp 35.200.000.',
    time: '3 jam lalu',
    unread: false,
    icon: 'check_circle',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: 4,
    title: 'Jadwal Kunjungan Survei',
    desc: 'Pesantren Al-Falah menjadwalkan survei fisik kandang besok pukul 09:00 WIB.',
    time: 'Kemarin',
    unread: false,
    icon: 'event',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
];

const AdminDashboardPage = ({
  cattleList: initialCattleList,
  onAddCattle,
  onEditCattle,
  onDeleteCattle,
  transactions,
  transactionSummary,
  onTransactionChange,
  onSaveSettings,
  farmSettings,
}) => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('daftar');
  const [showAddModal, setShowAddModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState('profil');
  const [cattleList, setCattleList] = useState(initialCattleList || []);

  const isStaff = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('admin_user') || 'null');
      return (user && user.role === 'staff');
    } catch {
      return false;
    }
  })();
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user') || 'null');
    } catch {
      return null;
    }
  })();
  const navItems = getNavItems(isStaff);

  const [dashStats, setDashStats] = useState({ total_stok: 0, tersedia: 0, booked: 0, terjual_bulan_ini: 0 });

  // Load ALL cattle from admin API on mount
  const loadCattle = async () => {
    try {
      const response = await cattleAPI.getAllAdmin();
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
          return {
            id: c.ear_tag || `S-${c.id}`,
            db_id: c.id,
            ear_tag: c.ear_tag || `S-${c.id}`,
            name: c.name,
            breed: c.breed || 'Unknown',
            gender: c.gender || 'Jantan',
            weight: c.weight || 0,
            age: c.age_phase || c.category || 'Unknown',
            age_phase: c.age_phase || '',
            price: c.price || 0,
            status: c.status || 'Tersedia',
            kondisi: c.kondisi || 'Kondisi Prima',
            category: c.age_phase || c.category || 'Dewasa',
            feed_pattern: c.feed_pattern || '',
            care_notes: c.care_notes || '',
            media_urls: absoluteMediaUrls,
            image: absoluteMediaUrls[0] || FALLBACK_CATTLE_IMAGE,
          };
        });
        setCattleList(mappedCattle);
        if (response.stats) {
          setDashStats(response.stats);
        }
      }
    } catch (error) {
      console.error('Failed to load cattle:', error);
      setCattleList(initialCattleList || []);
    }
  };

  useEffect(() => {
    loadCattle();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialCattleList && initialCattleList.length > 0) {
      setCattleList(initialCattleList);
    }
  }, [initialCattleList]);

  // Refresh transactions on mount (token guaranteed present inside ProtectedRoute)
  useEffect(() => {
    if (typeof onTransactionChange === 'function') {
      onTransactionChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationAPI.getAll();
        if (response.status === 200 && response.data) {
          const mapped = (response.data.notifications || []).map(vr => ({
            id: vr.id,
            title: `Jadwal Kunjungan: ${vr.buyer_name}`,
            desc: `Tertarik pada ${vr.cattle_name || 'sapi'}. Tanggal: ${formatVisitSchedule(vr.visit_date, vr.visit_time)}`,
            time: formatDateIndo(vr.created_at),
            unread: !vr.is_read,
            icon: 'event',
            iconColor: 'text-[#2D6A4F]',
            iconBg: 'bg-emerald-100',
            visitRequestId: vr.id,
          }));
          setNotifications(mapped);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    loadNotifications();
  }, []);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markNotifRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    try {
      await notificationAPI.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const deleteNotif = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationAPI.delete(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const deleteAllNotifs = () => {
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    ids.forEach((id) => {
      notificationAPI.delete(id).catch((err) => console.error('Failed to delete:', err));
    });
  };

  const markAllNotifsRead = () => {
    const unreadIds = notifications.filter((n) => n.unread).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    unreadIds.forEach((id) => {
      notificationAPI.markAsRead(id).catch((err) => console.error('Failed to mark as read:', err));
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentPage = PAGE_TITLES[activeNav] || PAGE_TITLES.daftar;

  const navigateToSettingsTab = (tab) => {
    setSettingsDefaultTab(tab);
    setActiveNav('pengaturan');
    setShowProfileMenu(false);
  };

  return (
    <div className="flex bg-surface text-on-surface h-screen overflow-hidden font-body-md">
      {/* ── Mobile Sidebar Backdrop ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`w-64 bg-surface-container-low h-screen fixed left-0 top-0 border-r border-outline-variant/20 shadow-xl md:shadow-sm flex flex-col p-6 z-50 md:z-20 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Mobile Close Button */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BullLogo size={40} color="#2D6A4F" />
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-[#2D6A4F] leading-tight">KANDAS</h1>
              <p className="text-on-surface-variant font-label-sm text-label-sm">Kandang Dastro</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-surface-container-high transition-colors"
            aria-label="Tutup sidebar"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === 'tambah') {
                    setShowAddModal(true);
                  } else {
                    setActiveNav(item.key);
                  }
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 text-left ${
                  isActive && item.key !== 'tambah'
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1'
                }`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 border-t border-outline-variant/20 space-y-1">
          <button
            onClick={() => {
              setActiveNav('bantuan');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left font-bold ${
              activeNav === 'bantuan'
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={activeNav === 'bantuan' ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              help
            </span>
            <span className="font-label-md text-label-md">Bantuan</span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_user');
              navigate('/admin/login', { replace: true });
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-error hover:bg-error-container/50 rounded-xl hover:translate-x-1 transition-all duration-200 active:scale-95 text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ml-0 md:ml-64 flex-1 flex flex-col h-screen overflow-hidden bg-background w-full min-w-0">
        {/* Top Header */}
        <header className="bg-surface/95 border-b border-outline-variant/10 flex justify-between items-center w-full px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 z-30 sticky top-0 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors flex-shrink-0"
              aria-label="Buka Menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <div className="min-w-0">
              <h2 className="font-headline-md text-base sm:text-lg md:text-headline-md font-bold text-on-surface truncate">{currentPage.title}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-xs sm:text-sm hidden lg:block">
                {currentPage.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* ── Notification Dropdown ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors relative ${
                  showNotifications
                    ? 'bg-surface-variant/50 text-on-surface'
                    : 'text-slate-600 hover:bg-surface-variant/50 hover:text-on-surface'
                }`}
                title="Notifikasi"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden z-50 animate-fade-in">
                  <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright">
                    <div className="flex items-center gap-2">
                      <h4 className="font-headline-md font-bold text-sm text-on-surface">Notifikasi</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-error font-bold text-xs rounded-full">
                          {unreadCount} Baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        className="text-xs text-[#2D6A4F] font-bold hover:underline"
                      >
                        Tandai Dibaca
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-outline-variant/10 max-h-[360px] overflow-y-auto modal-scroll">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotifRead(n.id)}
                        className={`group p-3 rounded-2xl transition-colors hover:bg-slate-50 flex items-start justify-between gap-3 cursor-pointer ${
                          n.unread ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl ${n.iconBg} ${n.iconColor} flex items-center justify-center shrink-0`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-start gap-2">
                              <p className="text-xs font-bold text-on-surface truncate">{n.title}</p>
                              {n.unread && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full ring-2 ring-white shrink-0 mt-1" />}
                            </div>
                            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">{n.desc}</p>
                            <span className="text-[10px] text-outline">{n.time}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {n.unread && (
                            <button
                              title="Tandai dibaca"
                              onClick={(e) => { e.stopPropagation(); markNotifRead(n.id); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-surface-variant/50 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">done_all</span>
                            </button>
                          )}
                          <button
                            title="Hapus"
                            onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 border-t border-outline-variant/20 bg-surface-bright flex items-center justify-between px-3">
                    {notifications.length > 0 ? (
                      <button
                        onClick={deleteAllNotifs}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        Hapus Semua
                      </button>
                    ) : (
                      <span className="text-xs text-outline">Tidak ada notifikasi</span>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-bold text-[#2D6A4F] hover:underline"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-outline-variant/30" />

            {/* ── Admin Profile Dropdown ── */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-surface-variant/40 transition-all select-none"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container flex items-center justify-center border-2 border-[#2D6A4F]/30 shadow-sm">
                  {farmSettings?.admin?.avatar ? (
                    <img
                      src={farmSettings.admin.avatar}
                      alt="Admin"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-on-primary-container">person</span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-label-md text-label-md text-on-surface font-bold leading-tight">
                    {farmSettings?.admin?.name || currentUser?.name || 'Admin Pusat'}
                  </p>
                  <p className="font-label-sm text-xs text-on-surface-variant">
                    {isStaff ? 'Staff Operasional' : 'Administrator'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-sm hidden md:block">
                  {showProfileMenu ? 'expand_less' : 'expand_more'}
                </span>
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden z-50 animate-fade-in divide-y divide-outline-variant/10">
                  <div className="p-4 bg-surface-bright">
                    <p className="font-bold text-sm text-on-surface">{farmSettings?.admin?.name || currentUser?.name || 'Admin Pusat'}</p>
                    <p className="text-xs text-on-surface-variant">{farmSettings?.admin?.email || currentUser?.email || 'admin@kandas.id'}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-md">
                      {isStaff ? 'Staff Operasional' : 'Administrator'}
                    </span>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    {isStaff ? (
                      <button
                        onClick={() => { setActiveNav('profil'); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high rounded-xl transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-lg text-[#2D6A4F]">person</span>
                        Edit Profil Saya
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => navigateToSettingsTab('profil')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high rounded-xl transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-lg text-[#2D6A4F]">store</span>
                          Edit Profil Kandang
                        </button>
                        <button
                          onClick={() => navigateToSettingsTab('rekening')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high rounded-xl transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-lg text-[#2D6A4F]">account_balance</span>
                          Rekening Bank &amp; QRIS
                        </button>
                        <button
                          onClick={() => navigateToSettingsTab('akun')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high rounded-xl transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-lg text-[#2D6A4F]">lock</span>
                          Keamanan Akun &amp; Password
                        </button>
                      </>
                    )}
                  </div>

                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        localStorage.removeItem('admin_token');
                        localStorage.removeItem('admin_user');
                        navigate('/admin/login', { replace: true });
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-error hover:bg-red-50 rounded-xl transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-surface-bright scroll-gutter-stable">
          {activeNav === 'daftar' && (
            <CattleListView
              cattleList={cattleList}
              dashStats={dashStats}
              onAddCattle={onAddCattle}
              onEditCattle={onEditCattle}
              onDeleteCattle={onDeleteCattle}
              farmSettings={farmSettings}
            />
          )}
          {activeNav === 'laporan' && <SalesReportPage transactions={transactions} summary={transactionSummary} onTransactionChange={onTransactionChange} />}
          {!isStaff && activeNav === 'pengaturan' && (
            <FarmSettingsPage
              key={settingsDefaultTab}
              defaultTab={settingsDefaultTab}
              settings={farmSettings}
              onSave={onSaveSettings}
            />
          )}
          {isStaff && activeNav === 'profil' && <ProfilePage />}
          {activeNav === 'bantuan' && <HelpCenterPage />}
        </div>
      </main>

      {showAddModal && (
        <AddEditCattleModal
          cattleList={cattleList}
          onClose={() => setShowAddModal(false)}
          onSave={(d) => {
            onAddCattle(d);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
