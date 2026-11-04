# Storyboard Demo Video: Lumina Luxe Photo Studio (Revisi v2)

- **Target Durasi Total:** ~109 detik (Target: 105 - 115 detik, Maksimal: 120 detik)
- **Format:** Full HD 1080p (1920x1080), 30 FPS, MP4 (H.264 / `yuv420p`)
- **Fitur Khusus:** Kursor bezier halus, ripple klik amber, badge judul scene dinamis, zoom maksimal 1.5x (durasi zoom: 0.6s in, 1.0s tahan, 0.5s out, total ~2.1s per zoom, maks 2 zoom per scene).
- **Proteksi Data Sensitif (Auto-Blur):** Nomor WhatsApp/HP (`input[type="tel"]` dan teks nomor HP di tabel/modal), serta nomor Virtual Account (VA) diburamkan (*filter blur 6px*) demi keamanan dan privasi. Password termasking aman `••••••••`.

---

## Urutan Scene & Alur Detil

### 0. Pembuka (Title Card) — Durasi: ~3 detik
- **Visual:** Opening title card eksklusif bertuliskan **"Lumina Luxe Photo Studio"** dengan latar belakang *dark obsidian & ambient amber glow*.
- **Subjudul:** *"Online Photo Studio Booking Platform • Smart Scheduling • Instant QRIS & DP • Multi-role Admin"*
- **Titik Zoom:** Tidak ada (layar penuh grafis pembuka).
- **Transisi:** Soft cross-fade (0.35s).

---

### 1. Pembeli — Durasi: ~52 detik

#### A. Website Publik (Sebelum Login / Pemilihan) — ~12 detik
- **Scene 1.1: Beranda & Menu Navigasi (0:03 - 0:07 | 4s)**
  - Tampilan Hero Section studio dengan menu navigasi jelas di atas: *Paket Foto, Galeri, Cek Booking, FAQ & Kebijakan*.
  - Menampilkan headline utama *"Abadikan Setiap Momen dengan Estetika Sempurna"* dan trust badges (*Garansi Anti Double-Booking, Cukup DP 30%, E-Ticket QR Otomatis*).
  - **Titik Zoom:** Tanpa zoom (tampilan beranda penuh dan navigasi terlihat jelas).
- **Scene 1.2: Katalog Paket Studio di Beranda (0:07 - 0:12 | 5s)**
  - Scroll halus melewati showcase fasilitas studio hingga ke bagian *"Pilihan Paket Terpopuler"*.
  - Menampilkan kartu-kartu paket foto (Prewedding Cinematic, Wisuda, Family, dll) beserta harga, durasi, dan fasilitas.
  - **Titik Zoom 1:** Zoom 1.35x ke kartu paket *"Prewedding Cinematic & Elegant"* (0.6s in, 1.0s tahan pada detail harga & DP 30%, 0.5s out).
- **Scene 1.3: Klik Pilih & Jadwalkan (0:12 - 0:15 | 3s)**
  - Kursor bergerak halus dan mengklik tombol **"Pilih & Jadwalkan"** pada paket Prewedding Cinematic.
  - Masuk ke wizard booking `/booking/prewedding-cinematic`.

#### B. Wizard Booking (Menyelesaikan Semua 5 Langkah) — ~40 detik
- **Scene 1.4: Langkah 1 - Paket & Waktu (0:15 - 0:23 | 8s)**
  - Tampilan langkah 1: Paket terpilih dan kalender tanggal sesi foto.
  - **Titik Zoom 2:** Zoom 1.35x ke grid slot jam real-time (0.6s in, 1.0s tahan saat mengklik slot `09:00 - 11:00 WIB`, 0.5s out).
  - **Perbaikan Masalah 1:** Scroll halus ke bawah halaman, kursor mengarah ke tombol **"Lanjut ke Add-on"** dan mengkliknya.
  - *Verifikasi:* Indikator langkah di atas berpindah dari bulatan 1 ke 2 (hijau/amber).
