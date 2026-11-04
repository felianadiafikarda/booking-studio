'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookingStatusBadge, PaymentStatusBadge, formatRupiah } from '@/components/UiBadges';
import PendingPaymentModal, { PendingBookingInfo } from '@/components/PendingPaymentModal';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Share2,
  Printer,
  CalendarCheck,
  AlertTriangle,
  Star,
  CheckCircle2,
  Phone,
  ArrowLeft,
  Loader2,
  X,
} from 'lucide-react';

export default function BookingStatusPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reschedule Modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [selectedNewSlot, setSelectedNewSlot] = useState<any>(null);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  // Cancel Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Pending Payment Recovery Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings/${code}`);
      const data = await res.json();
      if (data.success) {
        setBooking(data.data);
      } else {
        setError(data.message || 'Booking tidak ditemukan');
      }
    } catch {
      setError('Koneksi bermasalah');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) fetchBooking();
  }, [code]);

  // Load slots when reschedule date is chosen
  useEffect(() => {
    if (!showRescheduleModal || !rescheduleDate || !booking) return;
    setLoadingRescheduleSlots(true);
    setSelectedNewSlot(null);
    setRescheduleError('');

    fetch(`/api/availability?packageId=${booking.package.id}&date=${rescheduleDate}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRescheduleSlots(d.data.slots);
      })
      .catch(() => setRescheduleSlots([]))
      .finally(() => setLoadingRescheduleSlots(false));
  }, [rescheduleDate, showRescheduleModal, booking]);

  const handleReschedule = async () => {
    if (!selectedNewSlot) {
      setRescheduleError('Silakan pilih slot jadwal baru');
      return;
    }
    setIsSubmittingReschedule(true);
    setRescheduleError('');
    try {
      const res = await fetch(`/api/bookings/${code}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStartTime: selectedNewSlot.startTime }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRescheduleModal(false);
        fetchBooking();
      } else {
        setRescheduleError(data.message);
      }
    } catch {
      setRescheduleError('Gagal memproses perubahan jadwal');
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const handleCancelBooking = async () => {
    setIsSubmittingCancel(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/bookings/${code}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCancelModal(false);
        fetchBooking();
      } else {
        setCancelError(data.message);
      }
    } catch {
      setCancelError('Gagal memproses pembatalan');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      setReviewError('Silakan tulis ulasan Anda');
      return;
    }
    setIsSubmittingReview(true);
    setReviewError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode: code,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setShowReviewModal(false);
          fetchBooking();
        }, 1500);
      } else {
        setReviewError(data.message);
      }
    } catch {
      setReviewError('Gagal mengirim ulasan');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1 max-w-lg mx-auto px-4 py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Booking Tidak Ditemukan</h2>
          <p className="text-xs text-stone-500 mb-6">{error || 'Kode booking tidak sesuai.'}</p>
          <button
            onClick={() => router.push('/check-booking')}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-stone-900 text-stone-100"
          >
            Cari Booking Lain
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Top actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Tiket
            </button>

            {booking.whatsappLink && (
              <a
                href={booking.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                Kirim ke WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* E-Ticket Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800">
            <div>
              <span className="text-[11px] font-semibold tracking-widest text-amber-400 uppercase block mb-1">
                E-Ticket & Konfirmasi Booking
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
                LUMINA LUXE PHOTO STUDIO
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Jl. Malioboro No. 88, Yogyakarta • Hotline: +62 852-6541-6588
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-stone-400 block mb-1">Kode Booking</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-wider">
                {booking.bookingCode}
              </span>
            </div>
          </div>

          {/* Status Alert Banner */}
          <div className="px-6 sm:px-8 py-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-stone-600">Status Reservasi:</span>
              <BookingStatusBadge status={booking.status} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Pembayaran:</span>
              {booking.payments?.[0] ? (
                <PaymentStatusBadge status={booking.payments[0].status} />
              ) : (
                <span className="text-xs">-</span>
              )}
            </div>
          </div>

          {/* Pending Payment Warning Hero Banner */}
          {booking.status === 'PENDING_PAYMENT' && (
            <div className="px-6 sm:px-8 py-4 bg-amber-500/15 border-b border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2.5 text-xs text-amber-950 font-medium">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <strong className="font-bold text-amber-900 block">
                    Menunggu Pembayaran (Slot Hold Aktif)
                  </strong>
                  <span>
                    Slot jadwal ditahan sementara. Selesaikan pembayaran sebelum batas waktu berakhir
                    agar pesanan tidak otomatis dibatalkan.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shrink-0 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                Bayar Sekarang (Buka Tagihan) →
              </button>
            </div>
          )}

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left 8 Cols: Session details */}
            <div className="md:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                    Paket Foto
                  </span>
                  <h3 className="font-bold text-base text-stone-900">{booking.package.name}</h3>
                  <span className="text-xs text-stone-500 block mt-0.5">
                    Durasi {booking.package.durationMinutes} Menit • {booking.package.photoCount} Foto Retouch
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                    Ruangan Studio
                  </span>
                  <h3 className="font-bold text-base text-stone-900">
                    {booking.room?.name || 'Studio Utama'}
                  </h3>
                  <span className="text-xs text-stone-500 block mt-0.5">AC • Lighting Studio Lengkap</span>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                      Waktu Pemotretan
                    </span>
                    <h4 className="text-base font-extrabold text-stone-900">
                      {booking.dateFormatted}
                    </h4>
                    <p className="text-xs text-amber-800 font-medium mt-0.5">
                      Pukul {booking.timeFormatted} WIB
                    </p>
                    <span className="text-[11px] text-amber-700 block mt-1">
                      ⚠️ Harap hadir 10-15 menit lebih awal untuk persiapan wardrobe & makeup.
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t border-stone-100 pt-4">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Informasi Pelanggan
                </span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-stone-500 block">Nama Pemesan:</span>
                    <strong className="text-stone-900 text-sm">{booking.guestName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">WhatsApp:</span>
                    <strong className="text-stone-900 text-sm">{booking.guestPhone}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Email:</span>
                    <span className="text-stone-700">{booking.guestEmail}</span>
                  </div>
                  {booking.notes && (
                    <div>
                      <span className="text-stone-500 block">Catatan:</span>
                      <span className="text-stone-700 italic">{booking.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t border-stone-100 pt-4 text-xs space-y-1.5">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Rincian Pembayaran
                </span>
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal Biaya</span>
                  <span>{formatRupiah(booking.subtotal)}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Promo ({booking.promoCode})</span>
                    <span>-{formatRupiah(booking.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-1 border-t border-stone-100">
                  <span>Total Tagihan</span>
                  <span>{formatRupiah(booking.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>
                    DP Dibayar ({booking.paymentType}):
                  </span>
                  <span>{formatRupiah(booking.dpAmount)}</span>
                </div>
                {booking.remainingAmount > 0 && (
                  <div className="flex justify-between text-stone-500">
                    <span>Sisa Pelunasan di Studio:</span>
                    <span>{formatRupiah(booking.remainingAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Cols: QR Code Check-in OR Pending Payment Invoice */}
            <div className="md:col-span-4 flex flex-col items-center justify-between text-center p-6 bg-stone-50 rounded-2xl border border-stone-200">
              {booking.status === 'PENDING_PAYMENT' ? (
                <div className="w-full space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-stone-900 text-xs">
                    <span className="font-bold block uppercase tracking-wider text-[11px] text-amber-800 mb-1">
                      Menunggu Pembayaran
                    </span>
                    <span className="text-2xl font-extrabold text-stone-900 block my-1">
                      {formatRupiah(
                        booking.paymentType === 'DP' ? booking.dpAmount : booking.totalPrice
                      )}
                    </span>
                    <span className="text-[11px] text-stone-600 block">
                      {booking.paymentType === 'DP' ? 'Uang Muka (DP 30%)' : 'Pembayaran Lunas 100%'}
                    </span>
                    <span className="inline-block mt-2 font-mono text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      Metode: {booking.payments?.[0]?.method || 'Online'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <QrCode className="w-4 h-4" />
                    Buka Tagihan & Bayar Sekarang
                  </button>

                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Selesaikan pembayaran melalui QRIS atau Virtual Account agar kode QR check-in studio resmi diterbitkan.
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-3">
                    QR Code Check-in
                  </span>
                  {booking.qrCodeData ? (
                    <div className="p-3 bg-white rounded-xl border border-stone-200 inline-block shadow-sm">
                      <img
                        src={booking.qrCodeData}
                        alt="QR Check-in"
                        className="w-40 h-40 object-contain mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-stone-200 rounded-xl flex items-center justify-center mx-auto text-xs text-stone-400">
                      QR Ready
                    </div>
                  )}
                  <p className="text-[11px] text-stone-500 mt-3 leading-relaxed">
                    Tunjukkan kode QR ini ke meja resepsionis Lumina Studio saat tiba di lokasi.
                  </p>
                </div>
              )}

              {/* Action buttons (Reschedule / Cancel / Review) */}
              <div className="w-full pt-6 border-t border-stone-200 mt-6 space-y-2 no-print">
                {booking.canReschedule && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowRescheduleModal(true);
                      setRescheduleDate(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10));
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-amber-500/80 bg-amber-50/50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Reschedule Jadwal (Maks H-2)
                  </button>
                )}

                {booking.canCancel && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 hover:border-rose-400 hover:bg-rose-50 text-stone-600 hover:text-rose-700 text-xs font-medium transition-colors"
                  >
                    Batalkan Pemesanan
                  </button>
                )}

                {!booking.hasReview && (booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') && (
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Beri Ulasan Studio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-base text-stone-900">Ubah Jadwal Sesi Foto</h3>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Sesuai kebijakan studio, perubahan jadwal dapat dilakukan maksimal 48 jam (H-2) sebelum sesi foto. Slot baru harus tersedia.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Pilih Tanggal Baru:
                </label>
                <input
                  type="date"
                  min={new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Pilih Slot Jam Baru:
                </label>
                {loadingRescheduleSlots ? (
                  <div className="py-6 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    Memeriksa slot tersedia...
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {rescheduleSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedNewSlot(slot)}
                        className={`py-2 px-1 text-xs rounded-lg font-bold text-center transition-all ${
                          selectedNewSlot?.startTime === slot.startTime
                            ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400'
                            : slot.available
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-400 line-through cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {rescheduleError && (
                <p className="text-xs text-rose-600 font-medium">{rescheduleError}</p>
              )}

              <div className="pt-4 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!selectedNewSlot || isSubmittingReschedule}
                  onClick={handleReschedule}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 disabled:opacity-40"
                >
                  {isSubmittingReschedule ? 'Menyimpan...' : 'Konfirmasi Jadwal Baru'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900 mb-2">Batalkan Reservasi Foto?</h3>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin membatalkan booking ini? Slot jadwal akan langsung dilepas kembali ke publik.
            </p>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-4">
              <strong>Ketentuan Kebijakan Studio:</strong>
              <p className="mt-1">
                Pembatalan minimal H-2 memenuhi syarat pengembalian (refund) 70% dari nilai pembayaran. Pembatalan kurang dari 48 jam sebelum sesi mengakibatkan pembayaran hangus.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Alasan Pembatalan (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Ada acara keluarga mendadak..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {cancelError && <p className="text-xs text-rose-600 font-medium mb-3">{cancelError}</p>}

            <div className="flex justify-end gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleCancelBooking}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40"
              >
                {isSubmittingCancel ? 'Memproses...' : 'Ya, Batalkan Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900 mb-1">Beri Ulasan Sesi Foto</h3>
            <p className="text-xs text-stone-500 mb-4">
              Bagikan pengalaman pemotretan Anda di Lumina Luxe Studio.
            </p>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs text-center rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Terima kasih atas ulasan berharga Anda!
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Rating Bintang:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= reviewRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Ulasan Anda:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Fotografer sangat ramah, lighting estetik, studio bersih dan nyaman!"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {reviewError && <p className="text-xs text-rose-600">{reviewError}</p>}

                <div className="flex justify-end gap-2 border-t border-stone-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingReview}
                    onClick={handleSubmitReview}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400"
                  >
                    {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Payment Recovery Modal */}
      {booking && (
        <PendingPaymentModal
          booking={{
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            status: booking.status,
            expiresAt: booking.expiresAt,
            guestName: booking.guestName,
            startTime: booking.startTime,
            endTime: booking.endTime,
            packageName: booking.package?.name,
            roomName: booking.room?.name,
            totalPrice: booking.totalPrice,
            dpAmount: booking.dpAmount,
            paymentType: booking.paymentType,
            payment: booking.payments?.[0]
              ? {
                  id: booking.payments[0].id,
                  amount: booking.payments[0].amount,
                  type: booking.payments[0].type,
                  method: booking.payments[0].method,
                  vaNumber: booking.payments[0].vaNumber,
                  qrisPayload: booking.qrisPayload,
                  qrisDataUrl: booking.qrisPaymentDataUrl,
                  status: booking.payments[0].status,
                }
              : null,
          }}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            fetchBooking();
          }}
          onBookingCancelled={() => {
            fetchBooking();
          }}
        />
      )}

      <Footer />
    </div>
  );
}

