'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Loader2,
} from 'lucide-react';
import { formatRupiah } from '@/components/UiBadges';

export default function AdminReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Date filters (defaults: last 30 days)
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setFrom(thirtyDaysAgo.toISOString().slice(0, 10));
    setTo(today.toISOString().slice(0, 10));
  }, []);

  const fetchReports = async () => {
    if (!from || !to) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?from=${from}&to=${to}`);
      if (res.status === 403 || res.status === 401) {
        router.replace('/admin');
        return;
      }
      const d = await res.json();
      if (d.success) {
        setData(d.data);
      } else {
        router.replace('/admin');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (from && to) fetchReports();
  }, [from, to]);

  const handleDownloadCsv = () => {
    window.open(`/api/admin/reports/export?from=${from}&to=${to}`, '_blank');
  };

  const metrics = data?.metrics || {
    totalBookings: 0,
    confirmedCount: 0,
    cancelledCount: 0,
    pendingCount: 0,
    conversionRate: 0,
    totalRevenue: 0,
  };

  const topPackages = data?.topPackages || [];
  const peakHours = data?.peakHours || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Laporan Bisnis & Statistik Studio
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Analisis pendapatan, paket paling laris, jam kunjungan tersibuk, dan ekspor data CSV.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Ekspor CSV / Excel
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>Rentang Tanggal:</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-300 font-medium"
          />
          <span className="text-stone-400">s/d</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-300 font-medium"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Total Omzet Pendapatan
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {formatRupiah(metrics.totalRevenue)}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Pembayaran Lunas
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Sesi Terkonfirmasi
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {metrics.confirmedCount} Sesi
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Dari {metrics.totalBookings} total pesanan
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Tingkat Konversi
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {metrics.conversionRate}%
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Target PRD: ≥ 15%
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Pemesanan Dibatalkan
          </span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            {metrics.cancelledCount}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Turun &gt; 50% vs manual chat
          </span>
        </div>
      </div>

      {/* Two Column Section: Top Packages & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Best-selling packages table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            Paket Foto Paling Diminati (Best Seller)
          </h2>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            </div>
          ) : topPackages.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              Belum ada data penjualan pada periode ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase">
                    <th className="pb-3">Paket Foto</th>
                    <th className="pb-3 text-center">Total Terjual</th>
                    <th className="pb-3 text-right">Kontribusi Omzet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {topPackages.map((pkg: any) => (
                    <tr key={pkg.id}>
                      <td className="py-3 font-bold text-stone-900">{pkg.name}</td>
                      <td className="py-3 text-center font-semibold text-stone-700">
                        {pkg.count} kali
                      </td>
                      <td className="py-3 text-right font-black text-stone-900">
                        {formatRupiah(pkg.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Peak Hours breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Distribusi Jam Ramai (Peak Hours)
          </h2>

          <p className="text-xs text-stone-500">
            Analisis waktu favorit kunjungan pelanggan di studio.
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {peakHours.map((ph: any) => (
              <div key={ph.hour} className="flex items-center gap-3 text-xs">
                <span className="w-14 font-mono font-bold text-stone-600">{ph.hour}</span>
                <div className="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ph.bookingsCount * 25)}%`,
                    }}
                  />
                </div>
                <span className="w-12 text-right font-semibold text-stone-800">
                  {ph.bookingsCount} sesi
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

