'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, CheckCircle2, AlertCircle, Clock, ShieldCheck, Loader2 } from 'lucide-react';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [operatingHours, setOperatingHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/auth/me').then((r) => r.json());
      if (!userRes?.success || userRes?.user?.role !== 'OWNER') {
        router.replace('/admin');
        return;
      }

      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data.settings);
        setOperatingHours(data.data.operatingHours);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleOhChange = (id: string, field: string, value: any) => {
    setOperatingHours((prev) =>
      prev.map((oh) => (oh.id === id ? { ...oh, [field]: value } : oh))
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, operatingHours }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Pengaturan studio berhasil disimpan!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message || 'Gagal menyimpan pengaturan (Hanya role OWNER yang diizinkan)');
      }
    } catch {
      setErrorMsg('Koneksi bermasalah');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
        <p className="text-xs text-stone-500">Memuat pengaturan studio...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveAll} className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Pengaturan Studio & Bisnis
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Konfigurasi jam operasional harian, buffer antar sesi, persentase DP, dan profil studio.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95 shadow-sm flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Studio Profile */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4 text-xs">
        <h2 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-3">
          Informasi & Kontak Studio
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">Nama Studio:</label>
            <input
              type="text"
              value={settings.studio_name || ''}
              onChange={(e) => handleSettingChange('studio_name', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Nomor WhatsApp Konfirmasi:
            </label>
            <input
              type="text"
              value={settings.studio_whatsapp || ''}
              onChange={(e) => handleSettingChange('studio_whatsapp', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">Email Resmi:</label>
            <input
              type="email"
              value={settings.studio_email || ''}
              onChange={(e) => handleSettingChange('studio_email', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">Akun Instagram:</label>
            <input
              type="text"
              value={settings.studio_instagram || ''}
              onChange={(e) => handleSettingChange('studio_instagram', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-stone-700 uppercase mb-1">Alamat Studio:</label>
          <input
            type="text"
            value={settings.studio_address || ''}
            onChange={(e) => handleSettingChange('studio_address', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
          />
        </div>
      </div>

      {/* Booking & Business Rules Configuration */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4 text-xs">
        <h2 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-3">
          Aturan Bisnis & Kebijakan Reservasi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Persentase DP (%):
            </label>
            <input
              type="number"
              value={settings.down_payment_percentage || '30'}
              onChange={(e) => handleSettingChange('down_payment_percentage', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Default: 30% dari total biaya
            </span>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Waktu Buffer Antar Sesi (Menit):
            </label>
            <input
              type="number"
              value={settings.buffer_minutes || '15'}
              onChange={(e) => handleSettingChange('buffer_minutes', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Jeda persiapan & pembersihan ruangan
            </span>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Batas Reschedule Mandiri (Jam):
            </label>
            <input
              type="number"
              value={settings.reschedule_deadline_hours || '48'}
              onChange={(e) => handleSettingChange('reschedule_deadline_hours', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Default: 48 Jam (H-2) sebelum sesi
            </span>
          </div>
        </div>

        <div>
          <label className="block font-bold text-stone-700 uppercase mb-1">
            Deskripsi Kebijakan Refund & Pembatalan:
          </label>
          <textarea
            rows={2}
            value={settings.refund_policy || ''}
            onChange={(e) => handleSettingChange('refund_policy', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-300"
          />
        </div>
      </div>

      {/* Operating Hours Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4 text-xs">
        <h2 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
          <span>Jam Operasional Studio Per Hari</span>
          <span className="text-xs font-normal text-stone-500">
            Waktu slot otomatis disesuaikan
          </span>
        </h2>

        <div className="divide-y divide-stone-100">
          {operatingHours.map((oh) => (
            <div key={oh.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="w-40 flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`oh-${oh.id}`}
                  checked={oh.isActive}
                  onChange={(e) => handleOhChange(oh.id, 'isActive', e.target.checked)}
                  className="rounded text-amber-500 w-4 h-4"
                />
                <label htmlFor={`oh-${oh.id}`} className="font-bold text-stone-800">
                  {DAYS[oh.dayOfWeek]}
                </label>
                <span className="text-[10px] text-stone-400 block">
                  {oh.room ? `(${oh.room.name.split('-')[0]})` : ''}
                </span>
              </div>

              <div className="flex items-center gap-2 font-medium">
                <input
                  type="time"
                  disabled={!oh.isActive}
                  value={oh.openTime}
                  onChange={(e) => handleOhChange(oh.id, 'openTime', e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-stone-300 disabled:opacity-40"
                />
                <span className="text-stone-400">s/d</span>
                <input
                  type="time"
                  disabled={!oh.isActive}
                  value={oh.closeTime}
                  onChange={(e) => handleOhChange(oh.id, 'closeTime', e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-stone-300 disabled:opacity-40"
                />
              </div>

              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  oh.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {oh.isActive ? 'Buka' : 'Tutup'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

