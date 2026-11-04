'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Search,
  Power,
  AlertCircle,
  Percent,
  Coins,
  Calendar,
  Users,
} from 'lucide-react';
import { formatRupiah } from '@/components/UiBadges';
import TablePagination from '@/components/TablePagination';

interface PromoItem {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minSpend: number;
  maxDiscount: number | null;
  quota: number;
  usedCount: number;
  validUntil: string;
  active: boolean;
  createdAt: string;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE'>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State (Create or Edit)
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('10');
  const [minSpend, setMinSpend] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [quota, setQuota] = useState('50');
  const [validUntil, setValidUntil] = useState('');
  const [active, setActive] = useState(true);

  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promos?limit=200');
      const data = await res.json();
      if (data.success) {
        setPromos(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const openCreateModal = () => {
    setModalMode('CREATE');
    setEditingId(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('10');
    setMinSpend('0');
    setMaxDiscount('');
    setQuota('50');
    // Default valid until 6 months from now
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setValidUntil(d.toISOString().slice(0, 10));
    setActive(true);
    setFormError('');
  };

  const openEditModal = (p: PromoItem) => {
    setModalMode('EDIT');
    setEditingId(p.id);
    setCode(p.code);
    setDiscountType(p.discountType);
    setDiscountValue(String(p.discountValue));
    setMinSpend(String(p.minSpend));
    setMaxDiscount(p.maxDiscount ? String(p.maxDiscount) : '');
    setQuota(String(p.quota));
    setValidUntil(new Date(p.validUntil).toISOString().slice(0, 10));
    setActive(p.active);
    setFormError('');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minSpend: Number(minSpend || 0),
      maxDiscount: discountType === 'PERCENTAGE' && maxDiscount ? Number(maxDiscount) : null,
      quota: Number(quota),
      validUntil,
      active,
    };

    try {
      let res;
      if (modalMode === 'CREATE') {
        res = await fetch('/api/admin/promos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/promos/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!data.success) {
        setFormError(data.message || 'Gagal menyimpan promo');
      } else {
        closeModal();
        setSuccessMsg(
          modalMode === 'CREATE'
            ? `Kode promo "${payload.code}" berhasil ditambahkan!`
            : `Kode promo "${payload.code}" berhasil diperbarui!`
        );
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchPromos();
      }
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (p: PromoItem) => {
    try {
      const res = await fetch(`/api/admin/promos/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !p.active }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Status promo "${p.code}" diubah menjadi ${!p.active ? 'Aktif' : 'Nonaktif'}.`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchPromos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (p: PromoItem) => {
    if (!confirm(`Hapus permanen kode promo "${p.code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/promos/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Kode promo "${p.code}" berhasil dihapus.`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchPromos();
      } else {
        alert(data.message || 'Gagal menghapus promo');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const now = new Date();
  const filteredPromos = promos.filter((p) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.code.toLowerCase().includes(q)) return false;
    }

    const expiry = new Date(p.validUntil);
    const isExpired = expiry < now;

    if (statusFilter === 'ACTIVE') {
      return p.active && !isExpired;
    }
    if (statusFilter === 'EXPIRED') {
      return isExpired;
    }
    if (statusFilter === 'INACTIVE') {
      return !p.active;
    }
    return true;
  });

  // Client-side pagination for fast snappy experience
  const totalItems = filteredPromos.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedPromos = filteredPromos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Manajemen Promo & Voucher Diskon
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Kelola kode diskon musiman, kuota pemakaian, masa berlaku, dan potongan harga otomatis.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Promo Baru</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari kode promo (cth: WISUDA, LUXE)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Semua Promo', count: promos.length },
              {
                id: 'ACTIVE',
                label: 'Aktif',
                count: promos.filter((p) => p.active && new Date(p.validUntil) >= now).length,
              },
              {
                id: 'EXPIRED',
                label: 'Kedaluwarsa',
                count: promos.filter((p) => new Date(p.validUntil) < now).length,
              },
              {
                id: 'INACTIVE',
                label: 'Nonaktif',
                count: promos.filter((p) => !p.active).length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Promos Standard Industry Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
            <p className="text-xs text-stone-500">Memuat data promo & voucher...</p>
          </div>
        ) : paginatedPromos.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            {search || statusFilter !== 'ALL'
              ? 'Tidak ada kode promo yang cocok dengan kriteria pencarian.'
              : 'Belum ada kode promo yang dibuat. Klik tombol "+ Tambah Promo Baru" di atas.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Kode Promo</th>
                  <th className="py-3 px-4">Potongan Diskon</th>
                  <th className="py-3 px-4">Ketentuan Belanja</th>
                  <th className="py-3 px-4">Kuota Pemakaian</th>
                  <th className="py-3 px-4">Masa Berlaku</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedPromos.map((p) => {
                  const expiry = new Date(p.validUntil);
                  const isExpired = expiry < now;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-extrabold text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-lg tracking-wider">
                            {p.code}
                          </span>
                        </div>
                      </td>

                      {/* Discount Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">
                          {p.discountType === 'PERCENTAGE' ? (
                            <span className="flex items-center gap-1 text-emerald-700">
                              <Percent className="w-3.5 h-3.5" />
                              {p.discountValue}%
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-700">
                              <Coins className="w-3.5 h-3.5" />
                              {formatRupiah(p.discountValue)}
                            </span>
                          )}
                        </div>
                        {p.maxDiscount && (
                          <span className="text-[11px] text-stone-500 block">
                            Maks. potongan: {formatRupiah(p.maxDiscount)}
                          </span>
                        )}
                      </td>

                      {/* Min Spend */}
                      <td className="py-3.5 px-4 text-stone-700">
                        {p.minSpend > 0 ? (
                          <span>Min. transaksi {formatRupiah(p.minSpend)}</span>
                        ) : (
                          <span className="text-stone-400">Tanpa minimal belanja</span>
                        )}
                      </td>

                      {/* Quota */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-stone-800 font-medium">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            {p.usedCount} / {p.quota} terpakai
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${
                              p.usedCount >= p.quota ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.round((p.usedCount / p.quota) * 100))}%`,
                            }}
                          />
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-medium block ${
                            isExpired ? 'text-rose-600 line-through' : 'text-stone-700'
                          }`}
                        >
                          {expiry.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {isExpired && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Kedaluwarsa
                          </span>
                        )}
                      </td>

                      {/* Status Active/Inactive Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            p.active && !isExpired
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                          title={p.active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                        >
                          <Power className="w-3 h-3" />
                          {p.active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-stone-700 hover:text-amber-900 transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                          title="Edit Promo"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-400 hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                          title="Hapus Promo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Hapus</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Industry Standard Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="promo"
        />
      </div>

      {/* Modal Add / Edit Promo */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-stone-900">
                  {modalMode === 'CREATE' ? 'Tambah Promo / Voucher Baru' : 'Edit Data Promo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Kode Promo (Huruf Kapital & Angka):
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: WISUDA2026 atau DISKON50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Kode unik yang akan diketik oleh pelanggan saat proses checkout.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Tipe Diskon:
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED">Nominal Tetap (Rp)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {discountType === 'PERCENTAGE' ? 'Besaran Diskon (%):' : 'Nominal Diskon (Rp):'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={discountType === 'PERCENTAGE' ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Min. Belanja (Rp):
                </label>
                <input
                  type="number"
                  min={0}
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Maks. Diskon (Rp):
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="Opsional (tanpa batas)"
                  disabled={discountType === 'FIXED'}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 disabled:bg-stone-100 disabled:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Kuota Pemakaian:
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Berlaku Sampai Tanggal:
                </label>
                <input
                  type="date"
                  required
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="font-semibold text-stone-800">
                  Status Promo Aktif (Dapat digunakan pelanggan sekarang)
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : modalMode === 'CREATE' ? 'Simpan Promo Baru' : 'Perbarui Promo'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
