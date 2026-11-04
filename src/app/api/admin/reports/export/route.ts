import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requireAuth([Role.OWNER]);

    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');

    const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const to = toStr ? new Date(toStr) : new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      include: {
        package: true,
        room: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Kode Booking',
      'Tanggal Dibuat',
      'Nama Pelanggan',
      'No. Telepon',
      'Email',
      'Paket Foto',
      'Ruangan Studio',
      'Jadwal Mulai',
      'Jadwal Selesai',
      'Status Booking',
      'Tipe Bayar',
      'Subtotal',
      'Diskon',
      'Kode Promo',
      'Total Biaya',
      'DP',
      'Sisa Tagihan',
      'Status Pembayaran',
    ];

    const rows = bookings.map((b) => {
      const latestPayment = b.payments[0];
      return [
        b.bookingCode,
        b.createdAt.toISOString().slice(0, 10),
        `"${b.guestName.replace(/"/g, '""')}"`,
        b.guestPhone,
        b.guestEmail,
        `"${b.package.name.replace(/"/g, '""')}"`,
        `"${(b.room?.name || 'Studio Utama').replace(/"/g, '""')}"`,
        b.startTime.toISOString(),
        b.endTime.toISOString(),
        b.status,
        b.paymentType,
        Number(b.subtotal),
        Number(b.discountAmount),
        b.promoCode || '-',
        Number(b.totalPrice),
        Number(b.dpAmount),
        Number(b.remainingAmount),
        latestPayment?.status || 'PENDING',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="laporan_booking_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

