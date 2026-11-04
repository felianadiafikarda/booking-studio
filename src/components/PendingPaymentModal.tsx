'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Building,
  Copy,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { formatRupiah } from './UiBadges';

export interface PendingBookingInfo {
  bookingId?: string;
  bookingCode: string;
  status: string;
  expiresAt: string;
  remainingSeconds?: number;
  guestName?: string;
  startTime?: string;
  endTime?: string;
  package?: { id?: string; name: string };
  packageName?: string;
  roomName?: string;
  totalPrice?: number;
  dpAmount?: number;
  paymentType?: string;
  paymentAmountToPay?: number;
  payment?: {
    id?: string;
    amount: number;
    type?: string;
    method: string;
    vaNumber?: string;
    qrisPayload?: string;
    qrisDataUrl?: string;
    status: string;
  } | null;
}

interface PendingPaymentModalProps {
  booking: PendingBookingInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
  onBookingCancelled?: () => void;
}

export default function PendingPaymentModal({
  booking,
  isOpen,
  onClose,
  onPaymentSuccess,
  onBookingCancelled,
}: PendingPaymentModalProps) {
  const [copiedVa, setCopiedVa] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown timer state
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!booking) return;

    const calculateSeconds = () => {
      const expTime = new Date(booking.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
      return diff;
    };

    setSecondsLeft(calculateSeconds());

    const interval = setInterval(() => {
      const diff = calculateSeconds();
      setSecondsLeft(diff);
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  if (!isOpen || !booking) return null;

  const payment = booking.payment;
  const paymentMethod = payment?.method || 'QRIS';
  const amountToPay =
    payment?.amount ||
    booking.paymentAmountToPay ||
    (booking.paymentType === 'DP' ? booking.dpAmount : booking.totalPrice) ||
    0;

  const isExpired = secondsLeft <= 0;

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formattedDate = booking.startTime
    ? new Date(booking.startTime).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const formattedTime = booking.startTime
    ? `${new Date(booking.startTime).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })} WIB`
    : '';

  const handleCopyVa = () => {
    if (payment?.vaNumber) {
      navigator.clipboard.writeText(payment.vaNumber);
      setCopiedVa(true);
      setTimeout(() => setCopiedVa(false), 2000);
    }
  };

  const handleSimulatePayment = async () => {
    try {
      setIsSimulating(true);
      setActionError('');
      const res = await fetch('/api/payments/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode: booking.bookingCode,
          paymentId: payment?.id,
          method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memproses simulasi pembayaran');
      }

      setSuccessMessage('Pembayaran Berhasil Dikonfirmasi!');
      setTimeout(() => {
        if (onPaymentSuccess) onPaymentSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setActionError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan tagihan pesanan ini? Slot jadwal akan dilepas.')) {
      return;
    }

    try {
      setIsCancelling(true);
      setActionError('');
      const res = await fetch(`/api/bookings/${booking.bookingCode}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Dibatalkan oleh pelanggan untuk pilih jadwal lain' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal membatalkan pesanan');
      }

      if (onBookingCancelled) onBookingCancelled();
      onClose();
    } catch (err: any) {
      setActionError(err.message || 'Terjadi kesalahan saat membatalkan');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-stone-100">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 block mb-1">
            Invoice Tagihan Reservasi
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Lanjutkan Pembayaran
          </h3>
          <p className="font-mono text-xs font-semibold text-stone-500 mt-0.5">
            Kode: <span className="text-amber-700 font-bold">{booking.bookingCode}</span>
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="my-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage} Menutup jendela invoice...</span>
          </div>
        )}

        {/* Error Alert */}
        {actionError && (
          <div className="my-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Countdown Box */}
        <div
          className={`my-4 p-4 rounded-2xl text-center border ${
            isExpired
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block mb-1">
            {isExpired ? 'Batas Waktu Telah Berakhir' : 'Slot Jadwal Ditahan Sementara'}
          </span>
          <div className="text-3xl font-extrabold font-mono tracking-tight flex items-center justify-center gap-2">
            <Clock className="w-6 h-6 animate-pulse" />
            <span>{isExpired ? '00:00' : formatCountdown(secondsLeft)}</span>
          </div>
          <p className="text-[11px] opacity-80 mt-1">
            {isExpired
              ? 'Slot hold untuk booking ini telah kedaluwarsa. Silakan batalkan atau buat booking baru.'
              : 'Selesaikan pembayaran sebelum slot otomatis dilepas kembali ke publik.'}
          </p>
        </div>

        {/* Order Details Brief */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1 mb-5">
          <div className="flex justify-between">
            <span className="text-stone-500">Paket:</span>
            <strong className="text-stone-900">{booking.packageName || 'Paket Studio'}</strong>
          </div>
          {formattedDate && (
            <div className="flex justify-between">
              <span className="text-stone-500">Jadwal Sesi:</span>
              <span className="text-stone-800 font-medium">
                {formattedDate} • {formattedTime}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-stone-200 font-bold">
            <span className="text-stone-700">Total Harus Dibayar:</span>
            <span className="text-amber-700 text-sm">{formatRupiah(amountToPay)}</span>
          </div>
        </div>

        {/* Payment Methods Instruction */}
        {!isExpired && (
          <div className="space-y-4">
            {paymentMethod === 'QRIS' ? (
              <div className="text-center space-y-3 bg-stone-50 p-5 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-700 block">
                  Scan QRIS di bawah ini:
                </span>

                <div className="inline-block p-3 bg-white rounded-2xl border border-stone-200 shadow-sm">
                  {payment?.qrisDataUrl ? (
                    <img
                      src={payment.qrisDataUrl}
                      alt="QRIS Barcode"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-stone-900 rounded-xl flex flex-col items-center justify-center p-3 text-white">
                      <QrCode className="w-32 h-32 text-amber-400 mb-2" />
                      <span className="text-[10px] font-mono tracking-wider">QRIS LUMINA STUDIO</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Buka aplikasi mobile banking (BCA, Mandiri, BRI, BNI) atau dompet digital (GoPay,
                  OVO, ShopeePay, Dana), lalu scan kode QR di atas.
                </p>
              </div>
            ) : (
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Nomor Virtual Account ({paymentMethod.replace('VA_', '')}):
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-stone-300 font-mono font-bold text-lg text-stone-900 shadow-sm">
                  <span>{payment?.vaNumber || '8801299945'}</span>
                  <button
                    type="button"
                    onClick={handleCopyVa}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-sans text-stone-700 flex items-center gap-1 transition-colors"
                  >
                    {copiedVa ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedVa ? 'Tersalin' : 'Salin'}
                  </button>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Transfer tepat sesuai nominal tagihan melalui ATM, Mobile Banking, atau Internet
                  Banking ke nomor Virtual Account di atas.
                </p>
              </div>
            )}

            {/* Simulator Button for Instant Sandbox Testing */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Mode Uji Coba / Simulasi Pembayaran
              </span>
              <p className="text-[11px] text-emerald-700">
                Klik tombol di bawah untuk langsung memverifikasi pembayaran Anda tanpa transfer nyata.
              </p>
              <button
                type="button"
                disabled={isSimulating}
                onClick={handleSimulatePayment}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memverifikasi Pembayaran...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Simulasikan Pembayaran Berhasil
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={isCancelling}
            onClick={handleCancelBooking}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline disabled:opacity-50"
          >
            {isCancelling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Batalkan Tagihan Ini
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
