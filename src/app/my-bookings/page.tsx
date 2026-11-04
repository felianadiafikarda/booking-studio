'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookingStatusBadge, formatRupiah } from '@/components/UiBadges';
import PendingPaymentModal, { PendingBookingInfo } from '@/components/PendingPaymentModal';
import {
  Calendar,
  Clock,
  ChevronRight,
  Ticket,
  Loader2,
  AlertCircle,
  CreditCard,
  QrCode,
  Building,
} from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [activePending, setActivePending] = useState<PendingBookingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<PendingBookingInfo | null>(
    null
  );
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const fetchBookingsData = useCallback(() => {
    setLoading(true);

    Promise.all([
      fetch('/api/user/bookings').then((r) => r.json()),
      fetch('/api/user/bookings/active').then((r) => r.json()),
    ])
      .then(([bookingsRes, activeRes]) => {
        if (bookingsRes.success) {
          setBookings(bookingsRes.data);
        } else {
          setBookings([]);
        }

        if (activeRes.success && activeRes.hasPending && activeRes.data) {
          setActivePending(activeRes.data);
        } else {
          setActivePending(null);
        }
      })
      .catch(() => {
        setBookings([]);
        setActivePending(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBookingsData();
  }, [fetchBookingsData]);

  const handleOpenInvoice = (item: any) => {
    const formatted: PendingBookingInfo = {
      bookingId: item.id || item.bookingId,
      bookingCode: item.bookingCode,
      status: item.status,
      expiresAt: item.expiresAt,
      guestName: item.guestName,
      startTime: item.startTime,
      endTime: item.endTime,
      packageName: item.package?.name || item.packageName,
      roomName: item.room?.name || item.roomName,
      totalPrice: item.totalPrice,
      dpAmount: item.dpAmount,
      paymentType: item.paymentType,
      paymentAmountToPay: item.paymentAmountToPay,
      payment: item.payment || item.activePayment || (item.payments ? item.payments[0] : null),
    };
    setSelectedInvoiceBooking(formatted);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Top Header */}
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
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 self-start sm:self-auto shadow-sm transition-transform active:scale-95"
          >
            + Booking Sesi Baru
          </Link>
        </div>

        {/* ACTIVE PENDING INVOICE HERO BANNER */}
        {activePending && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-600/15 border-2 border-amber-400/80 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-sm animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Tagihan Menunggu Pembayaran
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-700 bg-white/80 px-2 py-0.5 rounded-md border border-amber-200">
                    {activePending.bookingCode}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  {activePending.package?.name || activePending.packageName}
                </h2>

                <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                  Anda memiliki pesanan yang belum diselesaikan. Slot jadwal foto Anda sedang ditahan
                  sementara. Segera lakukan pembayaran sebelum slot dilepas otomatis.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-800 pt-1">
                  <span>
                    Metode:{' '}
                    <span className="text-amber-800 font-bold">
                      {activePending.payment?.method || 'QRIS'}
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    Total Tagihan:{' '}
                    <span className="text-amber-800 text-sm font-extrabold">
                      {formatRupiah(
                        activePending.payment?.amount ||
                          (activePending.paymentType === 'DP'
                            ? activePending.dpAmount
                            : activePending.totalPrice) ||
                          0
                      )}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenInvoice(activePending)}
                  className="px-6 py-3 rounded-2xl text-xs font-bold bg-stone-950 text-amber-400 hover:bg-stone-800 hover:text-amber-300 shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Bayar Sekarang (Buka Tagihan)
                </button>
                <Link
                  href={`/booking/status/${activePending.bookingCode}`}
                  className="px-4 py-2 text-center text-xs font-semibold text-stone-600 hover:text-stone-900 hover:underline"
                >
                  Lihat Rincian Reservasi
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* LIST OF BOOKINGS */}
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

              const isPending = b.status === 'PENDING_PAYMENT' && !b.isExpired;

              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isPending
                      ? 'border-amber-400/90 bg-amber-50/20 ring-1 ring-amber-300/60'
                      : 'border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
                        {b.bookingCode}
                      </span>
                      <BookingStatusBadge status={b.status} />
                      {isPending && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                          Menunggu Bayar
                        </span>
                      )}
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

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleOpenInvoice(b)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-sm active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Bayar Sekarang
                      </button>
                    )}

                    <Link
                      href={`/booking/status/${b.bookingCode}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-100 transition-colors shadow-sm"
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

      {/* RECOVERY INVOICE MODAL */}
      <PendingPaymentModal
        booking={selectedInvoiceBooking}
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceBooking(null);
        }}
        onPaymentSuccess={() => {
          fetchBookingsData();
        }}
        onBookingCancelled={() => {
          fetchBookingsData();
        }}
      />

      <Footer />
    </div>
  );
}