- **Scene 1.5: Langkah 2 - Layanan Tambahan / Add-on (0:23 - 0:30 | 7s)**
  - Tampilan langkah 2: Daftar add-on studio (Cetak Frame Kayu 12R, Rias MUA, Hardcover Album).
  - Mengklik tombol `+` pada *Cetak Foto + Frame Minimalis 12R (+Rp 95.000)*.
  - **Titik Zoom 3:** Zoom 1.35x ke panel samping **"Ringkasan Pesanan"** (0.6s in, 1.0s tahan memperhatikan Subtotal bertambah dari Rp 1.500.000 menjadi Rp 1.595.000, 0.5s out).
  - Mengklik tombol **"Lanjut ke Data Diri"**. Indikator langkah berpindah ke bulatan 3.
- **Scene 1.6: Langkah 3 - Data Pemesan (0:30 - 0:36 | 6s)**
  - Tampilan langkah 3: Formulir data diri pemesan (Nama: *Dimas Pratama*, WhatsApp: *081234567890*, Email: *pelanggan@gmail.com*).
  - Mengisi catatan tambahan: *"Konsep foto earth tone & warm aesthetic"*.
  - **Titik Zoom:** Tanpa zoom (form terlihat jelas).
  - Mengklik tombol **"Lanjut ke Ringkasan & Bayar"**. Indikator langkah berpindah ke bulatan 4.
- **Scene 1.7: Langkah 4 - Ringkasan & Pembayaran (0:36 - 0:46 | 10s)**
  - Tampilan langkah 4: Input promo voucher dan opsi metode pembayaran.
  - Mengetik kode voucher **`LUMINA10`** di input promo lalu klik **"Terapkan"**.
  - **Titik Zoom 4:** Zoom 1.38x ke badge promo diskon dan rincian harga (0.6s in, 1.0s tahan: diskon `-Rp 150.000`, 0.5s out).
  - Memilih skema pembayaran **"Uang Muka (DP 30%)"** sehingga nominal tagihan awal disesuaikan menjadi DP.
  - Mengklik tombol **"Kunci Slot & Bayar"**.
- **Scene 1.8: Langkah 5 - Pembayaran QRIS & Slot Hold -> E-Ticket (0:46 - 0:55 | 9s)**
  - Tampilan langkah 5: Hitungan mundur batas penahanan slot (*hold timer 15:00 menit*) dan frame **QRIS Lumina Photo Studio**.
  - **Titik Zoom 5:** Zoom 1.35x ke kode QRIS dan nominal DP (0.6s in, 1.0s tahan, 0.5s out).
  - Mengklik tombol hijau **"Simulasikan Pembayaran Berhasil"** (mode testing instant sandbox).
  - Halaman otomatis dialihkan ke `/booking/status/[code]`.
  - **Titik Zoom 6:** Zoom 1.4x ke **E-Ticket QR Code**, Kode Booking resmi, dan badge hijau status `CONFIRMED` (0.6s in, 1.0s tahan, 0.5s out).

---

### 2. Admin Studio — Durasi: ~22 detik
- **Scene 2.1: Dashboard Ringkasan & Statistik (~7 detik)**
  - Masuk ke `/admin` sebagai `admin@luminafoto.com`.
  - **Titik Zoom 7:** Zoom 1.35x ke kartu metrik statistik studio (Total Omzet, Booking Bulan Ini, Sesi Hari Ini) dan tabel pemesanan terbaru yang menampilkan booking yang baru saja dibuat pelanggan (0.6s in, 1.0s tahan, 0.5s out).
- **Scene 2.2: Kalender Jadwal Foto Timeline (~7 detik)**
  - Berpindah ke menu `/admin/calendar`.
  - Mengklik tombol panah berikutnya (`>`) pada tanggal kalender untuk membuka hari yang memiliki jadwal sesi aktif.
  - **Titik Zoom 8:** Zoom 1.35x ke balok jadwal pemotretan di timeline (0.6s in, 1.0s tahan mengklik sesi untuk membuka modal detail pemesan & tombol WhatsApp, 0.5s out).
  - Menutup modal rincian jadwal.
