import { createPortal } from 'react-dom';
import { formatDateIndo } from '../utils/dateFormatter';

const StrukInvoiceModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const t = transaction;
  const cattle = t.cattle || {};
  const petugas = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('admin_user') || 'null');
      return u?.name || 'Staff Operasional';
    } catch {
      return 'Staff Operasional';
    }
  })();

  const total = Number(t.total_amount || 0);
  const dp = Number(t.dp_amount || 0);
  const sisa = Math.max(total - dp, 0);
  const isLunas = t.status === 'Lunas';

  const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

  const buildPrintHTML = () => `
    <div class="receipt-box">
      <div class="header-row">
        <div>
          <p class="brand-title">KANDAS</p>
          <p class="brand-sub">Kandang Dastro</p>
        </div>
        <div class="inv-tag">Nota / Invoice<br/><span class="inv-no">${t.invoice_number || '-'}</span></div>
      </div>
      <p class="address-text">Jl. Pringgadani, Cikeusal Lor, Ketanggungan,<br/>Brebes, Jawa Tengah</p>

      <div class="grid-2">
        <div><div class="label">Tanggal</div><div class="val">${formatDateIndo(t.transaction_date)}</div></div>
        <div><div class="label">Kasir / Petugas</div><div class="val">${petugas}</div></div>
      </div>
      <div class="grid-2">
        <div>
          <div class="label">Pembeli</div>
          <div class="val" style="font-weight: 700;">${t.buyer_name || t.buyer || t.pembeli || '-'}</div>
          ${(t.buyer_phone || t.telepon) ? `<div style="font-size: 11px; color: #64748b; font-weight: 500; margin-top: 2px;">${t.buyer_phone || t.telepon}</div>` : ''}
        </div>
      </div>

      <div class="card-section">
        <p class="section-title">Rincian Sapi</p>
        <div class="item-row"><span>ID &amp; Jenis</span><span>${cattle.name || '-'} (${cattle.ear_tag || '-'})</span></div>
        <div class="item-row"><span>Bobot</span><span>${cattle.weight ? `${cattle.weight} Kg` : '-'}</span></div>
        <div class="item-row"><span>Harga Satuan</span><span>${formatRupiah(total)}</span></div>
        <div class="divider"></div>
        <div class="total-row"><span>Total Transaksi</span><span>${formatRupiah(total)}</span></div>
      </div>

      <div class="card-section">
        <p class="section-title">Ringkasan Pembayaran</p>
        <div class="item-row"><span>Uang DP / Muka</span><span>${isLunas ? 'Rp 0 (Lunas)' : formatRupiah(dp)}</span></div>
        <div class="item-row"><span>Sisa Tagihan</span><span>${isLunas ? 'Rp 0' : formatRupiah(sisa)}</span></div>
        <div class="item-row"><span>Metode</span><span>${t.payment_method || '-'}</span></div>
        <div class="item-row"><span>Status</span><span class="${isLunas ? 'badge-lunas' : 'badge-dp'}">${isLunas ? 'LUNAS' : 'DP'}</span></div>
      </div>

      <p class="footer-note">Terima kasih atas kepercayaan Anda. Sapi yang sudah dibeli dirawat dengan pakan terbaik hingga hari pengiriman.</p>
    </div>
  `;

  const printCSS = `
    @page { size: auto; margin: 15mm 10mm; }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    body { margin: 0; padding: 20px; background: #ffffff; }
    .receipt-box { max-width: 440px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .brand-title { font-size: 22px; font-weight: 800; margin: 0; color: #064e3b; }
    .brand-sub { font-size: 11px; color: #64748b; margin: 2px 0 0 0; }
    .inv-tag { text-align: right; font-size: 11px; color: #64748b; }
    .inv-no { font-size: 11px; font-weight: 700; color: #334155; }
    .address-text { font-size: 11px; color: #475569; line-height: 1.4; margin-bottom: 16px; }
    .grid-2 { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px; }
    .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 2px; }
    .val { font-weight: 600; color: #0f172a; }
    .card-section { background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
    .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
    .item-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; }
    .divider { border-top: 1px dashed #cbd5e1; margin: 12px 0; }
    .total-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #0f172a; padding-top: 4px; }
    .badge-lunas { display: inline-block; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; }
    .badge-dp { display: inline-block; background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; }
    .footer-note { font-size: 11px; color: #64748b; font-style: italic; line-height: 1.4; margin-top: 20px; text-align: center; }
  `;

  const handlePrintStruk = () => {
    const printWindow = window.open('', '', 'width=600,height=800');
    if (!printWindow) {
      alert('Browser memblokir popup. Izinkan popup untuk mencetak struk.');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Transaksi - KANDAS</title>
          <style>${printCSS}</style>
        </head>
        <body>
          ${buildPrintHTML()}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden m-auto animate-fade-in">
        {/* Konten Nota (preview layar) */}
        <div className="p-6 text-slate-800">
          <div className="flex items-center justify-between border-b-2 border-[#1E3A2B] pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#1E3A2B] leading-none">KANDAS</h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">Kandang Dastro</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Nota / Invoice</p>
              <p className="text-[11px] text-slate-600 font-mono">{t.invoice_number || '-'}</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
            Jl. Pringgadani, Cikeusal Lor, Ketanggungan,<br />Brebes, Jawa Tengah
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] mb-4">
            <div><p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Tanggal</p><p className="font-medium">{formatDateIndo(t.transaction_date)}</p></div>
            <div><p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Kasir / Petugas</p><p className="font-medium">{petugas}</p></div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">PEMBELI</span>
              <p className="text-sm font-bold text-slate-800">{t.buyer_name || t.buyer || t.pembeli || '-'}</p>
              {(t.buyer_phone || t.telepon) && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t.buyer_phone || t.telepon}</p>
              )}
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
            <div className="bg-slate-50 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
              Rincian Sapi
            </div>
            <table className="w-full text-[12px]">
              <tbody>
                <tr className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 text-slate-500">ID &amp; Jenis</td>
                  <td className="px-3 py-2 text-right font-semibold">{cattle.name || '-'} ({cattle.ear_tag || '-'})</td>
                </tr>
                <tr className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 text-slate-500">Bobot</td>
                  <td className="px-3 py-2 text-right">{cattle.weight ? `${cattle.weight} Kg` : '-'}</td>
                </tr>
                <tr className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 text-slate-500">Harga Satuan</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatRupiah(total)}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-3 py-2 font-bold">Total Transaksi</td>
                  <td className="px-3 py-2 text-right font-bold text-[#1E3A2B]">{formatRupiah(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-dashed border-slate-300 rounded-lg px-3 py-3 mb-4 space-y-1.5 text-[12px]">
            <div className="flex justify-between"><span className="text-slate-500">Uang DP / Muka</span><span>{isLunas ? 'Rp 0 (Lunas)' : formatRupiah(dp)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Sisa Tagihan</span><span className="font-semibold">{isLunas ? 'Rp 0' : formatRupiah(sisa)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Metode</span><span>{t.payment_method || '-'}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isLunas ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {isLunas ? 'LUNAS' : 'DP'}
              </span>
            </div>
          </div>

          <p className="text-[11px] italic text-slate-500 leading-relaxed border-t border-dashed border-slate-300 pt-4">
            Terima kasih atas kepercayaan Anda. Sapi yang sudah dibeli dirawat dengan pakan terbaik hingga hari pengiriman.
          </p>
        </div>

        {/* Tombol */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrintStruk}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Cetak / Simpan PDF
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StrukInvoiceModal;
