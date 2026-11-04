'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Camera, Sparkles, Filter, Loader2, X } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
}

const CATEGORIES = ['Semua', 'Prewedding', 'Graduation', 'Family', 'Portrait', 'Maternity', 'Group'];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gallery?category=${selectedCategory}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setItems(d.data);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* Header */}
      <div className="bg-stone-950 text-stone-100 py-16 border-b border-stone-800 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Portofolio Studio
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-100">
            Galeri Karya Fotografi
          </h1>
          <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto mt-3">
            Lihat ragam konsep pemotretan dari prewedding, wisuda, keluarga besar, potret personal, hingga maternity di Lumina Luxe Studio.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
            <p className="text-xs text-stone-500">Memuat karya galeri...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            Tidak ada foto pada kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group relative h-80 rounded-2xl overflow-hidden bg-stone-200 border border-stone-200 shadow-sm cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-stone-100 mt-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-stone-300 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          onClick={() => setActiveItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl"
          >
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-950/60 text-stone-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeItem.imageUrl}
              alt={activeItem.title}
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <div className="p-5 bg-stone-950 text-stone-100">
              <span className="text-xs font-semibold text-amber-400 uppercase">
                {activeItem.category}
              </span>
              <h3 className="text-lg font-bold mt-0.5">{activeItem.title}</h3>
              {activeItem.description && (
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  {activeItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

