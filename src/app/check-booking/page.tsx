'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, Ticket, Sparkles, ArrowRight } from 'lucide-react';

export default function CheckBookingPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/booking/status/${code.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Cek Status & E-Ticket
          </h1>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Masukkan Kode Booking yang Anda terima saat reservasi (contoh: <strong>BK-261028-XXXX</strong>) untuk melihat status jadwal dan QR Code check-in.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <input
                type="text"
                required
                placeholder="Contoh: BK-202610-001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 text-center rounded-xl border border-stone-300 text-base font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Periksa Status Booking
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-xs text-stone-500 space-y-2 text-left">
            <span className="font-bold text-stone-700 block">💡 Tips:</span>
            <p>• Kode booking otomatis dikirimkan ke WhatsApp & Email Anda saat reservasi dibuat.</p>
            <p>• Jika kehilangan kode, hubungi admin via WhatsApp di +62 852-6541-6588.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

