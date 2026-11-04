'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Camera, Calendar, Image as ImageIcon, HelpCircle, User, Menu, X, LogOut, LayoutDashboard, Ticket } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/packages', label: 'Paket Foto', icon: Camera },
    { href: '/gallery', label: 'Galeri', icon: ImageIcon },
    { href: '/check-booking', label: 'Cek Booking', icon: Ticket },
    { href: '/faq', label: 'FAQ & Kebijakan', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif tracking-wider text-lg sm:text-xl font-bold bg-gradient-to-r from-stone-100 via-amber-100 to-amber-300 bg-clip-text text-transparent">
                LUMINA LUXE
              </span>
              <span className="block text-[10px] tracking-widest text-amber-400 uppercase -mt-1 font-sans">
                Photo Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-amber-400 bg-stone-800'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'ADMIN' || user.role === 'OWNER' ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard ({user.role})
                  </Link>
                ) : (
                  <Link
                    href="/my-bookings"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-stone-800 text-stone-200 hover:bg-stone-700 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Riwayat Saya
                  </Link>
                )}

                <span className="text-xs text-stone-400 truncate max-w-[120px]">{user.name}</span>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-stone-300 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              >
                <User className="w-4 h-4" />
                Masuk
              </Link>
            )}

            <Link
              href="/booking"
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/20"
            >
              Booking Sekarang
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/booking"
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-stone-950 shadow-sm"
            >
              Booking
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-300 hover:text-stone-100 hover:bg-stone-800 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-stone-900 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-stone-200 hover:bg-stone-800"
                >
                  <Icon className="w-5 h-5 text-amber-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-stone-800 flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-3 py-1 text-xs text-stone-400">
                  Signed in as <strong className="text-stone-200">{user.name}</strong> ({user.role})
                </div>
                {user.role === 'ADMIN' || user.role === 'OWNER' ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Buka Dashboard Admin
                  </Link>
                ) : (
                  <Link
                    href="/my-bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-stone-800 text-stone-200"
                  >
                    <Calendar className="w-4 h-4" />
                    Riwayat Booking Saya
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-stone-800"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar (Logout)
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium bg-stone-800 text-stone-200"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium border border-stone-700 text-stone-300"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

