'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Eye,
  Loader2,
} from 'lucide-react';
import { BookingStatusBadge, formatRupiah } from '@/components/UiBadges';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [repRes, bookRes] = await Promise.all([
          fetch('/api/admin/reports').then((r) => r.json()),
          fetch('/api/admin/bookings?limit=10').then((r) => r.json()),
        ]);

        if (repRes.success) {
          setStats(repRes.data);
        }

        if (bookRes.success) {
          setRecentBookings(bookRes.data);

          // Filter today's bookings
          const todayStr = new Date().toISOString().slice(0, 10);
          const todays = bookRes.data.filter((b: any) =>
            b.startTime?.startsWith(todayStr)
          );
          setTodayBookings(todays);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
        <p className="text-xs text-stone-500">Memuat data ringkasan dashboard...</p>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalBookings: 0,
    confirmedCount: 0,
    cancelledCount: 0,
    pendingCount: 0,
    conversionRate: 0,
    totalRevenue: 0,
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Ringkasan Operasional Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Pantau jadwal sesi foto hari ini, status pembayaran, dan performa bisnis real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/manual-booking"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Booking Manual (Walk-in)
          </Link>
          <Link
            href="/admin/calendar"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-900 text-stone-100 hover:bg-stone-800 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            Lihat Kalender
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Pendapatan Terbayar
            </span>
            <span className="text-2xl font-black text-stone-900 mt-1 block">
              {formatRupiah(metrics.totalRevenue)}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              ✓ Terverifikasi Lunas
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Booking Terkonfirmasi
            </span>
            <span className="text-2xl font-black text-stone-900 mt-1 block">
              {metrics.confirmedCount} Sesi
            </span>
            <span className="text-[11px] text-stone-500 mt-1 block">
              Dari total {metrics.totalBookings} pesanan
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Menunggu Pembayaran
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {metrics.pendingCount}
            </span>
            <span className="text-[11px] text-amber-700 mt-1 block">
              Slot ditahan 15 menit
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Rasio Konversi Web
            </span>
            <span className="text-2xl font-black text-stone-900 mt-1 block">
              {metrics.conversionRate}%
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Target PRD ≥ 15% (Tercapai)
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Today's Schedule Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Jadwal Sesi Foto Hari Ini</h2>
            <p className="text-xs text-stone-500">
              Pelanggan yang terjadwal hadir pemotretan hari ini.
            </p>
          </div>
          <Link
            href="/admin/calendar"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            Lihat Kalender Lengkap →
          </Link>
        </div>

        {todayBookings.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-500 text-xs">
            Tidak ada sesi foto yang dijadwalkan hari ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase">
                  <th className="pb-3">Jam</th>
                  <th className="pb-3">Kode</th>
                  <th className="pb-3">Pelanggan</th>
                  <th className="pb-3">Paket</th>
                  <th className="pb-3">Ruangan</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {todayBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/50">
                    <td className="py-3 font-bold text-stone-900">
                      {new Date(b.startTime).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      WIB
                    </td>
                    <td className="py-3 font-mono font-bold text-stone-600">{b.bookingCode}</td>
                    <td className="py-3">
                      <strong className="text-stone-900 block">{b.guestName}</strong>
                      <span className="text-[11px] text-stone-500">{b.guestPhone}</span>
                    </td>
                    <td className="py-3 text-stone-700">{b.package.name}</td>
                    <td className="py-3 text-stone-600">{b.room?.name || 'Studio Utama'}</td>
                    <td className="py-3">
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/bookings?search=${b.bookingCode}`}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Pemesanan Terbaru Masuk</h2>
            <p className="text-xs text-stone-500">
              Daftar reservasi online dan offline yang baru dibuat di sistem.
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            Kelola Semua Booking ({recentBookings.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase">
                <th className="pb-3">Kode Booking</th>
                <th className="pb-3">Pelanggan</th>
                <th className="pb-3">Paket Foto</th>
                <th className="pb-3">Jadwal Sesi</th>
                <th className="pb-3">Total Biaya</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50/50">
                  <td className="py-3 font-mono font-bold text-amber-700">{b.bookingCode}</td>
                  <td className="py-3">
                    <span className="font-bold text-stone-900 block">{b.guestName}</span>
                    <span className="text-[11px] text-stone-500">{b.guestPhone}</span>
                  </td>
                  <td className="py-3 text-stone-700">{b.package.name}</td>
                  <td className="py-3 text-stone-600">
                    {new Date(b.startTime).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    •{' '}
                    {new Date(b.startTime).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WIB
                  </td>
                  <td className="py-3 font-bold text-stone-900">
                    {formatRupiah(b.totalPrice)}
                  </td>
                  <td className="py-3">
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/booking/status/${b.bookingCode}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      E-Ticket
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

