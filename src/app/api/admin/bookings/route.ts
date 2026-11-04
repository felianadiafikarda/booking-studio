import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role, BookingStatus, PaymentStatus, PaymentPhase, PaymentType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as BookingStatus | null;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { bookingCode: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestPhone: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: {
          package: true,
          room: true,
          payments: { orderBy: { createdAt: 'desc' } },
          bookingAddOns: { include: { addOn: true } },
          review: true,
        },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const parsed = bookings.map((b) => ({
      ...b,
      subtotal: Number(b.subtotal),
      discountAmount: Number(b.discountAmount),
      totalPrice: Number(b.totalPrice),
      dpAmount: Number(b.dpAmount),
      remainingAmount: Number(b.remainingAmount),
      package: {
        ...b.package,
        price: Number(b.package.price),
      },
      payments: b.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
      bookingAddOns: b.bookingAddOns.map((ba) => ({
        ...ba,
        unitPrice: Number(ba.unitPrice),
        subtotal: Number(ba.subtotal),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: parsed,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

/**
 * Admin manual booking creation (walk-in / chat)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.ADMIN, Role.OWNER]);
    const body = await req.json();

    const {
      packageId,
      roomId,
      startTime: startTimeStr,
      guestName,
      guestEmail,
      guestPhone,
      notes,
      paymentStatus = 'PAID', // by default walk-ins pay immediately
      paymentType = 'FULL',
      paymentMethod = 'CASH',
      paidAmount,
      addOnIds = [],
    } = body;

    const startTime = new Date(startTimeStr);
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return NextResponse.json({ success: false, message: 'Paket tidak valid' }, { status: 400 });
    }

    const addons = await prisma.addOn.findMany({ where: { id: { in: addOnIds } } });
    const extraMinutes = addons.reduce((sum, a) => sum + (a.extraMinutes || 0), 0);
    const addOnsTotal = addons.reduce((sum, a) => sum + Number(a.price), 0);

    const totalDurationMinutes = pkg.durationMinutes + extraMinutes;
    const endTime = new Date(startTime.getTime() + totalDurationMinutes * 60 * 1000);

    const subtotal = Number(pkg.price) + addOnsTotal;
    const totalPrice = subtotal;

    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const bookingCode = `BK-ADM-${dateStr}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const newBooking = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          guestName,
          guestEmail: guestEmail || 'walkin@luminafoto.com',
          guestPhone,
          packageId,
          roomId: roomId || null,
          startTime,
          endTime,
          status: paymentStatus === 'PAID' ? BookingStatus.CONFIRMED : BookingStatus.PENDING_PAYMENT,
          paymentType: paymentType as PaymentType,
          subtotal,
          totalPrice,
          dpAmount: paymentType === 'DP' ? (paidAmount ? Number(paidAmount) : subtotal * 0.3) : subtotal,
          remainingAmount: paymentType === 'DP' ? subtotal - (paidAmount ? Number(paidAmount) : subtotal * 0.3) : 0,
          notes: notes ? `[Admin Manual / Walk-in] ${notes}` : '[Admin Manual / Walk-in]',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          bookingAddOns: {
            create: addons.map((a) => ({
              addOnId: a.id,
              qty: 1,
              unitPrice: Number(a.price),
              subtotal: Number(a.price),
            })),
          },
          payments: {
            create: {
              type: paymentType === 'DP' ? PaymentPhase.DP : PaymentPhase.FULL,
              amount: paidAmount ? Number(paidAmount) : totalPrice,
              status: paymentStatus === 'PAID' ? PaymentStatus.PAID : PaymentStatus.PENDING,
              method: paymentMethod,
              provider: 'MANUAL',
              providerRef: `ADM-${Date.now()}`,
              paidAt: paymentStatus === 'PAID' ? new Date() : null,
            },
          },
        },
        include: {
          package: true,
          room: true,
          payments: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.userId,
          action: 'ADMIN_MANUAL_BOOKING',
          entity: 'Booking',
          entityId: booking.id,
          details: JSON.stringify({ bookingCode, customer: guestName }),
        },
      });

      return booking;
    });

    return NextResponse.json({
      success: true,
      message: 'Booking manual berhasil dibuat',
      data: newBooking,
    });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

