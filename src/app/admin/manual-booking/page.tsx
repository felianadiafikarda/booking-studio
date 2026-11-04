'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Calendar,
  Clock,
  Building,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { formatRupiah } from '@/components/UiBadges';

export default function AdminManualBookingPage() {
  const router = useRouter();

  const [packages, setPackages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [packageId, setPackageId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState('FULL');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successCode, setSuccessCode] = useState('');

  useEffect(() => {
    // Tomorrow default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().slice(0, 10));

    Promise.all([
      fetch('/api/packages').then((r) => r.json()),
      fetch('/api/admin/settings').then((r) => r.json()),
    ])
      .then(([pkgRes, setRes]) => {
        if (pkgRes.success) {
          setPackages(pkgRes.data);
          if (pkgRes.data.length > 0) setPackageId(pkgRes.data[0].id);
        }
        if (setRes.success && setRes.data.rooms) {
          setRooms(setRes.data.rooms);
          if (setRes.data.rooms.length > 0) setRoomId(setRes.data.rooms[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessCode('');

    try {
      const [hour, min] = time.split(':').map(Number);
      const [yyyy, mm, dd] = date.split('-').map(Number);
      const startTime = new Date(Date.UTC(yyyy, mm - 1, dd, hour - 7, min, 0));

      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          roomId: roomId || undefined,
          startTime: startTime.toISOString(),
          guestName,
          guestPhone,
          guestEmail: guestEmail || `${guestPhone.replace(/\D/g, '')}@walkin.luminafoto.com`,
          notes,
          paymentType,
          paymentStatus,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessCode(data.data.bookingCode);
      } else {
        setError(data.message || 'Gagal membuat booking manual');
      }
    } catch {
      setError('Koneksi bermasalah');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPkgObj = packages.find((p) => p.id === packageId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Booking Manual Walk-in / Chat Offline
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Form khusus admin untuk mencatat pelanggan yang datang langsung (walk-in) atau booking via WhatsApp.
        </p>
      </div>

      {successCode ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Booking Manual Berhasil Dibuat!</h2>
          <p className="text-xs text-stone-500">
            Slot jadwal resmi terkunci di sistem dan siap dicetak tiketnya.
          </p>
          <div className="p-3 bg-stone-100 rounded-xl font-mono text-lg font-bold text-amber-700 max-w-xs mx-auto">
            {successCode}
          </div>
          <div className="pt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSuccessCode('');
                setGuestName('');
                setGuestPhone('');
                setGuestEmail('');
                setNotes('');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-stone-300 hover:bg-stone-50"
            >
              + Buat Booking Lain
            </button>
            <button
              type="button"
              onClick={() => router.push(`/booking/status/${successCode}`)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400"
            >
              Buka E-Ticket
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Package & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Pilih Paket Foto <span className="text-rose-500">*</span>
              </label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} — {formatRupiah(pkg.price)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Ruangan Studio <span className="text-rose-500">*</span>
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Tanggal Sesi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Jam Sesi (WIB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Customer Details */}
          <div className="border-t border-stone-100 pt-5 space-y-4">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Data Diri Pelanggan
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nama Pelanggan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Anggara"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Catatan Sesi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bawa 2 pasang sepatu, wisuda..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Status by Admin */}
          <div className="border-t border-stone-100 pt-5 space-y-4">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Pembayaran di Meja Kasir / WhatsApp
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Status Pembayaran:
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                >
                  <option value="PAID">Langsung Lunas (PAID)</option>
                  <option value="PENDING">Menunggu Bayar (PENDING)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Tipe Bayar:
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                >
                  <option value="FULL">Bayar Penuh (100%)</option>
                  <option value="DP">Uang Muka (DP 30%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Metode:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                >
                  <option value="CASH">Tunai (Cash Kasir)</option>
                  <option value="TRANSFER">Transfer Bank Manual</option>
                  <option value="QRIS">QRIS Dinamis</option>
                  <option value="EDC">Mesin EDC Kartu Debit</option>
                </select>
              </div>
            </div>

            {selectedPkgObj && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between font-bold">
                <span className="text-stone-700">Total Biaya Paket:</span>
                <span className="text-sm text-stone-900">{formatRupiah(selectedPkgObj.price)}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-bold text-xs bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mendaftarkan Booking...
                </>
              ) : (
                <>
                  Simpan Booking & Kunci Slot
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

