'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  User,
  Phone,
  Building,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';
import { BookingStatusBadge, formatRupiah } from '@/components/UiBadges';

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [activeEvent, setActiveEvent] = useState<any | null>(null);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate);
      if (viewMode === 'day') {
        end.setHours(23, 59, 59, 999);
      } else {
        end.setDate(end.getDate() + 7);
      }

      let url = `/api/admin/calendar?start=${start.toISOString()}&end=${end.toISOString()}`;
      if (selectedRoom) url += `&roomId=${selectedRoom}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [currentDate, viewMode, selectedRoom]);

  const changeDate = (deltaDays: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + deltaDays);
    setCurrentDate(next);
  };

  const formattedDateTitle = currentDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Kalender Jadwal Sesi Foto
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Visibilitas penuh jadwal studio untuk mencegah bentrok dan memantau pemakaian ruangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Room filter */}
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white text-stone-800"
          >
            <option value="">Semua Ruangan Studio</option>
            <option value="room-a-warm">Studio A (Warm Aesthetic)</option>
            <option value="room-b-cyclorama">Studio B (Cyclorama)</option>
          </select>

          {/* Day / Week toggle */}
          <div className="bg-stone-200 p-0.5 rounded-xl flex">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'day' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'week' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
              }`}
            >
              Mingguan
            </button>
          </div>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
        <button
          onClick={() => changeDate(viewMode === 'day' ? -1 : -7)}
          className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="font-bold text-sm sm:text-base text-stone-900">
            {formattedDateTitle}
          </span>
          <span className="text-xs text-stone-500 block">
            {events.length} Jadwal Terdaftar
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            Hari Ini
          </button>
          <button
            onClick={() => changeDate(viewMode === 'day' ? 1 : 7)}
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid / Timeline View */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
            <p className="text-xs text-stone-500">Memuat jadwal kalender...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            Tidak ada jadwal sesi foto atau slot terblokir pada rentang waktu ini.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => {
              const startTime = new Date(ev.start);
              const endTime = new Date(ev.end);
              const timeRange = `${startTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })} - ${endTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })} WIB`;

              const isBlocked = ev.type === 'BLOCKED';

              return (
                <div
                  key={ev.id}
                  onClick={() => setActiveEvent(ev)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isBlocked
                      ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                      : ev.status === 'CONFIRMED'
                      ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400'
                      : ev.status === 'PENDING_PAYMENT'
                      ? 'bg-amber-50/50 border-amber-200 hover:border-amber-400'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-800">
                        {timeRange}
                      </span>
                      <span className="text-xs font-semibold text-stone-600">
                        {ev.roomName}
                      </span>
                      {!isBlocked && <BookingStatusBadge status={ev.status} />}
                    </div>
                    <h3 className="font-bold text-sm text-stone-900">{ev.title}</h3>
                    {ev.customerPhone && (
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {ev.customerPhone}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {!isBlocked && ev.totalPrice && (
                      <span className="font-extrabold text-sm text-stone-900 block">
                        {formatRupiah(ev.totalPrice)}
                      </span>
                    )}
                    <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
                      Lihat Rincian →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-base text-stone-900">
                {activeEvent.type === 'BLOCKED' ? 'Slot Diblokir' : 'Detail Reservasi'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 block mb-0.5">Judul Sesi:</span>
                <strong className="text-sm text-stone-900">{activeEvent.title}</strong>
              </div>

              {activeEvent.bookingCode !== 'BLOCKED' && (
                <div>
                  <span className="text-stone-400 block mb-0.5">Kode Booking:</span>
                  <span className="font-mono font-bold text-amber-700 text-sm">
                    {activeEvent.bookingCode}
                  </span>
                </div>
              )}

              <div>
                <span className="text-stone-400 block mb-0.5">Ruangan / Set:</span>
                <span className="text-stone-800 font-medium">{activeEvent.roomName}</span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">Waktu:</span>
                <span className="text-stone-800 font-medium">
                  {new Date(activeEvent.start).toLocaleString('id-ID')} -{' '}
                  {new Date(activeEvent.end).toLocaleTimeString('id-ID')} WIB
                </span>
              </div>

              {activeEvent.customerPhone && (
                <div>
                  <span className="text-stone-400 block mb-0.5">Kontak WhatsApp:</span>
                  <a
                    href={`https://wa.me/${activeEvent.customerPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {activeEvent.customerPhone} (Chat WA)
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
              {activeEvent.bookingCode !== 'BLOCKED' ? (
                <Link
                  href={`/booking/status/${activeEvent.bookingCode}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka E-Ticket Publik
                </Link>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

