import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { Camera, Clock, Users, CheckCircle2, ChevronRight, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatRupiah } from '@/components/UiBadges';

export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-200">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-stone-950 text-stone-100 py-16 sm:py-24 border-b border-stone-800 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Katalog Lengkap Sesi Foto Studio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-100">
            Pilihan Paket Foto Studio
          </h1>
          <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto mt-3">
            Transparan tanpa biaya tersembunyi. Semua paket sudah termasuk seluruh file foto softcopy original dalam Google Drive resolusi tinggi.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-300">
            <span className="flex items-center gap-1.5 bg-stone-900/80 px-3 py-1.5 rounded-lg border border-stone-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Bebas Tabrakan Jadwal
            </span>
            <span className="flex items-center gap-1.5 bg-stone-900/80 px-3 py-1.5 rounded-lg border border-stone-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Pembayaran DP 30%
            </span>
            <span className="flex items-center gap-1.5 bg-stone-900/80 px-3 py-1.5 rounded-lg border border-stone-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Bebas Reschedule H-2
            </span>
          </div>
        </div>
      </div>

      {/* Package Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
            const dpAmount = Math.round(Number(pkg.price) * 0.3);

            return (
              <div
                key={pkg.id}
                className="flex flex-col bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-2xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div className="relative h-64 bg-stone-100 overflow-hidden">
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

                    <h2 className="text-xl font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                      {pkg.name}
                    </h2>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="my-5 border-t border-stone-100 pt-4">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2.5">
                        Fasilitas Termasuk:
                      </span>
                      <ul className="space-y-2 text-xs text-stone-600">
                        {Array.isArray(features) &&
                          features.map((f: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-tight">{f}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[11px] text-stone-400 block font-medium">Harga Paket</span>
                      <span className="text-xl font-extrabold text-stone-900">
                        {formatRupiah(Number(pkg.price))}
                      </span>
                      <span className="text-[10px] text-emerald-600 block font-semibold">
                        DP 30%: {formatRupiah(dpAmount)}
                      </span>
                    </div>

                    <Link
                      href={`/booking/${pkg.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-900 text-stone-100 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors active:scale-95 shadow-sm"
                    >
                      Pilih & Booking
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Booking Guarantee Note */}
        <div className="mt-16 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 text-center max-w-3xl mx-auto shadow-sm">
          <h3 className="text-lg font-serif font-bold text-stone-900">
            Perlu Paket Kustom atau Durasi Tambahan?
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Kami juga melayani sesi wisuda rombongan besar, foto produk brand fashion dengan model khusus, serta sewa studio per jam tanpa fotografer.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <a
              href="https://wa.me/6285265416588?text=Halo%20Lumina%20Luxe%20Studio,%20saya%20ingin%20konsultasi%20paket%20kustom."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Hubungi Resepsionis via WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
