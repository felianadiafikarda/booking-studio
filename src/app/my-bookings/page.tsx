'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookingStatusBadge, PaymentStatusBadge, formatRupiah } from '@/components/UiBadges';
import { Calendar, Clock, ChevronRight, Ticket, Loader2 } from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/bookings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBookings(d.data);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Riwayat Reservasi Saya
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Daftar sesi foto yang pernah dan akan berlangsung di Lumina Luxe Studio.
            </p>
          </div>

          <Link
            href="/booking"
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 self-start sm:self-auto shadow-sm"
          >
            + Booking Sesi Baru
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
            <p className="text-xs text-stone-500">Memuat riwayat booking...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm max-w-md mx-auto">
            <Ticket className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-stone-800">Belum Ada Riwayat Pemesanan</h3>
            <p className="text-xs text-stone-500 mt-1 mb-6">
              Anda belum memiliki sesi foto aktif. Pilih paket foto dan jadwalkan sesi pertama Anda!
            </p>
            <Link
              href="/packages"
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-stone-900 text-stone-100 hover:bg-stone-800"
            >
              Jelajahi Paket Foto
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const startDate = new Date(b.startTime);
              const formattedDate = startDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
              const formattedTime = startDate.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm hover:border-amber-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
                        {b.bookingCode}
                      </span>
                      <BookingStatusBadge status={b.status} />
                    </div>

                    <h3 className="font-bold text-base text-stone-900">{b.package.name}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-amber-600" />
                        {formattedTime} WIB
                      </span>
                      {b.room && <span>• {b.room.name}</span>}
                    </div>

                    <div className="text-xs text-stone-500 pt-1">
                      Total: <strong className="text-stone-900">{formatRupiah(b.totalPrice)}</strong>
                      {b.paymentType === 'DP' && b.remainingAmount > 0 && (
                        <span className="text-amber-800 ml-2">
                          (Sisa tagihan studio: {formatRupiah(b.remainingAmount)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                    <Link
                      href={`/booking/status/${b.bookingCode}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-stone-100 transition-colors shadow-sm"
                    >
                      Buka E-Ticket
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

