import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role, BookingStatus, PaymentStatus, PaymentPhase } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);
    const { id } = await params;

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingCode: id }] },
      include: {
        package: true,
        room: true,
        bookingAddOns: { include: { addOn: true } },
        payments: { orderBy: { createdAt: 'desc' } },
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...booking,
        subtotal: Number(booking.subtotal),
        discountAmount: Number(booking.discountAmount),
        totalPrice: Number(booking.totalPrice),
        dpAmount: Number(booking.dpAmount),
        remainingAmount: Number(booking.remainingAmount),
        package: {
          ...booking.package,
          price: Number(booking.package.price),
        },
        payments: booking.payments.map((p) => ({
          ...p,
          amount: Number(p.amount),
        })),
        bookingAddOns: booking.bookingAddOns.map((ba) => ({
          ...ba,
          unitPrice: Number(ba.unitPrice),
          subtotal: Number(ba.subtotal),
        })),
      },
    });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth([Role.ADMIN, Role.OWNER]);
    const { id } = await params;
    const body = await req.json();

    const { status, notes, recordPelunasan, pelunasanMethod = 'CASH' } = body;

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingCode: id }] },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (status && Object.values(BookingStatus).includes(status)) {
        updateData.status = status;
      }
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      // Record Pelunasan (Settlement of remaining balance at studio)
      if (recordPelunasan && Number(booking.remainingAmount) > 0) {
        updateData.remainingAmount = 0;
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            type: PaymentPhase.PELUNASAN,
            amount: booking.remainingAmount,
            status: PaymentStatus.PAID,
            method: pelunasanMethod,
            provider: 'MANUAL',
            providerRef: `PELUNASAN-${booking.bookingCode}`,
            paidAt: new Date(),
          },
        });
      }

      const res = await tx.booking.update({
        where: { id: booking.id },
        data: updateData,
        include: { payments: true },
      });

      await tx.auditLog.create({
        data: {
          userId: user.userId,
          action: 'BOOKING_UPDATED_BY_ADMIN',
          entity: 'Booking',
          entityId: booking.id,
          details: JSON.stringify({
            oldStatus: booking.status,
            newStatus: status || booking.status,
            recordedPelunasan: !!recordPelunasan,
          }),
        },
      });

      return res;
    });

    return NextResponse.json({
      success: true,
      message: 'Data booking berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

