'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Clock,
  Loader2,
  X,
  FileText,
  ShieldCheck,
  RefreshCw,
  Activity,
} from 'lucide-react';
import TablePagination from '@/components/TablePagination';

interface AuditLogItem {
  id: string;
  userId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionCategory, setActionCategory] = useState<string>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 1. Role verification
      const userRes = await fetch('/api/auth/me').then((r) => r.json());
      if (!userRes?.success || userRes?.user?.role !== 'OWNER') {
        router.replace('/admin');
        return;
      }

      // 2. Fetch logs (fetch up to 500 for fast instant client filtering & sorting)
      const r = await fetch('/api/admin/audit-logs?limit=500');
      const d = await r.json();
      if (d.success) {
        setLogs(d.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [router]);

  // Filtering Logic
  const filteredLogs = logs.filter((log) => {
    // Search text filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const userName = log.user?.name?.toLowerCase() || 'sistem / tamu';
      const userEmail = log.user?.email?.toLowerCase() || '';
      const action = log.action?.toLowerCase() || '';
      const entity = log.entity?.toLowerCase() || '';
      const entityId = log.entityId?.toLowerCase() || '';
      const details = log.details?.toLowerCase() || '';

      const match =
        userName.includes(q) ||
        userEmail.includes(q) ||
        action.includes(q) ||
        entity.includes(q) ||
        entityId.includes(q) ||
        details.includes(q);

      if (!match) return false;
    }

    // Action Category Filter
    if (actionCategory === 'BOOKING') {
      return log.entity === 'BOOKING' || log.action.includes('BOOKING');
    }
    if (actionCategory === 'PROMO') {
      return log.entity === 'PROMO' || log.action.includes('PROMO');
    }
    if (actionCategory === 'SLOT') {
      return log.entity === 'BLOCKED_SLOT' || log.action.includes('SLOT');
    }
    if (actionCategory === 'SETTING') {
      return log.entity === 'STUDIO_SETTING' || log.action.includes('SETTING');
    }

    return true;
  });

  // Client-side pagination
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (action.includes('DELETE') || action.includes('CANCEL')) {
      return 'bg-rose-100 text-rose-800 border-rose-300';
    }
    if (action.includes('UPDATE') || action.includes('TOGGLE')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    return 'bg-amber-100 text-amber-900 border-amber-300';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Audit Log Aktivitas Staf
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Khusus Owner
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Rekaman jejak audit sistem: perubahan status booking, manipulasi promo, pemblokiran slot, dan perubahan pengaturan studio.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 active:scale-95 flex items-center gap-1.5 self-start sm:self-auto border border-stone-200 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Filter */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari nama staf, aksi, entitas, atau rincian..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Semua Log', count: logs.length },
              {
                id: 'BOOKING',
                label: 'Booking',
                count: logs.filter((l) => l.entity === 'BOOKING' || l.action.includes('BOOKING')).length,
              },
              {
                id: 'PROMO',
                label: 'Promo',
                count: logs.filter((l) => l.entity === 'PROMO' || l.action.includes('PROMO')).length,
              },
              {
                id: 'SLOT',
                label: 'Slot Studio',
                count: logs.filter((l) => l.entity === 'BLOCKED_SLOT' || l.action.includes('SLOT')).length,
              },
              {
                id: 'SETTING',
                label: 'Sistem Studio',
                count: logs.filter((l) => l.entity === 'STUDIO_SETTING' || l.action.includes('SETTING')).length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActionCategory(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  actionCategory === tab.id
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
            <p className="text-xs text-stone-500">Memuat catatan log audit...</p>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            {search || actionCategory !== 'ALL'
              ? 'Tidak ada log yang cocok dengan kriteria pencarian.'
              : 'Belum ada aktivitas staf atau sistem yang tercatat.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Aktor / Pengguna</th>
                  <th className="py-3 px-4">Jenis Aksi</th>
                  <th className="py-3 px-4">Entitas Terkait</th>
                  <th className="py-3 px-4">Rincian Data Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedLogs.map((log) => {
                  const time = new Date(log.createdAt);

                  return (
                    <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-stone-600 whitespace-nowrap">
                        <div className="font-semibold text-stone-800">
                          {time.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {time.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}{' '}
                          WIB
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.user ? (
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-stone-500" />
                              <span>{log.user.name}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 font-mono block">
                              {log.user.email} •{' '}
                              <span
                                className={`font-bold ${
                                  log.user.role === 'OWNER' ? 'text-amber-700' : 'text-blue-700'
                                }`}
                              >
                                {log.user.role}
                              </span>
                            </span>
                          </div>
                        ) : (
                          <div className="text-stone-500 italic flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-stone-400" />
                            <span>Sistem Otomatis / Tamu</span>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-md font-mono font-bold text-[11px] border ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-stone-800 block">{log.entity}</span>
                        {log.entityId && (
                          <span className="font-mono text-[10px] text-stone-400 block">
                            ID: #{log.entityId.slice(0, 10)}...
                          </span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px] max-w-md break-words">
                        {log.details || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Enterprise Standard Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="log aktivitas"
        />
      </div>
    </div>
  );
}
