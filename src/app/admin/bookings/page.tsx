'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Loader2,
  X,
  Plus,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { BookingStatusBadge, PaymentStatusBadge, formatRupiah } from '@/components/UiBadges';
import TablePagination from '@/components/TablePagination';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Edit / Status Modal
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [recordPelunasan, setRecordPelunasan] = useState(false);
  const [pelunasanMethod, setPelunasanMethod] = useState('CASH');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/bookings?page=${currentPage}&limit=${pageSize}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
        if (data.pagination) {
          setTotalItems(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings();
  };

  const openEditModal = (b: any) => {
    setSelectedBooking(b);
    setNewStatus(b.status);
    setNotesInput(b.notes || '');
    setRecordPelunasan(false);
  };

  const handleSaveBooking = async () => {
    if (!selectedBooking) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: notesInput,
          recordPelunasan,
          pelunasanMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBooking(null);
        setFeedbackMsg(`Status booking ${selectedBooking.bookingCode} berhasil diperbarui!`);
        setTimeout(() => setFeedbackMsg(''), 4000);
        fetchBookings();
      } else {
        alert(data.message || 'Gagal menyimpan perubahan');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const STATUS_TABS = [
    { id: '', label: 'Semua Status' },
    { id: 'PENDING_PAYMENT', label: 'Menunggu Bayar' },
    { id: 'CONFIRMED', label: 'Terkonfirmasi' },
    { id: 'COMPLETED', label: 'Selesai' },
    { id: 'CANCELLED', label: 'Dibatalkan' },
    { id: 'NO_SHOW', label: 'No-Show' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Manajemen Reservasi Studio
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Kelola daftar booking, konfirmasi pelunasan sisa tagihan, ubah status pesanan, dan pantau kehadiran pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 active:scale-95 border border-stone-200 transition-all flex items-center gap-1.5"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
          <Link
            href="/admin/manual-booking"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Booking Manual Walk-in
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Status Tabs Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari berdasarkan Kode Booking, Nama Pelanggan, No. WhatsApp, atau Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-900 text-stone-100 hover:bg-stone-800 active:scale-95 transition-all"
          >
            Cari
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Standard Industry Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
            <p className="text-xs text-stone-500">Memuat daftar reservasi booking...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            {search || statusFilter
              ? 'Tidak ada data reservasi yang cocok dengan kriteria filter pencarian.'
              : 'Belum ada data reservasi pemotretan tercatat.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Kode Booking</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Paket & Studio</th>
                  <th className="py-3.5 px-4">Jadwal Sesi</th>
                  <th className="py-3.5 px-4">Total Biaya & Pelunasan</th>
                  <th className="py-3.5 px-4">Status Reservasi</th>
                  <th className="py-3.5 px-4">Status Pembayaran</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map((b) => {
                  const startDate = new Date(b.startTime);
                  const latestPayment = b.payments?.[0];
                  const cleanPhone = b.guestPhone ? b.guestPhone.replace(/\D/g, '') : '';
                  const waNumber = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;

                  return (
                    <tr key={b.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Booking Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-800 whitespace-nowrap">
                        <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {b.bookingCode}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <strong className="text-stone-900 block">{b.guestName}</strong>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                          <span>{b.guestPhone}</span>
                          {waNumber && (
                            <a
                              href={`https://wa.me/${waNumber}?text=Halo%20Kak%20${encodeURIComponent(
                                b.guestName
                              )},%20kami%20dari%20Lumina%20Luxe%20Studio%20mengenai%20booking%20${b.bookingCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded"
                              title="Chat WhatsApp Pelanggan"
                            >
                              <MessageCircle className="w-3.5 h-3.5 inline" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Package & Room */}
                      <td className="py-3.5 px-4">
                        <span className="text-stone-800 font-semibold block">{b.package.name}</span>
                        <span className="text-[11px] text-stone-500 block">
                          {b.room?.name || 'Studio Utama'}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-4 text-stone-700 whitespace-nowrap">
                        <span className="font-semibold block">
                          {startDate.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {startDate.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          WIB
                        </span>
                      </td>

                      {/* Total & Remaining */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-stone-900 block">
                          {formatRupiah(b.totalPrice)}
                        </span>
                        {b.remainingAmount > 0 ? (
                          <span className="text-[10px] text-rose-600 font-bold block">
                            Sisa: {formatRupiah(b.remainingAmount)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold block">
                            ✓ Lunas
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <BookingStatusBadge status={b.status} />
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {latestPayment ? (
                          <PaymentStatusBadge status={latestPayment.status} />
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(b)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 text-[11px] font-semibold transition-colors border border-stone-200"
                        >
                          Ubah Status
                        </button>
                        <Link
                          href={`/booking/status/${b.bookingCode}`}
                          target="_blank"
                          className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium border border-stone-200 inline-block"
                          title="Lihat E-Ticket QR"
                        >
                          <Eye className="w-3.5 h-3.5 inline" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Enterprise Standard Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="data reservasi"
        />
      </div>

      {/* Edit Booking & Status Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  Ubah Status & Pembayaran Booking
                </h3>
                <span className="font-mono text-xs text-amber-700 font-bold">
                  {selectedBooking.bookingCode} • {selectedBooking.guestName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Status Pemesanan:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="PENDING_PAYMENT">Menunggu Pembayaran (PENDING_PAYMENT)</option>
                  <option value="CONFIRMED">Terkonfirmasi (CONFIRMED)</option>
                  <option value="COMPLETED">Selesai (COMPLETED)</option>
                  <option value="CANCELLED">Dibatalkan (CANCELLED)</option>
                  <option value="NO_SHOW">No-Show / Tidak Hadir (NO_SHOW)</option>
                </select>
              </div>

              {/* Pelunasan Settlement Option */}
              {selectedBooking.remainingAmount > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900">
                      Sisa Tagihan Pelunasan Studio:
                    </span>
                    <span className="font-extrabold text-amber-900 text-sm">
                      {formatRupiah(selectedBooking.remainingAmount)}
                    </span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1 font-semibold text-stone-800">
                    <input
                      type="checkbox"
                      checked={recordPelunasan}
                      onChange={(e) => setRecordPelunasan(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Catat Pelunasan Sisa Tagihan Sekarang</span>
                  </label>

                  {recordPelunasan && (
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-stone-600">Metode Bayar:</span>
                      <select
                        value={pelunasanMethod}
                        onChange={(e) => setPelunasanMethod(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-medium"
                      >
                        <option value="CASH">Tunai / Cash di Studio</option>
                        <option value="TRANSFER">Transfer Bank / QRIS</option>
                        <option value="DEBIT_EDC">Kartu Debit EDC</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Catatan Admin:
                </label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Tambahkan catatan khusus dari staf studio..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveBooking}
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
