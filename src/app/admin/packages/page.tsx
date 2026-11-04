'use client';

import React, { useState, useEffect } from 'react';
import {
  Package as PackageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Clock,
  Users,
} from 'lucide-react';
import { formatRupiah } from '@/components/UiBadges';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab
  const [activeTab, setActiveTab] = useState<'packages' | 'addons'>('packages');

  // Modal Package
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgDuration, setPkgDuration] = useState('60');
  const [pkgPeople, setPkgPeople] = useState('4');
  const [pkgPhotos, setPkgPhotos] = useState('10');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgImg, setPkgImg] = useState('');
  const [pkgActive, setPkgActive] = useState(true);
  const [isSavingPkg, setIsSavingPkg] = useState(false);

  // Modal Addon
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<any | null>(null);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [addonMinutes, setAddonMinutes] = useState('0');
  const [addonDesc, setAddonDesc] = useState('');
  const [addonActive, setAddonActive] = useState(true);
  const [isSavingAddon, setIsSavingAddon] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        fetch('/api/admin/packages').then((r) => r.json()),
        fetch('/api/admin/addons').then((r) => r.json()),
      ]);
      if (pRes.success) setPackages(pRes.data);
      if (aRes.success) setAddons(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPkgModal = (pkg?: any) => {
    if (pkg) {
      setEditingPkg(pkg);
      setPkgName(pkg.name);
      setPkgPrice(String(pkg.price));
      setPkgDuration(String(pkg.durationMinutes));
      setPkgPeople(String(pkg.maxPeople));
      setPkgPhotos(String(pkg.photoCount));
      setPkgDesc(pkg.description);
      setPkgImg(pkg.imageUrl || '');
      setPkgActive(pkg.active);
    } else {
      setEditingPkg(null);
      setPkgName('');
      setPkgPrice('500000');
      setPkgDuration('60');
      setPkgPeople('4');
      setPkgPhotos('10');
      setPkgDesc('');
      setPkgImg('');
      setPkgActive(true);
    }
    setShowPkgModal(true);
  };

  const handleSavePkg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPkg(true);
    try {
      const url = editingPkg
        ? `/api/admin/packages/${editingPkg.id}`
        : '/api/admin/packages';
      const method = editingPkg ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pkgName,
          price: Number(pkgPrice),
          durationMinutes: Number(pkgDuration),
          maxPeople: Number(pkgPeople),
          photoCount: Number(pkgPhotos),
          description: pkgDesc,
          imageUrl: pkgImg || undefined,
          active: pkgActive,
          features: [
            `Durasi ${pkgDuration} menit`,
            `${pkgPhotos} foto edited`,
            `Maksimal ${pkgPeople} orang`,
            'Semua soft file original',
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPkgModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPkg(false);
    }
  };

  const openAddonModal = (a?: any) => {
    if (a) {
      setEditingAddon(a);
      setAddonName(a.name);
      setAddonPrice(String(a.price));
      setAddonMinutes(String(a.extraMinutes));
      setAddonDesc(a.description || '');
      setAddonActive(a.active);
    } else {
      setEditingAddon(null);
      setAddonName('');
      setAddonPrice('50000');
      setAddonMinutes('0');
      setAddonDesc('');
      setAddonActive(true);
    }
    setShowAddonModal(true);
  };

  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddon(true);
    try {
      const url = editingAddon
        ? `/api/admin/addons/${editingAddon.id}`
        : '/api/admin/addons';
      const method = editingAddon ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addonName,
          price: Number(addonPrice),
          extraMinutes: Number(addonMinutes),
          description: addonDesc,
          active: addonActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddonModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAddon(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Katalog Paket & Add-on Studio
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Atur harga paket foto, durasi sesi, kapasitas orang, dan pilihan add-on cetak/makeup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'packages' ? (
            <button
              onClick={() => openPkgModal()}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Paket Foto
            </button>
          ) : (
            <button
              onClick={() => openAddonModal()}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Add-on
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('packages')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'packages'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Paket Foto ({packages.length})
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'addons'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Add-on Tambahan ({addons.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
          <p className="text-xs text-stone-500">Memuat katalog...</p>
        </div>
      ) : activeTab === 'packages' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base text-stone-900">{pkg.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pkg.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {pkg.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <p className="text-xs text-stone-500 line-clamp-2 mb-4 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-stone-600 mb-4 bg-stone-50 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {pkg.durationMinutes} mnt
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    Maks {pkg.maxPeople} org
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-base font-black text-stone-900">
                  {formatRupiah(pkg.price)}
                </span>
                <button
                  type="button"
                  onClick={() => openPkgModal(pkg)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {addons.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm text-stone-900">{a.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {a.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                {a.description && (
                  <p className="text-xs text-stone-500 mb-3">{a.description}</p>
                )}
                {a.extraMinutes > 0 && (
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    +{a.extraMinutes} Menit Tambahan Durasi
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-3">
                <span className="text-sm font-extrabold text-stone-900">
                  {formatRupiah(a.price)}
                </span>
                <button
                  type="button"
                  onClick={() => openAddonModal(a)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Package Form Modal */}
      {showPkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSavePkg}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                {editingPkg ? 'Edit Paket Foto' : 'Tambah Paket Foto Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPkgModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Nama Paket Foto:
              </label>
              <input
                type="text"
                required
                value={pkgName}
                onChange={(e) => setPkgName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Harga Paket (IDR):
                </label>
                <input
                  type="number"
                  required
                  value={pkgPrice}
                  onChange={(e) => setPkgPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Durasi Sesi (Menit):
                </label>
                <input
                  type="number"
                  required
                  value={pkgDuration}
                  onChange={(e) => setPkgDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Kapasitas Orang:
                </label>
                <input
                  type="number"
                  required
                  value={pkgPeople}
                  onChange={(e) => setPkgPeople(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Jumlah Foto Retouch:
                </label>
                <input
                  type="number"
                  required
                  value={pkgPhotos}
                  onChange={(e) => setPkgPhotos(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Deskripsi:</label>
              <textarea
                rows={2}
                value={pkgDesc}
                onChange={(e) => setPkgDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                URL Gambar Foto (Unsplash/CDN):
              </label>
              <input
                type="url"
                value={pkgImg}
                onChange={(e) => setPkgImg(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pkgActiveCheck"
                checked={pkgActive}
                onChange={(e) => setPkgActive(e.target.checked)}
                className="rounded text-amber-500 w-4 h-4"
              />
              <label htmlFor="pkgActiveCheck" className="font-semibold text-stone-800">
                Paket Aktif & Tampil di Web Publik
              </label>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPkgModal(false)}
                className="px-4 py-2 rounded-lg font-semibold text-stone-600 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSavingPkg}
                className="px-5 py-2 rounded-lg font-bold bg-amber-500 text-stone-950 hover:bg-amber-400"
              >
                {isSavingPkg ? 'Menyimpan...' : 'Simpan Paket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add-on Form Modal */}
      {showAddonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveAddon}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                {editingAddon ? 'Edit Add-on' : 'Tambah Add-on Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddonModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Nama Add-on:
              </label>
              <input
                type="text"
                required
                value={addonName}
                onChange={(e) => setAddonName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Harga (IDR):
                </label>
                <input
                  type="number"
                  required
                  value={addonPrice}
                  onChange={(e) => setAddonPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Ekstra Menit Durasi:
                </label>
                <input
                  type="number"
                  required
                  value={addonMinutes}
                  onChange={(e) => setAddonMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Deskripsi:</label>
              <textarea
                rows={2}
                value={addonDesc}
                onChange={(e) => setAddonDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="addonActiveCheck"
                checked={addonActive}
                onChange={(e) => setAddonActive(e.target.checked)}
                className="rounded text-amber-500 w-4 h-4"
              />
              <label htmlFor="addonActiveCheck" className="font-semibold text-stone-800">
                Add-on Aktif & Dapat Dipilih Pelanggan
              </label>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddonModal(false)}
                className="px-4 py-2 rounded-lg font-semibold text-stone-600 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSavingAddon}
                className="px-5 py-2 rounded-lg font-bold bg-amber-500 text-stone-950 hover:bg-amber-400"
              >
                {isSavingAddon ? 'Menyimpan...' : 'Simpan Add-on'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

