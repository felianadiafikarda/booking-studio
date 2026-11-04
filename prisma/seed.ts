import { PrismaClient, Role, PaymentPhase, PaymentStatus, BookingStatus, PaymentType, PromoType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database Lumina Luxe Photo Studio...');

  // 1. Studio Settings
  const settings = [
    { key: 'studio_name', value: 'Lumina Luxe Photo Studio', description: 'Nama Resmi Studio' },
    { key: 'studio_tagline', value: 'Abadikan Momen Berharga Anda dengan Sentuhan Estetika Sempurna', description: 'Tagline Brand' },
    { key: 'studio_address', value: 'Jl. Malioboro No. 88, Yogyakarta', description: 'Alamat Studio' },
    { key: 'studio_phone', value: '+62 852-6541-6588', description: 'Nomor Telepon' },
    { key: 'studio_whatsapp', value: '6285265416588', description: 'Nomor WhatsApp Konfirmasi' },
    { key: 'studio_email', value: 'halo@luminafoto.com', description: 'Email Resmi' },
    { key: 'studio_instagram', value: '@lumina.fotostudio', description: 'Akun Instagram' },
    { key: 'studio_maps_url', value: 'https://maps.google.com/?q=Lumina+Photo+Studio', description: 'Tautan Google Maps' },
    { key: 'down_payment_percentage', value: '30', description: 'Persentase DP (%)' },
    { key: 'buffer_minutes', value: '15', description: 'Waktu Buffer antar sesi (menit)' },
    { key: 'hold_duration_minutes', value: '15', description: 'Durasi Tahan Slot saat checkout (menit)' },
    { key: 'reschedule_deadline_hours', value: '48', description: 'Batas Reschedule Mandiri (H-2 / 48 jam)' },
    { key: 'refund_policy', value: 'Pembatalan sebelum H-2 mendapatkan refund DP 70%. Pembatalan kurang dari H-2 DP hangus.', description: 'Ketentuan Pembatalan & Refund' }
  ];

  for (const s of settings) {
    await prisma.studioSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s
    });
  }

  // 2. Rooms
  const roomA = await prisma.room.upsert({
    where: { id: 'room-a-warm' },
    update: { name: 'Studio A - Warm Aesthetic & Earthy', description: 'Nuansa hangat, backdrop earth tone, furniture kayu vintage, cocok untuk prewedding & keluarga.' },
    create: { id: 'room-a-warm', name: 'Studio A - Warm Aesthetic & Earthy', description: 'Nuansa hangat, backdrop earth tone, furniture kayu vintage, cocok untuk prewedding & keluarga.' }
  });

  const roomB = await prisma.room.upsert({
    where: { id: 'room-b-cyclorama' },
    update: { name: 'Studio B - Cyclorama & High-Key Modern', description: 'Latar putih infinity cyclorama, lighting RGB futuristik, minimalis elegan untuk wisuda & fashion.' },
    create: { id: 'room-b-cyclorama', name: 'Studio B - Cyclorama & High-Key Modern', description: 'Latar putih infinity cyclorama, lighting RGB futuristik, minimalis elegan untuk wisuda & fashion.' }
  });

  // 3. Operating Hours (Senin - Minggu: 09:00 - 21:00)
  for (let day = 0; day <= 6; day++) {
    await prisma.operatingHour.upsert({
      where: { dayOfWeek_roomId: { dayOfWeek: day, roomId: roomA.id } },
      update: { openTime: '09:00', closeTime: '21:00', isActive: true, bufferMinutes: 15 },
      create: { dayOfWeek: day, openTime: '09:00', closeTime: '21:00', isActive: true, bufferMinutes: 15, roomId: roomA.id }
    });
    await prisma.operatingHour.upsert({
      where: { dayOfWeek_roomId: { dayOfWeek: day, roomId: roomB.id } },
      update: { openTime: '09:00', closeTime: '21:00', isActive: true, bufferMinutes: 15 },
      create: { dayOfWeek: day, openTime: '09:00', closeTime: '21:00', isActive: true, bufferMinutes: 15, roomId: roomB.id }
    });
  }

  // 4. Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'owner@luminafoto.com' },
    update: { name: 'Budi Santoso (Owner)', phone: '081234567890', role: Role.OWNER, passwordHash: hashedPassword },
    create: { email: 'owner@luminafoto.com', name: 'Budi Santoso (Owner)', phone: '081234567890', role: Role.OWNER, passwordHash: hashedPassword }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@luminafoto.com' },
    update: { name: 'Siti Rahma (Admin Studio)', phone: '081298765432', role: Role.ADMIN, passwordHash: hashedPassword },
    create: { email: 'admin@luminafoto.com', name: 'Siti Rahma (Admin Studio)', phone: '081298765432', role: Role.ADMIN, passwordHash: hashedPassword }
  });

  const customer = await prisma.user.upsert({
    where: { email: 'pelanggan@gmail.com' },
    update: { name: 'Dimas Pratama', phone: '085712345678', role: Role.CUSTOMER, passwordHash: hashedPassword },
    create: { email: 'pelanggan@gmail.com', name: 'Dimas Pratama', phone: '085712345678', role: Role.CUSTOMER, passwordHash: hashedPassword }
  });

  // 5. Packages
  const packagesData = [
    {
      id: 'pkg-prewedding',
      name: 'Prewedding Cinematic & Elegant',
      slug: 'prewedding-cinematic',
      description: 'Paket prewedding romantis dengan arahan pose profesional, pencahayaan sinematik, dan properti estetik mewah.',
      price: 1500000,
      durationMinutes: 120,
      maxPeople: 2,
      photoCount: 25,
      features: JSON.stringify([
        'Durasi foto 120 menit',
        '25 foto edited retouch premium',
        'Semua file mentah (original softcopy via Google Drive)',
        'Bebas 2x ganti pakaian (wardrobe pribadi/sewa)',
        'Sudah termasuk properti bunga, tirai, & lampu estetik',
        'Max 2 orang (Calon Pengantin)'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      active: true,
      order: 1
    },
    {
      id: 'pkg-wisuda',
      name: 'Graduation / Wisuda Solo & Family',
      slug: 'graduation-wisuda',
      description: 'Rayakan momen kelulusan bersejarah Anda bersama keluarga terkasih dengan hasil jepretan tajam dan warna memukau.',
      price: 450000,
      durationMinutes: 45,
      maxPeople: 5,
      photoCount: 12,
      features: JSON.stringify([
        'Durasi foto 45 menit',
        '12 foto edited retouch',
        'Semua soft file original dibagikan',
        'Termasuk properti buket, tabung toga, & backdrop wisuda',
        'Kapasitas hingga 5 orang (Wisudawan + Keluarga)',
        'Cetak 1 foto 10R gratis'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80',
      active: true,
      order: 2
    },
    {
      id: 'pkg-keluarga',
      name: 'Harmoni Family Portrait',
      slug: 'family-portrait',
      description: 'Abadikan kehangatan dan kebersamaan keluarga besar dalam foto potret berkelas yang abadi sepanjang masa.',
      price: 850000,
      durationMinutes: 60,
      maxPeople: 8,
      photoCount: 15,
      features: JSON.stringify([
        'Durasi sesi 60 menit',
        '15 foto edited warna & kecerahan',
        'Free cetak 12R + frame kayu minimalis',
        'Semua soft file kualitas resolusi tinggi',
        'Kapasitas hingga 8 orang keluarga',
        'Bimbingan pose ramah anak & lansia'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
      active: true,
      order: 3
    },
    {
      id: 'pkg-personal',
      name: 'Personal Portrait & Professional Headshot',
      slug: 'personal-portrait',
      description: 'Potret diri profesional untuk CV, LinkedIn, modeling, kartu nama, atau sekadar portofolio persona Anda.',
      price: 250000,
      durationMinutes: 30,
      maxPeople: 1,
      photoCount: 6,
      features: JSON.stringify([
        'Durasi 30 menit',
        '6 foto edited profesional (kulit halus natural)',
        'Pilihan latar polos: Putih, Abu, Hitam, Beige',
        'Semua soft file resolusi tinggi',
        'Bisa untuk Pas Foto Kedutaan / Lamaran'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
      active: true,
      order: 4
    },
    {
      id: 'pkg-maternity',
      name: 'Maternity Glowing Mom & Dad',
      slug: 'maternity-session',
      description: 'Sambut kelahiran buah hati dengan sesi foto kehamilan yang intim, hangat, nyaman, dan berestetika tinggi.',
      price: 750000,
      durationMinutes: 60,
      maxPeople: 3,
      photoCount: 15,
      features: JSON.stringify([
        'Durasi 60 menit santai & nyaman',
        '15 foto edited',
        'Peminjaman 1 gaun maternity flowy pilihan',
        'Semua soft file',
        'Kapasitas Bumil + Suami + 1 Anak'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
      active: true,
      order: 5
    },
    {
      id: 'pkg-bestie',
      name: 'Group & Bestie Fun Session',
      slug: 'group-bestie',
      description: 'Sesi ceria dan penuh tawa bersama sahabat terdekat, geng kampus, atau teman kerja dengan lighting dinamis.',
      price: 550000,
      durationMinutes: 45,
      maxPeople: 6,
      photoCount: 12,
      features: JSON.stringify([
        'Durasi 45 menit',
        '12 foto edited seru',
        'Semua soft file dibagikan lewat link cloud',
        'Kapasitas hingga 6 orang',
        'Bebas request konsep & musik latar Spotify'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      active: true,
      order: 6
    }
  ];

  for (const p of packagesData) {
    await prisma.package.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
  }

  // 6. Add-Ons
  const addonsData = [
    {
      id: 'addon-cetak-12r',
      name: 'Cetak Foto 12R + Frame Minimalis Kayu',
      description: 'Kertas foto matte premium tahan pudar 10+ tahun, sudah terpasang frame elegan siap pajang.',
      price: 95000,
      extraMinutes: 0,
      active: true
    },
    {
      id: 'addon-album-kolase',
      name: 'Album Kolase Hardcover 20 Halaman',
      description: 'Desain layout eksklusif, laminasi doff halus, sampul kulit sintetis premium.',
      price: 350000,
      extraMinutes: 0,
      active: true
    },
    {
      id: 'addon-extra-person',
      name: 'Tambahan Orang / Anggota (Per Orang)',
      description: 'Menambah kuota orang di atas kapasitas bawaan paket.',
      price: 35000,
      extraMinutes: 0,
      active: true
    },
    {
      id: 'addon-extra-time',
      name: 'Tambahan Waktu Sesi (30 Menit)',
      description: 'Ekstra 30 menit pemotretan agar lebih leluasa berganti pose dan wardrobe.',
      price: 150000,
      extraMinutes: 30,
      active: true
    },
    {
      id: 'addon-mua',
      name: 'Makeup Artist & Hair Styling On-Site',
      description: 'Makeup artist profesional studio untuk 1 orang (ready 45 menit sebelum sesi foto).',
      price: 250000,
      extraMinutes: 0,
      active: true
    },
    {
      id: 'addon-extra-edited',
      name: 'Paket 5 Foto Tambahan Edited Premium',
      description: 'Retouch warna, kulit, dan koreksi detail untuk 5 foto pilihan Anda.',
      price: 100000,
      extraMinutes: 0,
      active: true
    }
  ];

  for (const a of addonsData) {
    await prisma.addOn.upsert({
      where: { id: a.id },
      update: a,
      create: a
    });
  }

  // 7. Promos
  const promosData = [
    {
      code: 'LUMINA10',
      discountType: PromoType.PERCENTAGE,
      discountValue: 10,
      minSpend: 300000,
      maxDiscount: 100000,
      quota: 100,
      usedCount: 12,
      validUntil: new Date('2027-12-31'),
      active: true
    },
    {
      code: 'STUDIOHEMAT',
      discountType: PromoType.FIXED,
      discountValue: 50000,
      minSpend: 400000,
      maxDiscount: null,
      quota: 50,
      usedCount: 8,
      validUntil: new Date('2027-12-31'),
      active: true
    },
    {
      code: 'WISUDA2026',
      discountType: PromoType.PERCENTAGE,
      discountValue: 15,
      minSpend: 400000,
      maxDiscount: 150000,
      quota: 80,
      usedCount: 5,
      validUntil: new Date('2027-12-31'),
      active: true
    }
  ];

  for (const pr of promosData) {
    await prisma.promo.upsert({
      where: { code: pr.code },
      update: pr,
      create: pr
    });
  }

  // 8. Gallery Items
  const galleryData = [
    {
      title: 'Romantic Sunset Prewedding',
      category: 'Prewedding',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      description: 'Konsep intimate prewedding dengan busana serasi di Studio A.',
      order: 1
    },
    {
      title: 'Earthy Warmth Prewedding',
      category: 'Prewedding',
      imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80',
      description: 'Latar earth tone berpadu pencahayaan lembut keemasan.',
      order: 2
    },
    {
      title: 'Joyful Graduation with Family',
      category: 'Graduation',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80',
      description: 'Senyum haru dan bangga wisuda sarjana berlatar modern cyclorama.',
      order: 3
    },
    {
      title: 'Graduation Classic Portrait',
      category: 'Graduation',
      imageUrl: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=900&q=80',
      description: 'Foto wisuda formal berwibawa dengan toga universitas.',
      order: 4
    },
    {
      title: 'Three Generation Family',
      category: 'Family',
      imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80',
      description: 'Potret tiga generasi keluarga dalam suasana akrab dan ceria.',
      order: 5
    },
    {
      title: 'Little Miracle Maternity',
      category: 'Maternity',
      imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80',
      description: 'Maternity shoot anggun bernuansa monokrom lembut.',
      order: 6
    },
    {
      title: 'Executive Professional Headshot',
      category: 'Portrait',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      description: 'Potret profesional percaya diri untuk profil eksekutif.',
      order: 7
    },
    {
      title: 'Squad Goals Studio Party',
      category: 'Group',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
      description: 'Sesi pemotretan seru dan penuh warna bersama sahabat.',
      order: 8
    }
  ];

  await prisma.galleryItem.deleteMany({});
  for (const g of galleryData) {
    await prisma.galleryItem.create({ data: g });
  }

  // 9. Sample Bookings & Payments for realistic dashboard demonstration
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(11, 30, 0, 0);

  const sampleBooking1 = await prisma.booking.upsert({
    where: { bookingCode: 'BK-202610-001' },
    update: {},
    create: {
      bookingCode: 'BK-202610-001',
      userId: customer.id,
      guestName: 'Dimas Pratama',
      guestEmail: 'pelanggan@gmail.com',
      guestPhone: '085712345678',
      packageId: 'pkg-wisuda',
      roomId: roomA.id,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      status: BookingStatus.CONFIRMED,
      paymentType: PaymentType.DP,
      subtotal: 450000,
      discountAmount: 0,
      totalPrice: 450000,
      dpAmount: 135000,
      remainingAmount: 315000,
      notes: 'Foto wisuda bersama kedua orang tua.',
      expiresAt: new Date(Date.now() + 86400000 * 2),
      payments: {
        create: {
          type: PaymentPhase.DP,
          amount: 135000,
          status: PaymentStatus.PAID,
          method: 'QRIS',
          provider: 'SIMULATOR',
          providerRef: 'PAY-SIM-001',
          paidAt: new Date()
        }
      }
    }
  });

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 3);
  nextWeek.setHours(14, 0, 0, 0);
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(16, 0, 0, 0);

  const sampleBooking2 = await prisma.booking.upsert({
    where: { bookingCode: 'BK-202610-002' },
    update: {},
    create: {
      bookingCode: 'BK-202610-002',
      guestName: 'Nadia & Farhan',
      guestEmail: 'nadia.farhan@gmail.com',
      guestPhone: '081288997766',
      packageId: 'pkg-prewedding',
      roomId: roomB.id,
      startTime: nextWeek,
      endTime: nextWeekEnd,
      status: BookingStatus.CONFIRMED,
      paymentType: PaymentType.FULL,
      subtotal: 1500000,
      discountAmount: 100000,
      promoCode: 'LUMINA10',
      totalPrice: 1400000,
      dpAmount: 1400000,
      remainingAmount: 0,
      notes: 'Konsep gaun putih modern minimalis.',
      expiresAt: new Date(Date.now() + 86400000 * 4),
      payments: {
        create: {
          type: PaymentPhase.FULL,
          amount: 1400000,
          status: PaymentStatus.PAID,
          method: 'VA_BCA',
          provider: 'SIMULATOR',
          providerRef: 'PAY-SIM-002',
          paidAt: new Date()
        }
      }
    }
  });

  // Reviews
  await prisma.review.upsert({
    where: { bookingId: sampleBooking1.id },
    update: {},
    create: {
      bookingId: sampleBooking1.id,
      customerName: 'Dimas Pratama',
      rating: 5,
      comment: 'Pelayanan sangat ramah! Fotografernya jago banget ngarahin gaya buat orang tua yang biasanya kaku. Hasil fotonya jernih, estetik, dan cepat selesai!',
      isPublished: true
    }
  });

  console.log('Seeding completed successfully!');
  console.log('Owner Account: owner@luminafoto.com / password123');
  console.log('Admin Account: admin@luminafoto.com / password123');
  console.log('Customer Account: pelanggan@gmail.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

