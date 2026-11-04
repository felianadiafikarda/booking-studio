'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  UserPlus,
  Package,
  Ban,
  Tag,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  Camera,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; role: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && (data.user.role === 'ADMIN' || data.user.role === 'OWNER')) {
          setUser(data.user);
        } else {
          router.push('/auth/login');
        }
      })
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  };

  const allNavItems = [
    { href: '/admin', label: 'Ringkasan', icon: LayoutDashboard },
    { href: '/admin/calendar', label: 'Kalender Jadwal', icon: Calendar },
    { href: '/admin/bookings', label: 'Kelola Booking', icon: ClipboardList },
    { href: '/admin/manual-booking', label: 'Booking Manual (Walk-in)', icon: UserPlus },
    { href: '/admin/packages', label: 'Paket & Add-on', icon: Package },
    { href: '/admin/blocked-slots', label: 'Blokir Slot Manual', icon: Ban },
    { href: '/admin/promos', label: 'Promo & Voucher', icon: Tag },
    { href: '/admin/reports', label: 'Laporan & Ekspor', icon: BarChart3, ownerOnly: true },
    { href: '/admin/settings', label: 'Pengaturan Studio', icon: Settings, ownerOnly: true },
    { href: '/admin/audit-logs', label: 'Audit Log', icon: ShieldAlert, ownerOnly: true },
  ];

  // RBAC: completely filter out owner-only menus for staff admin
  const visibleNavItems = allNavItems.filter((item) => {
    if (item.ownerOnly && user?.role !== 'OWNER') {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-stone-100">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-stone-900">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold">
            <Camera className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-serif font-bold text-base tracking-wider text-amber-200">
            LUMINA ADMIN
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-stone-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-stone-900 text-stone-200 flex flex-col z-40 border-r border-stone-800 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-md">
              <Camera className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-stone-100 tracking-wider">
                LUMINA LUXE
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-amber-400">
                Staff Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* User Badge */}
        <div className="px-5 py-3 border-b border-stone-800/80 bg-stone-950/40">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Login Sebagai:</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="font-bold text-xs text-stone-200 truncate">{user.name}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {user.role}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-stone-800 space-y-2 bg-stone-950/30">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Buka Website Publik
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

