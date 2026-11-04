'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  Plus,
  Minus,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { formatRupiah } from './UiBadges';

interface PackageItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  durationMinutes: number;
  maxPeople: number;
  photoCount: number;
  features: string[];
  imageUrl?: string;
}

interface AddOnItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  extraMinutes: number;
}

interface TimeSlot {
  time: string;
  startTime: string;
  endTime: string;
  available: boolean;
  roomId?: string;
  roomName?: string;
  reason?: string;
}

export default function BookingStepper({ initialSlug }: { initialSlug?: string }) {
  const router = useRouter();

  // Master Data
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [addons, setAddons] = useState<AddOnItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Stepper State
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Package, Date & Time Slot
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Step 2: Add-ons
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  // Step 3: Customer Details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Step 4: Promo & Payment Type
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState<boolean>(false);

  const [paymentType, setPaymentType] = useState<'DP' | 'FULL'>('DP');
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS');

  // Step 5: Created Booking & Slot Hold
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(900); // 15 mins
  const [copiedVa, setCopiedVa] = useState<boolean>(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState<boolean>(false);

  // Set default date to tomorrow in local time
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch initial packages & add-ons & current logged in user
  useEffect(() => {
    async function loadData() {
      try {
        const [pkgRes, addRes, userRes] = await Promise.all([
          fetch('/api/packages').then((r) => r.json()),
          fetch('/api/addons').then((r) => r.json()),
          fetch('/api/auth/me').then((r) => r.json()).catch(() => ({})),
        ]);

        if (pkgRes.success) {
          setPackages(pkgRes.data);
          if (initialSlug) {
            const match = pkgRes.data.find((p: PackageItem) => p.slug === initialSlug || p.id === initialSlug);
            if (match) setSelectedPkg(match);
          } else if (pkgRes.data.length > 0) {
            setSelectedPkg(pkgRes.data[0]);
          }
        }

        if (addRes.success) {
          setAddons(addRes.data);
        }

        // Verify user authentication
        if (!userRes?.success || !userRes?.user) {
          const currentPath = initialSlug ? `/booking/${encodeURIComponent(initialSlug)}` : '/booking';
          router.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }

        // Pre-fill user details from authenticated account
        setCustomerName(userRes.user.name || '');
        setCustomerEmail(userRes.user.email || '');
        setCustomerPhone(userRes.user.phone || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, [initialSlug]);

  // Fetch slots whenever selectedPkg or selectedDate or extra addon duration changes
  useEffect(() => {
    if (!selectedPkg || !selectedDate) return;

    let isMounted = true;
    setLoadingSlots(true);

    const activeAddonIds = Object.entries(selectedAddons)
      .filter(([_, qty]) => qty > 0)
      .map(([id]) => id)
      .join(',');

    fetch(`/api/availability?packageId=${selectedPkg.id}&date=${selectedDate}&addOnIds=${activeAddonIds}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          const slots: TimeSlot[] = data.data.slots || [];
          setAvailableSlots(slots);
          // Preserve selectedSlot if it exists and is still valid
          setSelectedSlot((prev) => {
            if (!prev) return null;
            const match = slots.find((s) => s.startTime === prev.startTime && s.available);
            return match || prev;
          });
        } else {
          setAvailableSlots([]);
        }
      })
      .catch(() => {
        if (isMounted) setAvailableSlots([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPkg, selectedDate, selectedAddons]);

  // Hold slot countdown timer in Step 5
  useEffect(() => {
    if (currentStep !== 5 || !bookingResult) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, bookingResult]);

  // Calculations
  const packagePrice = selectedPkg?.price || 0;
  const addonsTotal = addons.reduce((sum, a) => {
    const qty = selectedAddons[a.id] || 0;
    return sum + a.price * qty;
  }, 0);
  const subtotal = packagePrice + addonsTotal;
  const totalPrice = Math.max(0, subtotal - promoDiscount);
  const dpAmount = Math.round(totalPrice * 0.3);
  const remainingAmount = totalPrice - dpAmount;
  const paymentAmountToPay = paymentType === 'DP' ? dpAmount : totalPrice;

  // Handle promo code application
  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsCheckingPromo(true);
    setPromoMessage(null);
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setPromoDiscount(data.data.discountAmount);
        setPromoMessage({
          text: `Kode "${data.data.code}" berhasil diterapkan! Diskon ${formatRupiah(data.data.discountAmount)}`,
          isError: false,
        });
      } else {
        setPromoDiscount(0);
        setPromoMessage({ text: data.message || 'Kode promo tidak valid', isError: true });
      }
    } catch {
      setPromoMessage({ text: 'Gagal memvalidasi kode promo', isError: true });
    } finally {
      setIsCheckingPromo(false);
    }
  };

  // Submit Booking (Step 4 -> 5)
  const handleCreateBooking = async () => {
    if (!selectedPkg || !selectedSlot) {
      setErrorMessage('Silakan pilih paket foto dan slot jam terlebih dahulu.');
      return;
    }
    if (!customerName || !customerEmail || !customerPhone) {
      setErrorMessage('Silakan lengkapi data diri Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const addOnsPayload = Object.entries(selectedAddons)
        .filter(([_, qty]) => qty > 0)
        .map(([addOnId, qty]) => ({ addOnId, qty }));

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          roomId: selectedSlot.roomId,
          startTime: selectedSlot.startTime,
          guestName: customerName,
          guestEmail: customerEmail,
          guestPhone: customerPhone,
          notes: customerNotes,
          paymentType,
          paymentMethod,
          promoCode: promoDiscount > 0 ? promoInput : undefined,
          addOns: addOnsPayload,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.message || 'Terjadi kendala saat memesan slot.');
        setIsSubmitting(false);
        return;
      }

      setBookingResult(data.data);
      setCountdownSeconds(900); // 15 mins
      setCurrentStep(5);
    } catch (err: any) {
      setErrorMessage(err.message || 'Koneksi bermasalah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate instant payment (for demo & testing)
  const handleSimulatePayment = async () => {
    if (!bookingResult) return;
    setIsSimulatingPayment(true);
    try {
      const res = await fetch('/api/payments/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode: bookingResult.bookingCode,
          paymentId: bookingResult.payment.paymentId,
          method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/booking/status/${bookingResult.bookingCode}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  // Format countdown mm:ss
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loadingInitial) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
        <p className="text-sm text-stone-500">Memuat paket dan jadwal studio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Stepper Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-3xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-stone-200 -z-0" />
          {[
            { num: 1, title: 'Paket & Waktu' },
            { num: 2, title: 'Add-on' },
            { num: 3, title: 'Data Diri' },
            { num: 4, title: 'Pembayaran' },
            { num: 5, title: 'Selesaikan' },
          ].map((st) => (
            <div
              key={st.num}
              onClick={() => {
                if (st.num < currentStep) {
                  setCurrentStep(st.num);
                }
              }}
              className={`relative z-10 flex flex-col items-center ${
                st.num < currentStep ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-sm ${
                  currentStep === st.num
                    ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-100 scale-105'
                    : currentStep > st.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-stone-400 border border-stone-300'
                }`}
              >
                {currentStep > st.num ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-semibold mt-1.5 hidden sm:block ${
                  currentStep === st.num ? 'text-stone-900' : 'text-stone-400'
                }`}
              >
                {st.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5 max-w-4xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Container with 2-Column Desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Current Step Content */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          {/* STEP 1: Package, Date & Slot Selection */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1">
                  1. Pilih Paket & Waktu Sesi
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">
                  Tentukan paket foto yang Anda inginkan dan pilih jadwal slot jam yang tersedia.
                </p>
              </div>

              {/* Package Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                  Pilih Paket Foto:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => {
                        setSelectedPkg(pkg);
                        setSelectedSlot(null);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedPkg?.id === pkg.id
                          ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/30'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-sm text-stone-900">{pkg.name}</span>
                        <span className="text-xs font-semibold text-amber-700 shrink-0">
                          {formatRupiah(pkg.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {pkg.durationMinutes} mnt
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-600" />
                          Maks {pkg.maxPeople} org
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Pilih Tanggal Sesi:
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot(null);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm"
                    />
                  </div>
                  <span className="text-xs text-stone-500">
                    Studio Buka 09:00 - 21:00 WIB
                  </span>
                </div>
              </div>

              {/* Real-time Time Slots Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Pilih Slot Jam Tersedia (Real-time):
                  </label>
                  <div className="flex items-center gap-3 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tersedia
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-300" /> Terisi / Penuh
                    </span>
                  </div>
                </div>

                {loadingSlots ? (
                  <div className="py-12 text-center text-stone-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    <span className="text-xs">Memeriksa ketersediaan slot real-time...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 text-stone-500 text-xs">
                    Tidak ada slot operasional pada tanggal yang dipilih. Silakan pilih hari lain.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {availableSlots.map((slot, idx) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400 shadow-md scale-105'
                              : slot.available
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                              : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.time}
                          {slot.available && (
                            <span className="block text-[9px] font-normal opacity-75">
                              {slot.roomName ? slot.roomName.split('-')[0] : 'Ready'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedSlot && (
                  <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                    <div>
                      <strong>Slot Terpilih:</strong> {selectedSlot.time} WIB ({selectedDate})
                      {selectedSlot.roomName && ` • ${selectedSlot.roomName}`}
                    </div>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Slot Siap Dipesan
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setCurrentStep(2)}
                  className="px-7 py-3 rounded-xl text-sm font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2"
                >
                  Lanjut ke Add-on
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Add-Ons Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1">
                  2. Pilih Tambahan (Add-on)
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">
                  Lengkapi sesi foto Anda dengan cetak frame kayu minimalis, album hardcover, atau tambahan rias makeup artist.
                </p>
              </div>

              <div className="space-y-3">
                {addons.map((a) => {
                  const qty = selectedAddons[a.id] || 0;
                  return (
                    <div
                      key={a.id}
                      className={`p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${
                        qty > 0 ? 'border-amber-400 bg-amber-50/40' : 'border-stone-200 bg-stone-50/30'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-stone-900">{a.name}</h4>
                          {a.extraMinutes > 0 && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                              +{a.extraMinutes} menit
                            </span>
                          )}
                        </div>
                        {a.description && (
                          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                            {a.description}
                          </p>
                        )}
                        <span className="text-xs font-bold text-amber-700 mt-1.5 block">
                          {formatRupiah(a.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 bg-white border border-stone-300 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAddons((prev) => ({
                              ...prev,
                              [a.id]: Math.max(0, (prev[a.id] || 0) - 1),
                            }))
                          }
                          className="w-7 h-7 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{qty}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAddons((prev) => ({
                              ...prev,
                              [a.id]: (prev[a.id] || 0) + 1,
                            }))
                          }
                          className="w-7 h-7 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nav buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-7 py-3 rounded-xl text-sm font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 flex items-center gap-2"
                >
                  Lanjut ke Data Diri
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Customer Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1">
                  3. Isi Data Pemesan
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">
                  Konfirmasi booking dan E-Ticket QR akan dikirimkan otomatis ke WhatsApp & Email Anda.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dimas Pratama"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Nomor WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">
                      Untuk pengiriman link tiket & notifikasi reminder.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Contoh: nama@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Bawa anjing peliharaan kecil, konsep baju adat Jawa, request fotografer sabar..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              {/* Nav buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={!customerName || !customerPhone || !customerEmail}
                  onClick={() => setCurrentStep(4)}
                  className="px-7 py-3 rounded-xl text-sm font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
                >
                  Lanjut ke Ringkasan & Bayar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Payment Selection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1">
                  4. Ringkasan Pesanan & Pembayaran
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">
                  Periksa rincian pemesanan Anda, terapkan kode promo jika ada, dan pilih metode pembayaran.
                </p>
              </div>

              {/* Promo Code Box */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Punya Kode Promo / Voucher?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: LUMINA10 / WISUDA2026"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-lg border border-stone-300 text-sm uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <button
                    type="button"
                    disabled={isCheckingPromo || !promoInput.trim()}
                    onClick={applyPromo}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-stone-900 text-stone-100 hover:bg-stone-800 disabled:opacity-40"
                  >
                    {isCheckingPromo ? 'Mengecek...' : 'Terapkan'}
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-xs mt-2 font-medium ${
                      promoMessage.isError ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* DP vs Full Payment Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                  Pilih Skema Pembayaran:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentType('DP')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentType === 'DP'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/40'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-stone-900">Uang Muka (DP 30%)</span>
                      <span className="font-extrabold text-sm text-amber-700">
                        {formatRupiah(dpAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Amankan slot jadwal Anda hari ini. Sisa tagihan ({formatRupiah(remainingAmount)}) dilunasi saat sesi foto di studio.
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentType('FULL')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentType === 'FULL'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/40'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-stone-900">Pelunasan Langsung (100%)</span>
                      <span className="font-extrabold text-sm text-stone-900">
                        {formatRupiah(totalPrice)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Bayar lunas di awal tanpa perlu memikirkan pembayaran lagi saat hari pemotretan tiba.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Method */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                  Metode Pembayaran Online:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'QRIS', label: 'QRIS', sub: 'BCA, Mandiri, GoPay, Dana', icon: QrCode },
                    { id: 'VA_BCA', label: 'BCA Virtual Account', sub: 'Otomatis 24 Jam', icon: Building },
                    { id: 'VA_MANDIRI', label: 'Mandiri VA', sub: 'Otomatis 24 Jam', icon: Building },
                    { id: 'VA_BRI', label: 'BRI Virtual Account', sub: 'Otomatis 24 Jam', icon: Building },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          paymentMethod === m.id
                            ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/40'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/30'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-amber-600 mb-2" />
                        <span className="block font-bold text-xs text-stone-900">{m.label}</span>
                        <span className="block text-[10px] text-stone-500 mt-0.5">{m.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nav buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateBooking}
                  className="px-8 py-3.5 rounded-xl text-sm font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses Slot...
                    </>
                  ) : (
                    <>
                      Kunci Slot & Bayar ({formatRupiah(paymentAmountToPay)})
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Payment Hold Slot Countdown & Simulation */}
          {currentStep === 5 && bookingResult && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block mb-1">
                  Slot Jadwal Ditahan Sementara
                </span>
                <div className="text-3xl font-extrabold text-amber-900 font-mono">
                  {formatCountdown(countdownSeconds)}
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Harap selesaikan pembayaran sebelum batas waktu berakhir agar slot tidak otomatis dilepas ke orang lain.
                </p>
              </div>

              {/* Payment Details */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                <div className="text-center mb-6">
                  <span className="text-xs text-stone-500 block mb-1">Total Tagihan Yang Harus Dibayar:</span>
                  <span className="text-3xl font-extrabold text-stone-900">
                    {formatRupiah(bookingResult.payment.amount)}
                  </span>
                  <span className="text-xs text-stone-500 block mt-1">
                    {bookingResult.payment.type === 'DP' ? 'Uang Muka (DP 30%)' : 'Pembayaran Lunas 100%'}
                  </span>
                </div>

                {paymentMethod === 'QRIS' ? (
                  <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-white rounded-2xl border border-stone-200 shadow-md">
                      {/* Realistic simulated QRIS frame */}
                      <div className="w-56 h-56 bg-stone-900 rounded-xl flex flex-col items-center justify-center p-3 text-white">
                        <QrCode className="w-36 h-36 text-amber-400 mb-2" />
                        <span className="text-[10px] font-mono tracking-wider">
                          QRIS LUMINA PHOTO STUDIO
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500">
                      Pindai kode QRIS di atas memakai aplikasi BCA, Mandiri, GoPay, OVO, ShopeePay, atau m-Banking Anda.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Nomor Virtual Account ({paymentMethod.replace('VA_', '')}):
                    </span>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-stone-100 font-mono font-bold text-lg text-stone-900">
                      <span>{bookingResult.payment.vaNumber || '8801299945'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(bookingResult.payment.vaNumber || '8801299945');
                          setCopiedVa(true);
                          setTimeout(() => setCopiedVa(false), 2000);
                        }}
                        className="px-3 py-1 rounded bg-stone-200 hover:bg-stone-300 text-xs text-stone-700 flex items-center gap-1"
                      >
                        {copiedVa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedVa ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                    <p className="text-xs text-stone-500">
                      Transfer tepat sesuai nominal tagihan melalui ATM, Mobile Banking, atau Internet Banking.
                    </p>
                  </div>
                )}
              </div>

              {/* Instant Simulator Button for Testing */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Mode Pengujian / Simulasi Payment Gateway
                </span>
                <p className="text-xs text-emerald-700">
                  Klik tombol di bawah untuk langsung memicu webhook pembayaran berhasil dan mencetak E-Ticket QR Anda.
                </p>
                <button
                  type="button"
                  disabled={isSimulatingPayment}
                  onClick={handleSimulatePayment}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all"
                >
                  {isSimulatingPayment ? (
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

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push(`/booking/status/${bookingResult.bookingCode}`)}
                  className="text-xs font-semibold text-stone-600 hover:text-amber-600 flex items-center justify-center gap-1 mx-auto"
                >
                  Lihat Halaman Status Booking Langsung →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Order Summary */}
        <div className="lg:col-span-4 sticky top-24 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h3 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3 mb-4">
            Ringkasan Pesanan
          </h3>

          {selectedPkg ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-stone-400 block mb-0.5">Paket Foto:</span>
                <div className="flex items-center justify-between">
                  <strong className="text-stone-900 text-sm">{selectedPkg.name}</strong>
                  <span className="font-semibold text-stone-900">{formatRupiah(packagePrice)}</span>
                </div>
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Durasi {selectedPkg.durationMinutes} mnt • Maks {selectedPkg.maxPeople} orang
                </span>
              </div>

              {selectedSlot && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-stone-400 block mb-0.5">Jadwal Sesi:</span>
                  <div className="font-bold text-stone-900">
                    {selectedDate} • {selectedSlot.time} WIB
                  </div>
                  {selectedSlot.roomName && (
                    <span className="text-[11px] text-stone-500">{selectedSlot.roomName}</span>
                  )}
                </div>
              )}

              {/* Add-ons List */}
              {addonsTotal > 0 && (
                <div className="pt-2 border-t border-stone-100 space-y-1.5">
                  <span className="text-stone-400 block mb-0.5">Add-on Terpilih:</span>
                  {addons.map((a) => {
                    const qty = selectedAddons[a.id] || 0;
                    if (qty <= 0) return null;
                    return (
                      <div key={a.id} className="flex justify-between text-stone-700">
                        <span>
                          {a.name} × {qty}
                        </span>
                        <span className="font-medium">{formatRupiah(a.price * qty)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Calculation Summary */}
              <div className="pt-3 border-t border-stone-200 space-y-1.5 font-medium text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Promo</span>
                    <span>-{formatRupiah(promoDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total Biaya</span>
                  <span>{formatRupiah(totalPrice)}</span>
                </div>
              </div>

              {/* Payment Phase Breakdown */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between font-bold text-amber-900">
                  <span>Yang Dibayar Sekarang ({paymentType}):</span>
                  <span>{formatRupiah(paymentAmountToPay)}</span>
                </div>
                {paymentType === 'DP' && (
                  <div className="flex justify-between text-stone-500">
                    <span>Sisa Pelunasan di Studio:</span>
                    <span>{formatRupiah(remainingAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-400">Silakan pilih paket foto terlebih dahulu.</p>
          )}
        </div>
      </div>
    </div>
  );
}

