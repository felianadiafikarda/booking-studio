'use client';

import React, { useState, useEffect } from 'react';
import { Ban, Plus, Trash2, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminBlockedSlotsPage() {
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bsRes, stRes] = await Promise.all([
        fetch('/api/admin/blocked-slots').then((r) => r.json()),
        fetch('/api/admin/settings').then((r) => r.json()),
      ]);

      if (bsRes.success) setBlockedSlots(bsRes.data);
      if (stRes.success && stRes.data.rooms) setRooms(stRes.data.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
    fetchData();
  }, []);

  const handleAddBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const [yyyy, mm, dd] = date.split('-').map(Number);

      const startUtc = new Date(Date.UTC(yyyy, mm - 1, dd, sh - 7, sm, 0));
      const endUtc = new Date(Date.UTC(yyyy, mm - 1, dd, eh - 7, em, 0));

      const res = await fetch('/api/admin/blocked-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomId || undefined,
          startTime: startUtc.toISOString(),
          endTime: endUtc.toISOString(),
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReason('');
        fetchData();
      } else {
        setError(data.message || 'Gagal memblokir slot');
      }
    } catch {
      setError('Koneksi bermasalah');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Buka kembali blokir slot ini?')) return;
    try {
      await fetch(`/api/admin/blocked-slots/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Blokir Slot Jadwal Manual
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Tutup sementara rentang jam tertentu untuk pemeliharaan alat, photoshoot privat VIP, atau libur studio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Add */}
        <form
          onSubmit={handleAddBlockedSlot}
          className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 text-xs"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 border-b border-stone-100 pb-3">
            <Ban className="w-4 h-4 text-rose-500" />
            <span>Tambah Blokir Slot Baru</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Pilih Ruangan Studio:
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
            >
              <option value="">Semua Ruangan Studio</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Tanggal Ditutup:
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Jam Mulai (WIB):
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Jam Selesai (WIB):
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Alasan Penutupan Slot:
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Maintenance lampu cyclorama, Libur Idul Fitri..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" />
                Kunci & Blokir Slot
              </>
            )}
          </button>
        </form>

        {/* List of Blocked Slots */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-3">
            Daftar Slot Terblokir Aktif ({blockedSlots.length})
          </h2>

          {loading ? (
            <div className="py-16 text-center text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
              <span className="text-xs">Memuat daftar blokir...</span>
            </div>
          ) : blockedSlots.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Belum ada slot yang diblokir manual.
            </div>
          ) : (
            <div className="space-y-3">
              {blockedSlots.map((bs) => {
                const s = new Date(bs.startTime);
                const e = new Date(bs.endTime);
                return (
                  <div
                    key={bs.id}
                    className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-rose-900">{bs.reason}</span>
                        <span className="text-[10px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full font-semibold">
                          {bs.room?.name || 'Semua Ruangan'}
                        </span>
                      </div>
                      <span className="text-stone-600 block">
                        {s.toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        •{' '}
                        {s.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {e.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                      {bs.createdBy && (
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          Dibuat oleh: {bs.createdBy}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(bs.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-100"
                      title="Buka Blokir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