- **Scene 2.3: Paket & Add-on Studio (~8 detik)**
  - Berpindah ke menu `/admin/packages`.
  - Menampilkan tabel paket foto. Mengklik tombol **"Edit"** pada salah satu paket untuk memunculkan modal form Edit Paket (menampilkan input harga, durasi, dan kuota orang).
  - Menutup modal form TANPA menyimpan permanen.
  - Mengklik tab **"Add-on"** untuk memperlihatkan tabel inventaris add-on studio.

---

### 3. Owner Studio — Durasi: ~28 detik
- **Scene 3.1: Kelola Booking & Opsi Pelunasan Studio (~10 detik)**
  - Masuk ke `/admin/bookings` sebagai `owner@luminafoto.com`.
  - Mengetik filter pencarian nama *"Dimas"*, tabel menyaring secara real-time.
  - **Titik Zoom 9:** Zoom 1.35x pada baris booking, mengklik **"Ubah Status"** untuk menampilkan modal status dan fitur *Catat Pelunasan Sisa Tagihan di Studio (Cash/Transfer)* (0.6s in, 1.0s tahan, 0.5s out).
  - Menutup modal tanpa mengubah data penting.
- **Scene 3.2: Promo & Voucher Diskon (~8 detik)**
  - Berpindah ke menu `/admin/promos`.
  - Menampilkan tabel master voucher diskon (`LUMINA10`, `STUDIOHEMAT`, `WISUDA2026`).
  - Mengklik tombol **"+ Tambah Promo Baru"** untuk menampilkan modal pembuatan voucher diskon (tipe persentase/nominal, kuota, masa berlaku).
  - Menutup modal form tanpa menyimpan.
- **Scene 3.3: Laporan Bisnis & Ekspor Data (~10 detik)**
  - Berpindah ke menu `/admin/reports`.
  - Menampilkan grafik performa penjualan, total revenue, dan tabel paket foto terlaris (*Best Seller Packages*).
  - Mengubah opsi tanggal / filter periode laporan.
  - **Titik Zoom 10:** Zoom 1.38x ke tombol **"Ekspor CSV / Excel"** (0.6s in, 1.0s tahan saat tombol diklik, 0.5s out).
  - Menampilkan notifikasi sukses ekspor data bisnis studio.

---

### 4. Penutup (Closing Card) — Durasi: ~4 detik
- **Visual:** Closing title card bertuliskan **"Lumina Luxe Photo Studio"**.
- **Informasi:**
  - Tagline: *"Solusi Reservasi Studio Foto Modern & Terintegrasi"*
  - Kontak WhatsApp: `+62 852-6541-6588`
  - Website: `luminaluxe.studio`
- **Titik Zoom:** Tanpa zoom.
- **Transisi:** Soft fade out ke hitam (0.4s).

---

## Rekapitulasi Durasi & Kepatuhan Aturan
- **Total Durasi:** ~109 detik (Sesuai target 105 - 115 detik, < 120 detik).
- **Semua Masalah Teratasi:**
  1. Alur pembeli dimulai dari website publik (beranda, navigasi, katalog paket).
  2. Langkah 1 wizard melakukan pemilihan slot jam, scroll ke bawah, mengklik tombol *"Lanjut ke Add-on"*, dan menyelesaikan semua langkah 1 sampai 5 hingga E-Ticket terbit.
  3. Zoom dibatasi maksimal 1.35x - 1.4x dengan durasi singkat (0.6s in, 1.0s tahan, 0.5s out) dan hanya pada elemen kunci.
  4. Kode project aplikasi web tidak diubah sama sekali.
  5. Password termasking aman, pembayaran dalam mode sandbox, dan file output final adalah `lumina-foto-demo-v2.mp4`.

