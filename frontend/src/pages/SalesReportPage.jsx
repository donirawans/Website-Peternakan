import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, Trash2 } from 'lucide-react';
import { formatPrice } from '../data/cattleData';
import { formatDateIndo } from '../utils/dateFormatter';
import { transactionAPI, cattleAPI } from '../services/api';
import StrukInvoiceModal from '../components/StrukInvoiceModal';

const STATUS_FILTERS = ['Semua', 'Lunas', 'DP Terbayar', 'Menunggu Konfirmasi'];

const statusBadge = (status) => {
  if (status === 'Lunas')
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-[#e8f5e9] text-[#2e7d32]">
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#2e7d32]" />
        Lunas
      </span>
    );
  if (status === 'DP Terbayar')
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-[#fff8e1] text-[#f57f17]">
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#f57f17]" />
        DP Terbayar
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant">
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-outline" />
      Menunggu Konfirmasi
    </span>
  );
};

const ITEMS_PER_PAGE = 10;

const AddTransactionModal = ({ cattleList, onClose, onSaved }) => {
  const [form, setForm] = useState({
    cattle_id: '',
    buyer_name: '',
    buyer_phone: '',
    buyer_address: '',
    total_amount: '',
    dp_amount: '',
    payment_method: 'Transfer BCA',
    status: 'Menunggu Konfirmasi',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const availableCattle = cattleList.filter((c) => c.status === 'Tersedia' || c.status === 'Booked');

  const handleCattleSelect = (cattleId) => {
    const selected = availableCattle.find((c) => c.db_id === Number(cattleId) || c.id === cattleId);
    if (selected) {
      setForm((prev) => ({
        ...prev,
        cattle_id: selected.db_id || selected.id,
        total_amount: selected.price || '',
      }));
    } else {
      setForm((prev) => ({ ...prev, cattle_id: cattleId, total_amount: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cattle_id || !form.buyer_name || !form.total_amount) return;

    try {
      setSubmitting(true);
      await transactionAPI.create({
        cattle_id: Number(form.cattle_id),
        buyer_name: form.buyer_name,
        buyer_phone: form.buyer_phone,
        buyer_address: form.buyer_address,
        total_amount: Number(String(form.total_amount).replace(/\./g, '').replace(/\D/g, '')),
        dp_amount: form.dp_amount ? Number(String(form.dp_amount).replace(/\./g, '').replace(/\D/g, '')) : 0,
        payment_method: form.payment_method,
        status: form.status,
        transaction_date: form.transaction_date,
        notes: form.notes,
      });
      onSaved();
      onClose();
    } catch (error) {
      alert('Gagal menyimpan transaksi: ' + (error?.response?.data?.message || error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatInput = (val) => {
    const num = String(val).replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden m-auto flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Catat Transaksi Baru</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 modal-scroll">
          {/* Pilih Sapi */}
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Pilih Sapi *</label>
            <select required className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" value={form.cattle_id} onChange={(e) => handleCattleSelect(e.target.value)}>
              <option value="">Pilih sapi...</option>
              {availableCattle.map((c) => (
                <option key={c.db_id || c.id} value={c.db_id || c.id}>{c.id} - {c.name} ({c.status}) - {formatPrice(c.price)}</option>
              ))}
            </select>
          </div>

          {/* Nama & Telepon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Nama Pembeli *</label>
              <input required type="text" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Nama pembeli" value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">No. Telepon / WA</label>
              <input type="tel" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="08123456789" value={form.buyer_phone} onChange={(e) => setForm({ ...form, buyer_phone: e.target.value })} />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Asal Kota / Alamat</label>
            <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Contoh: Brebes, Jawa Tengah" value={form.buyer_address} onChange={(e) => setForm({ ...form, buyer_address: e.target.value })} />
          </div>

          {/* Harga & DP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Total Harga (Rp) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-bold">Rp</span>
                <input required type="text" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: formatInput(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Uang Muka / DP (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-bold">Rp</span>
                <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0 (jika DP)" value={form.dp_amount} onChange={(e) => setForm({ ...form, dp_amount: formatInput(e.target.value) })} />
              </div>
            </div>
          </div>

          {/* Metode & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Metode Pembayaran</label>
              <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                <option>Transfer BCA</option>
                <option>Transfer Mandiri</option>
                <option>Transfer BSI</option>
                <option>Tunai</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Status Transaksi *</label>
              <select required className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Menunggu Konfirmasi</option>
                <option>DP Terbayar</option>
                <option>Lunas</option>
              </select>
            </div>
          </div>

          {/* Tanggal & Catatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Tanggal Transaksi</label>
              <input type="date" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">Catatan</label>
              <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Catatan opsional" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant/20 bg-surface">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-container transition-all text-sm">Batal</button>
          <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 rounded-xl bg-[#134E35] text-white font-bold hover:bg-[#0E3D29] transition-all shadow-sm active:scale-[0.99] text-sm disabled:opacity-60">
            {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const SalesReportPage = ({ transactions: initialTransactions, summary, onTransactionChange }) => {
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [apiSummary, setApiSummary] = useState(summary || null);
  const [cattleList, setCattleList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [printStruk, setPrintStruk] = useState(null);

  useEffect(() => {
    setTransactions(initialTransactions || []);
  }, [initialTransactions]);

  useEffect(() => {
    setApiSummary(summary || null);
  }, [summary]);

  useEffect(() => {
    const loadCattle = async () => {
      try {
        const response = await cattleAPI.getAllAdmin();
        if (response.status === 200 && response.data) {
          setCattleList(response.data.map(c => ({
            id: c.ear_tag,
            db_id: c.id,
            name: c.name,
            breed: c.breed || 'Unknown',
            status: c.status || 'Tersedia',
            kondisi: c.kondisi || 'Kondisi Prima',
            price: c.price || 0,
          })));
        }
      } catch (err) {
        console.error('Failed to load cattle:', err);
      }
    };
    loadCattle();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchStatus = statusFilter === 'Semua' || t.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (t.buyer_name || '').toLowerCase().includes(q) ||
      (t.invoice_number || '').toLowerCase().includes(q) ||
      (t.cattle?.ear_tag || '').toLowerCase().includes(q) ||
      (t.cattle?.name || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const displaySummary = apiSummary || {
    total_revenue: 0,
    sold_count: 0,
    pending_count: 0,
    potential_pending_amount: 0,
    avg_transaction: 0,
  };

  const metrics = [
    {
      label: 'Total Pendapatan',
      value: formatPrice(displaySummary.total_revenue),
      icon: 'account_balance_wallet',
      iconBg: 'bg-primary-container/10',
      iconColor: 'text-primary-container',
    },
    {
      label: 'Total Ekor Terjual',
      value: `${displaySummary.sold_count} Ekor`,
      icon: 'cruelty_free',
      iconBg: 'bg-surface-container-highest',
      iconColor: 'text-on-surface',
    },
    {
      label: 'Menunggu Pelunasan / DP',
      value: `${displaySummary.pending_count} Ekor`,
      icon: 'pending_actions',
      iconBg: 'bg-[#fff8e1]',
      iconColor: 'text-[#f57f17]',
      accent: 'border-l-4 border-l-[#f57f17]',
    },
    {
      label: 'Rata-rata Transaksi',
      value: formatPrice(displaySummary.avg_transaction),
      icon: 'calculate',
      iconBg: 'bg-secondary-container',
      iconColor: 'text-on-secondary-container',
    },
  ];

  const handleExportCSV = () => {
    const headers = ['No Invoice', 'Tanggal', 'Pembeli', 'Telepon', 'Alamat', 'ID Sapi', 'Nama Sapi', 'Nominal', 'DP', 'Metode', 'Status'];
    const rows = filtered.map((t) => [
      `"${t.invoice_number || ''}"`,
      `"${t.transaction_date || ''}"`,
      `"${t.buyer_name || ''}"`,
      `"${t.buyer_phone || ''}"`,
      `"${t.buyer_address || ''}"`,
      `"${t.cattle?.ear_tag || ''}"`,
      `"${t.cattle?.name || ''}"`,
      t.total_amount || 0,
      t.dp_amount || 0,
      `"${t.payment_method || ''}"`,
      `"${t.status || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-penjualan-kandas.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data transaksi ini?')) {
      return;
    }
    try {
      await transactionAPI.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (onTransactionChange) {
        onTransactionChange();
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert('Gagal menghapus transaksi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewInvoice = (trx) => {
    setPrintStruk(trx);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Laporan Penjualan &amp; Transaksi</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Rekapitulasi penjualan sapi, status DP, dan riwayat pelunasan</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input className="pl-10 pr-4 py-2 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container text-body-md w-full md:w-56 transition-all outline-none text-sm" placeholder="Cari pembeli / invoice..." type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="relative">
            <select className="appearance-none pl-4 pr-10 py-2 rounded-xl border border-outline-variant bg-surface focus:ring-2 focus:ring-primary-container text-label-md font-label-md cursor-pointer outline-none text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#134E35] text-white px-5 py-2 rounded-full font-label-md text-label-md hover:bg-[#0E3D29] transition-all active:scale-95 shadow-sm font-bold">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Catat Transaksi
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-surface border border-outline-variant text-on-surface px-5 py-2 rounded-full font-label-md text-label-md hover:bg-surface-container transition-all active:scale-95 font-semibold">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, i) => (
          <div key={i} className={`bg-surface p-5 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow ${m.accent || ''}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.iconBg}`}>
                <span className={`material-symbols-outlined text-[20px] ${m.iconColor}`}>{m.icon}</span>
              </span>
            </div>
            <p className="font-headline-lg text-headline-lg font-bold text-on-surface">{m.value}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-surface rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-lowest">
                <th className="py-3.5 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase">Invoice</th>
                <th className="py-3.5 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase">Tanggal</th>
                <th className="py-3.5 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase">Pembeli</th>
                <th className="py-3.5 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase">Sapi</th>
                <th className="py-3.5 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase text-right">Nominal</th>
                <th className="py-3.5 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase text-right">DP</th>
                <th className="py-3.5 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase">Metode</th>
                <th className="py-3.5 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                <th className="py-3.5 px-5 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginated.map((t) => (
                <tr key={t.id} className="hover:bg-surface-container-lowest/50 transition-colors cursor-pointer" onClick={() => setSelectedInvoice(t)}>
                  <td className="py-3.5 px-5 font-label-md text-label-md font-bold text-primary">{t.invoice_number || '-'}</td>
                  <td className="py-3.5 px-5 font-body-md text-body-md text-on-surface-variant">{formatDateIndo(t.transaction_date)}</td>
                  <td className="py-3.5 px-5">
                    <p className="font-label-md text-label-md font-semibold text-on-surface">{t.buyer_name || '-'}</p>
                    <p className="font-label-sm text-xs text-on-surface-variant">{t.buyer_phone || ''}</p>
                  </td>
                  <td className="py-3.5 px-5">
                    <p className="font-label-md text-label-md font-semibold text-on-surface">{t.cattle?.name || '-'}</p>
                    <p className="font-label-sm text-xs text-on-surface-variant">ID: {t.cattle?.ear_tag || '-'}</p>
                  </td>
                  <td className="py-3.5 px-5 text-right font-label-md text-label-md font-bold text-on-surface">{formatPrice(t.total_amount || 0)}</td>
                  <td className="py-3.5 px-5 text-right font-body-md text-body-md text-on-surface-variant">{t.dp_amount ? formatPrice(t.dp_amount) : '-'}</td>
                  <td className="py-3.5 px-5 font-body-md text-body-md text-on-surface-variant">{t.payment_method || '-'}</td>
                  <td className="py-3.5 px-5">{statusBadge(t.status)}</td>
                  <td className="py-3.5 px-5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {/* Tombol Cetak / Struk yang sudah ada */}
                      <button
                        type="button"
                        onClick={() => handleViewInvoice(t)}
                        title="Lihat / Cetak Invoice"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <Printer className="w-4 h-4"/>
                      </button>

                      {/* Tombol Hapus Transaksi (Akses Admin) */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTransaction(t.id)}
                        title="Hapus Transaksi"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-40">receipt_long</span>
            <p className="font-headline-md text-headline-md font-bold">Belum ada data transaksi</p>
            <p className="font-body-md text-body-md mt-1">Klik "Catat Transaksi" untuk menambahkan transaksi penjualan pertama.</p>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="p-4 border-t border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Menampilkan {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}-
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} Data
            </p>
            <div className="flex gap-1">
              <button className="p-1.5 rounded border border-outline-variant/30 text-on-surface-variant disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1.5 rounded font-label-sm text-label-sm transition-colors ${page === currentPage ? 'bg-primary text-white font-bold' : 'hover:bg-surface-container text-on-surface'}`}>
                    {page}
                  </button>
                );
              })}
              <button className="p-1.5 rounded border border-outline-variant/30 text-on-surface disabled:opacity-50" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) setSelectedInvoice(null); }}>
          <div className="fixed inset-0" onClick={() => setSelectedInvoice(null)} />
          <div className="relative z-10 bg-surface w-full max-w-lg rounded-2xl shadow-2xl p-6 m-auto animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-headline-md font-bold text-on-surface">Detail Invoice</h3>
              <button onClick={() => setSelectedInvoice(null)} className="p-1 rounded-full hover:bg-surface-variant"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-outline-variant/20"><span className="text-sm text-on-surface-variant">Invoice</span><span className="text-sm font-bold text-primary">{selectedInvoice.invoice_number}</span></div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20"><span className="text-sm text-on-surface-variant">Tanggal</span><span className="text-sm font-semibold">{formatDateIndo(selectedInvoice.transaction_date)}</span></div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20"><span className="text-sm text-on-surface-variant">Pembeli</span><span className="text-sm font-semibold">{selectedInvoice.buyer_name}</span></div>
              {selectedInvoice.buyer_phone && <div className="flex justify-between py-2 border-b border-outline-variant/20"><span className="text-sm text-on-surface-variant">Telepon</span><span className="text-sm">{selectedInvoice.buyer_phone}</span></div>}
              {selectedInvoice.buyer_address && <div className="flex justify-between py-2 border-b border-outline-variant/20"><span className="text-sm text-on-surface-variant">Alamat</span><span className="text-sm">{selectedInvoice.buyer_address}</span></div>}
              <div className="flex justify-between py-2 border-b border-outline-variant/20"><span className="text-sm text-on-surface-variant">Sapi</span><span className="text-sm font-semibold">{selectedInvoice.cattle?.name || '-'} ({selectedInvoice.cattle?.ear_tag || '-'})</span></div>
              <div className="flex justify-between py-2 border-b border-outline-variant/20"><span className="text-sm text-on-surface-variant">Total</span><span className="text-sm font-bold text-primary">{formatPrice(selectedInvoice.total_amount || 0)}</span></div>
              {selectedInvoice.dp_amount > 0 && <div className="flex justify-between py-2 border-b border-outline-variant/20"><span className="text-sm text-on-surface-variant">DP</span><span className="text-sm font-semibold">{formatPrice(selectedInvoice.dp_amount)}</span></div>}
              <div className="flex justify-between py-2 border-b border-outline-variant/20"><span className="text-sm text-on-surface-variant">Metode</span><span className="text-sm">{selectedInvoice.payment_method || '-'}</span></div>
              <div className="flex justify-between py-2"><span className="text-sm text-on-surface-variant">Status</span>{statusBadge(selectedInvoice.status)}</div>
              {selectedInvoice.notes && <div className="py-2"><span className="text-sm text-on-surface-variant">Catatan:</span><p className="text-sm mt-1">{selectedInvoice.notes}</p></div>}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Transaction Modal */}
      {showAddModal && <AddTransactionModal cattleList={cattleList} onClose={() => setShowAddModal(false)} onSaved={onTransactionChange || (() => {})} />}

      {/* Struk / Nota Cetak Modal */}
      {printStruk && <StrukInvoiceModal transaction={printStruk} onClose={() => setPrintStruk(null)} />}
    </div>
  );
};

export default SalesReportPage;
