'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Camera, Lock, Mail, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        if (redirectParam && redirectParam.startsWith('/')) {
          router.push(redirectParam);
        } else if (data.data.role === 'ADMIN' || data.data.role === 'OWNER') {
          router.push('/admin');
        } else {
          router.push('/my-bookings');
        }
        router.refresh();
      } else {
        setError(data.message || 'Email atau password salah. Silakan coba lagi.');
      }
    } catch {
      setError('Terjadi kendala jaringan saat menghubungkan ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 shadow-xl shadow-stone-200/50">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/20">
          <Camera className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Masuk ke Akun Anda
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
          {redirectParam
            ? 'Silakan masuk terlebih dahulu untuk melanjutkan pemesanan jadwal sesi foto.'
            : 'Akses riwayat pemesanan sesi foto, e-ticket QR, atau dashboard studio.'}
        </p>
      </div>

      {redirectParam && (
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
          <span>Autentikasi diperlukan sebelum memilih slot jadwal pemotretan.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Alamat Email
          </label>
          <div className="relative">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-stone-50/50 transition-all"
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-11 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-stone-50/50 transition-all font-mono"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors focus:outline-none"
              title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memverifikasi Akun...
            </>
          ) : (
            <>
              Masuk Sekarang
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
        Belum memiliki akun?{' '}
        <Link
          href={redirectParam ? `/auth/register?redirect=${encodeURIComponent(redirectParam)}` : '/auth/register'}
          className="font-bold text-amber-600 hover:text-amber-700 hover:underline"
        >
          Daftar akun gratis
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
              <p className="text-xs text-stone-400">Memuat halaman masuk...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
