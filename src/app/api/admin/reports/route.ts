import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role, BookingStatus, PaymentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requireAuth([Role.OWNER]);

    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');

    const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = toStr ? new Date(toStr) : new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      include: {
        package: true,
        payments: true,
      },
    });

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED);
    const cancelledBookings = bookings.filter((b) => b.status === BookingStatus.CANCELLED);
    const pendingBookings = bookings.filter((b) => b.status === BookingStatus.PENDING_PAYMENT);

    // Calculate total revenue from PAID payments
    const payments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.PAID,
        paidAt: { gte: from, lte: to },
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Best-selling packages
    const packageStats: Record<string, { id: string; name: string; count: number; revenue: number }> = {};
    for (const b of confirmedBookings) {
      if (!packageStats[b.packageId]) {
        packageStats[b.packageId] = {
          id: b.package.id,
          name: b.package.name,
          count: 0,
          revenue: 0,
        };
      }
      packageStats[b.packageId].count += 1;
      packageStats[b.packageId].revenue += Number(b.totalPrice);
    }
    const topPackages = Object.values(packageStats).sort((a, b) => b.count - a.count);

    // Peak hours analysis (09:00 - 21:00)
    const hourStats: Record<number, number> = {};
    for (let h = 9; h <= 21; h++) hourStats[h] = 0;

    for (const b of confirmedBookings) {
      const hour = new Date(b.startTime).getUTCHours() + 7; // Convert to WIB
      if (hourStats[hour] !== undefined) {
        hourStats[hour] += 1;
      }
    }

    const peakHours = Object.entries(hourStats).map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      bookingsCount: count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        period: { from: from.toISOString(), to: to.toISOString() },
        metrics: {
          totalBookings,
          confirmedCount: confirmedBookings.length,
          cancelledCount: cancelledBookings.length,
          pendingCount: pendingBookings.length,
          conversionRate: totalBookings > 0 ? Math.round((confirmedBookings.length / totalBookings) * 100) : 0,
          totalRevenue,
        },
        topPackages,
        peakHours,
      },
    });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

