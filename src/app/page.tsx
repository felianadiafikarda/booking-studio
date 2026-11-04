import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import {
  Camera,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Star,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Users,
  Award,
  ChevronRight,
  Check,
  Zap,
  Sliders,
  Maximize2,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { formatRupiah } from '@/components/UiBadges';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [packages, reviews, galleryItems] = await Promise.all([
    prisma.package.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      take: 6,
    }),
    prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.galleryItem.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      take: 6,
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-950 text-stone-100 py-20 lg:py-28">
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-1/4 -mt-20 w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-20 w-96 h-96 rounded-full bg-amber-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/90 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium tracking-wide shadow-inner">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Studio Foto Modern Yogyakarta • Rating 4.9/5 dari 1.200+ Sesi</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-100 leading-[1.14]">
                Abadikan Setiap Momen dengan{' '}
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent underline decoration-amber-500/40 decoration-wavy underline-offset-8">
                  Estetika Sempurna
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Pilih paket, cek ketersediaan slot jam secara <strong>real-time</strong>, dan amankan jadwal sesi foto Anda langsung tanpa perlu chat manual berulang.
              </p>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-stone-300">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900/60 border border-stone-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Garansi Anti Double-Booking</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900/60 border border-stone-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cukup DP 30%</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900/60 border border-stone-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>E-Ticket QR Otomatis</span>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/booking"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-base font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 hover:from-amber-400 hover:to-amber-300 active:scale-95 transition-all shadow-xl shadow-amber-500/25 min-h-[50px] group"
                >
                  <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Reservasi Jadwal Sekarang
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/packages"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-base font-medium border border-stone-700 hover:border-amber-400/50 text-stone-200 hover:bg-stone-900 transition-colors min-h-[50px]"
                >
                  Jelajahi Paket Studio
                </Link>
              </div>
            </div>

            {/* Right Column: Spotlight Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-900 group">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                  alt="Lumina Luxe Prewedding Photoshoot"
                  className="w-full h-84 sm:h-[420px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                {/* Floating badge top left */}
                <div className="absolute top-4 left-4 bg-stone-900/90 backdrop-blur-md border border-stone-700 text-stone-100 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-medium">Slot Hari Ini Tersedia</span>
                </div>

                {/* Bottom Card Spotlight */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-stone-900/95 backdrop-blur-md border border-stone-700/80 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                        Spotlight Paket Favorit
                      </span>
                      <h4 className="text-stone-100 font-bold text-base mt-0.5">Prewedding Cinematic & Glamour</h4>
                      <p className="text-xs text-stone-400">Durasi 120 Menit • 25 Foto Retouch • Akses 2 Konsep Studio</p>
                    </div>
                    <Link
                      href="/booking/prewedding-cinematic"
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shrink-0 ml-3"
                    >
                      Pilih
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Guarantee Bar */}
      <section className="bg-stone-900 text-stone-200 border-b border-stone-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100">Booking &lt; 3 Menit</h4>
                <p className="text-xs text-stone-400">Pilih slot jam & checkout instan</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100">Slot Hold 15 Menit</h4>
                <p className="text-xs text-stone-400">Slot terkunci aman saat transfer</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100">2 Pilihan Konsep Studio</h4>
                <p className="text-xs text-stone-400">Cyclorama & Earth Tone Room</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-100">Bebas Reschedule H-2</h4>
                <p className="text-xs text-stone-400">Ganti jadwal mandiri tanpa ribet</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Room Concepts Showcase */}
      <section className="py-20 bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">
              Fasilitas Eksklusif
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-2">
              Dua Konsep Studio dalam Satu Lokasi
            </h2>
            <p className="text-stone-600 mt-3 text-sm sm:text-base">
              Setiap studio dilengkapi lighting standar komersial Profoto & Godox, AC dingin, ruang ganti privat, dan area rias cermin profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Studio 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all">
              <div className="relative h-64 sm:h-72 overflow-hidden bg-stone-900">
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
                  alt="Studio A Warm Aesthetic"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-amber-500 text-stone-950 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Studio A
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-serif font-bold text-stone-900">Warm Aesthetic & Boho Set</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    Warm & Cozy
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Didesain khusus untuk foto keluarga, maternity, wisuda berkesan hangat, dan prewedding intimate dengan properti kayu jati, kursi rotan, dan pencahayaan lembut.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-md">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Properti Vintage & Kursi Rotan
                  </span>
                  <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-md">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Earth Tone Wall Palette
                  </span>
                  <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-md">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Softbox Octa 120cm
                  </span>
                </div>
              </div>
            </div>

            {/* Studio 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all">
              <div className="relative h-64 sm:h-72 overflow-hidden bg-stone-900">
                <img
                  src="https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=800&q=80"
                  alt="Studio B Infinity Cyclorama"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-stone-900 text-stone-100 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-stone-700">
                  Studio B
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-serif font-bold text-stone-900">Infinity Cyclorama & High Fashion</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    Clean & High Fashion
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Dinding lengkung mulus tanpa sudut pandang sudut (seamless wall) untuk foto wisuda grup besar, editorial fashion, personal branding, hingga katalog produk komersial.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-md">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Dinding Lengkung Seamless Putih
                  </span>
                  <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-md">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> RGB Color Tube & Gel Effect
                  </span>
                  <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-md">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Kapasitas Rombongan s/d 15 Orang
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">
            Pilihan Paket Terpopuler
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-2">
            Paket Foto Studio Sesuai Momen Anda
          </h2>
          <p className="text-stone-600 mt-3 text-sm sm:text-base">
            Semua paket sudah termasuk fasilitas studio, soft file resolusi tinggi via Google Drive, dan bimbingan pose fotografer ramah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
            return (
              <div
                key={pkg.id}
                className="flex flex-col bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-2xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                {/* Photo header */}
                <div className="relative h-60 overflow-hidden bg-stone-100">
                  <img
                    src={pkg.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552'}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-stone-900/85 backdrop-blur-sm text-stone-100 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {pkg.durationMinutes} Menit
                  </div>
                </div>

                {/* Content body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-2.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        Maks {pkg.maxPeople} Orang
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        {pkg.photoCount} Foto Retouch
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="my-5 border-t border-stone-100 pt-4">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2.5">
                        Fasilitas Termasuk:
                      </span>
                      <ul className="space-y-2 text-xs text-stone-600">
                        {Array.isArray(features) &&
                          features.slice(0, 4).map((f: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-tight">{f}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing footer */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[11px] text-stone-400 block font-medium">Mulai dari</span>
                      <span className="text-xl font-extrabold text-stone-900">
                        {formatRupiah(Number(pkg.price))}
                      </span>
                      <span className="text-[10px] text-emerald-600 block font-semibold">
                        DP 30%: {formatRupiah(Math.round(Number(pkg.price) * 0.3))}
                      </span>
                    </div>

                    <Link
                      href={`/booking/${pkg.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-900 text-stone-100 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors active:scale-95 shadow-sm"
                    >
                      Pilih & Jadwalkan
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold border border-stone-300 hover:border-amber-500 hover:text-amber-600 transition-colors bg-white shadow-sm"
          >
            Lihat Semua Pilihan Paket ({packages.length}+)
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Booking Flow Stepper Section */}
      <section className="bg-stone-900 text-stone-100 py-20 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              Proses Pemesanan Mudah
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-2">
              Alur Booking Cepat Tanpa Ribet
            </h2>
            <p className="text-stone-400 mt-3 text-sm">
              Selesaikan proses pemesanan sesi foto Anda hanya dalam 4 langkah terstruktur dalam hitungan menit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="p-6 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-lg mb-4 shadow-lg shadow-amber-500/20">
                1
              </div>
              <h3 className="text-base font-bold text-stone-100 mb-2">Pilih Tanggal & Jam</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Pilih tanggal di kalender dan lihat ketersediaan slot jam secara langsung dan akurat tanpa bentrok jadwal.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-lg mb-4 shadow-lg shadow-amber-500/20">
                2
              </div>
              <h3 className="text-base font-bold text-stone-100 mb-2">Pilih Add-on</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Tambahkan cetak frame 12R, album hardcover, ekstra orang, atau MUA rias profesional sesuai keinginan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-lg mb-4 shadow-lg shadow-amber-500/20">
                3
              </div>
              <h3 className="text-base font-bold text-stone-100 mb-2">Bayar DP 30% / Lunas</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Pembayaran otomatis instan via QRIS, Virtual Account Mandiri/BCA/BRI, atau E-wallet dengan garansi slot hold 15 menit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-lg mb-4 shadow-lg shadow-amber-500/20">
                4
              </div>
              <h3 className="text-base font-bold text-stone-100 mb-2">Dapatkan E-Ticket QR</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Konfirmasi instan dikirim via WhatsApp & Email dengan kode QR siap check-in langsung saat tiba di studio.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
            >
              Mulai Pemesanan Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">
              Portofolio Karya
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-2">
              Sentuhan Karya Lumina Luxe
            </h2>
          </div>
          <Link
            href="/gallery"
            className="mt-4 md:mt-0 text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            Buka Galeri Lengkap →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="group relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-stone-200 border border-stone-200 shadow-sm"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                  {item.category}
                </span>
                <h4 className="text-sm font-bold text-stone-100">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-stone-100 py-20 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">
              Ulasan Pelanggan
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-2">
              Apa Kata Mereka Tentang Kami
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-700 italic leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100">
                  <span className="font-bold text-sm text-stone-900 block">{rev.customerName}</span>
                  <span className="text-xs text-stone-500">Pelanggan Terverifikasi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-stone-100 rounded-3xl overflow-hidden border border-stone-800 shadow-xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                Kunjungi Studio Kami
              </span>
              <h2 className="text-3xl font-serif font-bold text-stone-100 mt-2 mb-4">
                Lokasi Strategis di Pusat Kota Yogyakarta
              </h2>
              <p className="text-sm text-stone-400 leading-relaxed mb-6">
                Mudah dijangkau dengan area parkir luas, ruang ganti ber-AC nyaman, ruang makeup representatif, dan spot foto berkelas.
              </p>

              <div className="space-y-3 text-sm text-stone-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Jl. Malioboro No. 88, Sosromenduran, Gedong Tengen, Kota Yogyakarta</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Buka Setiap Hari: 09:00 - 21:00 WIB</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="https://maps.google.com/?q=Lumina+Photo+Studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full text-sm font-semibold bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 transition-colors"
                >
                  Petunjuk Arah Google Maps
                </a>
                <a
                  href="https://wa.me/6285265416588"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-2"
                >
                  Tanya via WhatsApp
                </a>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden h-72 border border-stone-800 bg-stone-800 relative">
              <iframe
                title="Peta Studio Foto"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15811.968257041743!2d110.3601732!3d-7.7909347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a57876a3e1fc7%3A0x7d027e1f4d96cba7!2sJl.%20Malioboro%2C%20Sosromenduran%2C%20Gedong%20Tengen%2C%20Kota%20Yogyakarta%2C%20Daerah%20Istimewa%20Yogyakarta!5e0!3m2!1sid!2sid!4v1690000000000!5m2!1sid!2sid"
                className="w-full h-full border-0 grayscale opacity-85 hover:grayscale-0 transition-all"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom Sticky CTA on Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 p-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[11px] text-amber-400 font-semibold block">Booking Online Studio</span>
          <span className="text-xs text-stone-300">Slot Real-time 24 Jam</span>
        </div>
        <Link
          href="/booking"
          className="px-5 py-2.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md"
        >
          Pilih Jadwal Sekarang
        </Link>
      </div>

      <Footer />
    </div>
  );
}
