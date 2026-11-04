import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cleanupExpiredHeldSlots } from '@/lib/slot-engine';
import { generateVirtualAccountNumber } from '@/lib/payments';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import QRCode from 'qrcode';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Clean up any expired slots
    await cleanupExpiredHeldSlots();

    const now = new Date();

    // Find any active pending booking for the logged-in user
    const pendingBooking = await prisma.booking.findFirst({
      where: {
        OR: [{ userId: currentUser.userId }, { guestEmail: currentUser.email }],
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: { gt: now },
      },
      include: {
        package: true,
        room: true,
        bookingAddOns: { include: { addOn: true } },
        payments: {
          where: { status: PaymentStatus.PENDING },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!pendingBooking) {
      return NextResponse.json({
        success: true,
        hasPending: false,
        data: null,
      });
    }

    const primaryPayment = pendingBooking.payments[0];
    const method = primaryPayment?.method || 'QRIS';
    const vaNumber = method.startsWith('VA_')
      ? generateVirtualAccountNumber(method, pendingBooking.bookingCode)
      : undefined;

    const qrisPayload =
      method === 'QRIS'
        ? `00020101021226${pendingBooking.bookingCode}5204000053033605802ID5914Lumina Studio`
        : undefined;

    let qrisDataUrl: string | undefined = undefined;
    if (method === 'QRIS' && qrisPayload) {
      qrisDataUrl = await QRCode.toDataURL(qrisPayload, { width: 300, margin: 2 });
    }

    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(pendingBooking.expiresAt).getTime() - now.getTime()) / 1000)
    );

    return NextResponse.json({
      success: true,
      hasPending: true,
      data: {
        bookingId: pendingBooking.id,
        bookingCode: pendingBooking.bookingCode,
        status: pendingBooking.status,
        expiresAt: pendingBooking.expiresAt.toISOString(),
        remainingSeconds,
        guestName: pendingBooking.guestName,
        guestPhone: pendingBooking.guestPhone,
        guestEmail: pendingBooking.guestEmail,
        startTime: pendingBooking.startTime.toISOString(),
        endTime: pendingBooking.endTime.toISOString(),
        package: {
          id: pendingBooking.package.id,
          name: pendingBooking.package.name,
          slug: pendingBooking.package.slug,
          durationMinutes: pendingBooking.package.durationMinutes,
          photoCount: pendingBooking.package.photoCount,
          price: Number(pendingBooking.package.price),
        },
        room: pendingBooking.room
          ? { id: pendingBooking.room.id, name: pendingBooking.room.name }
          : null,
        subtotal: Number(pendingBooking.subtotal),
        discountAmount: Number(pendingBooking.discountAmount),
        promoCode: pendingBooking.promoCode,
        totalPrice: Number(pendingBooking.totalPrice),
        dpAmount: Number(pendingBooking.dpAmount),
        remainingAmount: Number(pendingBooking.remainingAmount),
        paymentType: pendingBooking.paymentType,
        payment: primaryPayment
          ? {
              id: primaryPayment.id,
              amount: Number(primaryPayment.amount),
              type: primaryPayment.type,
              method,
              vaNumber,
              qrisPayload,
              qrisDataUrl,
              status: primaryPayment.status,
            }
          : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}

