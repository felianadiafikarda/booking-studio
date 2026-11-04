'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-stone-950 shadow-md">
                <Camera className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-serif tracking-wider text-xl font-bold text-stone-100">
                LUMINA LUXE
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              Studio foto profesional dengan konsep warm aesthetic, modern cyclorama, tata pencahayaan kelas atas, dan sistem booking online otomatis tanpa ribet.
            </p>
            <div className="flex items-center gap-3 text-stone-400">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center hover:text-amber-400 hover:border-amber-500/50 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/6285265416588"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Terpercaya Sejak 2020
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-stone-100 uppercase mb-4">
              Layanan & Paket
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/packages" className="text-stone-400 hover:text-amber-400 transition-colors">
                  Prewedding Cinematic
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-stone-400 hover:text-amber-400 transition-colors">
                  Graduation / Wisuda Solo & Family
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-stone-400 hover:text-amber-400 transition-colors">
                  Harmoni Family Portrait
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-stone-400 hover:text-amber-400 transition-colors">
                  Personal & Headshot Profesional
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-stone-400 hover:text-amber-400 transition-colors">
                  Maternity Glowing Session
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-stone-400 hover:text-amber-400 transition-colors">
                  Group & Bestie Session
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Hours */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-stone-100 uppercase mb-4">
              Jam Operasional
            </h3>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-stone-200 font-medium">Senin – Minggu</p>
                  <p className="text-xs text-stone-400">09:00 – 21:00 WIB</p>
                  <p className="text-[11px] text-emerald-400 mt-1">● Buka Setiap Hari (Termasuk Libur Nasional)</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 text-xs">
                <span className="font-semibold text-stone-200 block mb-1">Booking Real-time 24 Jam</span>
                Sistem web aktif menerima reservasi online kapan saja tanpa perlu tunggu balasan admin.
              </div>
            </div>
          </div>

          {/* Studio Location & Contact */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-stone-100 uppercase mb-4">
              Kontak & Lokasi
            </h3>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">
                  Jl. Malioboro No. 88, Sosromenduran, Gedong Tengen, Kota Yogyakarta, D.I. Yogyakarta 55271
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="https://wa.me/6285265416588" className="text-xs hover:text-amber-400">
                  +62 852-6541-6588 (WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:halo@luminafoto.com" className="text-xs hover:text-amber-400">
                  halo@luminafoto.com
                </a>
              </div>
              <div className="pt-2">
                <Link
                  href="/faq"
                  className="inline-block text-xs text-amber-400 hover:underline"
                >
                  Kebijakan Reschedule & Refund Studio →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© 2026 Lumina Luxe Photo Studio. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <Link href="/faq" className="hover:text-stone-300">FAQ</Link>
            <Link href="/faq" className="hover:text-stone-300">Kebijakan Privasi</Link>
            <Link href="/auth/login" className="hover:text-stone-300">Portal Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
