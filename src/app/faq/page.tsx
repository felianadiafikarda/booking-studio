import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HelpCircle, ShieldCheck, Clock, CalendarCheck, AlertCircle } from 'lucide-react';

export default function FaqPage() {
  const faqs = [
    {
      q: 'Bagaimana cara melakukan reservasi jadwal foto?',
      a: 'Pilih paket foto yang Anda inginkan di halaman Booking atau Paket, pilih tanggal, pilih slot jam yang tersedia secara real-time, pilih add-on jika diperlukan, lengkapi data diri, lalu selesaikan pembayaran DP 30% atau Lunas via QRIS / VA. Konfirmasi E-Ticket QR akan langsung keluar dan dikirim ke WhatsApp & Email Anda.',
    },
    {
      q: 'Apakah bisa memesan tanpa membuat akun terlebih dahulu?',
      a: 'Tentu bisa! Sistem kami mendukung guest checkout (tanpa akun). Anda hanya perlu mengisi nama, nomor WhatsApp aktif, dan email untuk menerima e-ticket. Namun, Anda juga dapat membuat akun jika ingin memantau seluruh riwayat sesi foto.',
    },
    {
      q: 'Apa itu fitur Tahan Slot (Hold Slot 15 Menit)?',
      a: 'Saat Anda menekan tombol bayar, sistem secara otomatis mengunci slot jadwal tersebut selama 15 menit. Selama rentang waktu ini, pelanggan lain tidak dapat memilih slot yang sama sehingga Anda terhindar dari double booking. Jika pembayaran tidak diselesaikan dalam 15 menit, slot akan otomatis dilepas kembali ke publik.',
    },
    {
      q: 'Bagaimana kebijakan Reschedule (Ganti Jadwal)?',
      a: 'Pelanggan dapat melakukan reschedule mandiri maksimal 48 jam (H-2) sebelum sesi foto dimulai langsung melalui halaman E-Ticket Anda tanpa dipungut biaya tambahan, selama masih ada slot jam kosong di tanggal baru.',
    },
    {
      q: 'Bagaimana kebijakan Pembatalan & Refund?',
      a: 'Pembatalan sebelum H-2 berhak atas pengembalian (refund) sebesar 70% dari nilai pembayaran yang sudah disetorkan (30% dipotong biaya administrasi dan penutupan slot). Pembatalan kurang dari 48 jam (H-2) sebelum sesi mengakibatkan pembayaran hangus.',
    },
    {
      q: 'Berapa lama waktu penerimaan hasil foto (soft file)?',
      a: 'Seluruh soft file mentah (original high-res) akan dibagikan melalui Google Drive dalam waktu 1x24 jam setelah sesi selesai. Foto retouch/edited selesai dalam 3-5 hari kerja.',
    },
    {
      q: 'Kapan saya harus tiba di studio?',
      a: 'Sangat disarankan hadir 10–15 menit sebelum jam sesi dimulai. Waktu pemotretan akan berjalan tepat waktu agar tidak mengganggu jadwal pelanggan berikutnya.',
    },
    {
      q: 'Apakah ada fasilitas ruang ganti dan makeup?',
      a: 'Ya, studio kami dilengkapi dengan 2 ruang ganti privat ber-AC, cermin rias dengan penerangan profesional (vanity light), hair dryer, dan steamer baju.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <div className="bg-stone-950 text-stone-100 py-16 border-b border-stone-800 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Pusat Bantuan & Kebijakan
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-100">
            Pertanyaan Umum & Kebijakan Studio
          </h1>
          <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto mt-3">
            Informasi lengkap mengenai alur reservasi, ketentuan reschedule, kebijakan pembatalan refund, dan tata tertib studio.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-10">
        {/* Policy Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <CalendarCheck className="w-6 h-6 text-amber-600 mb-2" />
            <h3 className="font-bold text-sm text-stone-900">Reschedule Fleksibel</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Maksimal H-2 (48 jam) sebelum sesi secara mandiri via link E-Ticket.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
            <h3 className="font-bold text-sm text-stone-900">Refund 70%</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Pembatalan sebelum H-2 mendapatkan pengembalian 70% dari nilai pembayaran.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <Clock className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-bold text-sm text-stone-900">Hadir 15 Mnt Lebih Awal</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Agar sesi pemotretan berjalan optimal tanpa mengurangi durasi foto Anda.
            </p>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">
            Frequently Asked Questions (FAQ)
          </h2>

          {faqs.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
              <h3 className="font-bold text-base text-stone-900 flex items-start gap-2.5">
                <span className="text-amber-600 font-serif font-bold text-lg">Q:</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-3 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* WhatsApp Help CTA */}
        <div className="p-6 rounded-2xl bg-stone-900 text-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-stone-100">Masih Ada Pertanyaan Lain?</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Tim admin resepsionis kami siap melayani pertanyaan seputar konsep dan paket.
            </p>
          </div>
          <a
            href="https://wa.me/6285265416588?text=Halo%20Lumina%20Studio,%20saya%20ingin%20tanya%20seputar%20booking"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 shrink-0"
          >
            Chat WhatsApp Admin
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}

