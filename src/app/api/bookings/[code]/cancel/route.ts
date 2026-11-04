import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateRefund } from '@/lib/payments';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason = 'Permintaan pembatalan oleh pelanggan' } = body;

    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code.toUpperCase() },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking tidak ditemukan' }, { status: 404 });
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return NextResponse.json({ success: false, message: 'Booking ini sudah berstatus dibatalkan' }, { status: 400 });
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return NextResponse.json({ success: false, message: 'Sesi foto yang sudah selesai tidak dapat dibatalkan' }, { status: 400 });
    }

    // Calculate refund details
    const refundInfo = await calculateRefund(booking.id);

    // Cancel booking and mark payments as refunded if eligible
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CANCELLED,
          notes: booking.notes ? `${booking.notes} | Batal: ${reason}` : `Batal: ${reason}`,
        },
      });

      if (refundInfo.eligibleForRefund) {
        // Mark latest paid payment with status REFUNDED
        const paidPayment = booking.payments.find((p) => p.status === PaymentStatus.PAID);
        if (paidPayment) {
          await tx.payment.update({
            where: { id: paidPayment.id },
            data: { status: PaymentStatus.REFUNDED },
          });
        }
      } else {
        // Cancel any pending payments
        await tx.payment.updateMany({
          where: { bookingId: booking.id, status: PaymentStatus.PENDING },
          data: { status: PaymentStatus.EXPIRED },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'BOOKING_CANCELLED',
          entity: 'Booking',
          entityId: booking.id,
          details: JSON.stringify({
            reason,
            refundEligible: refundInfo.eligibleForRefund,
            refundAmount: refundInfo.refundAmount,
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dibatalkan',
      data: {
        bookingCode: booking.bookingCode,
        status: BookingStatus.CANCELLED,
        refund: refundInfo,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

