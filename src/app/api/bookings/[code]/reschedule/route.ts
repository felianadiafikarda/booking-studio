import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { newStartTime } = body;

    if (!newStartTime) {
      return NextResponse.json({ success: false, message: 'Waktu sesi baru wajib dipilih' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code.toUpperCase() },
      include: { package: true, bookingAddOns: { include: { addOn: true } } },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking tidak ditemukan' }, { status: 404 });
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING_PAYMENT) {
      return NextResponse.json(
        { success: false, message: 'Status booking saat ini tidak dapat di-reschedule' },
        { status: 400 }
      );
    }

    // Check H-2 policy (48 hours)
    const now = new Date();
    const currentStartTime = new Date(booking.startTime);
    const hoursUntilSession = (currentStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSession < 48) {
      return NextResponse.json(
        {
          success: false,
          message: 'Reschedule hanya dapat dilakukan maksimal 48 jam (H-2) sebelum sesi foto dimulai.',
        },
        { status: 400 }
      );
    }

    // Calculate duration
    let extraMinutes = 0;
    for (const ba of booking.bookingAddOns) {
      extraMinutes += (ba.addOn.extraMinutes || 0) * ba.qty;
    }
    const totalDurationMinutes = booking.package.durationMinutes + extraMinutes;

    const targetStartTime = new Date(newStartTime);
    if (isNaN(targetStartTime.getTime()) || targetStartTime.getTime() <= now.getTime()) {
      return NextResponse.json(
        { success: false, message: 'Jadwal baru tidak valid atau sudah lewat' },
        { status: 400 }
      );
    }

    const targetEndTime = new Date(targetStartTime.getTime() + totalDurationMinutes * 60 * 1000);

    // Fetch buffer
    const bufferSetting = await prisma.studioSetting.findUnique({
      where: { key: 'buffer_minutes' },
    });
    const bufferMinutes = bufferSetting ? parseInt(bufferSetting.value, 10) : 15;
    const targetEndWithBuffer = new Date(targetEndTime.getTime() + bufferMinutes * 60 * 1000);

    // Atomic transaction to verify no conflict and apply reschedule
    const updated = await prisma.$transaction(async (tx) => {
      // Find candidate rooms
      const rooms = await tx.room.findMany({ where: { active: true } });
      let chosenRoomId: string | null = null;

      for (const room of rooms) {
        // Check conflicting bookings
        const conflictingBooking = await tx.booking.findFirst({
          where: {
            id: { not: booking.id },
            roomId: room.id,
            startTime: { lt: targetEndWithBuffer },
            endTime: { gt: targetStartTime },
            OR: [
              { status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] } },
              { status: BookingStatus.PENDING_PAYMENT, expiresAt: { gt: now } },
            ],
          },
        });

        if (conflictingBooking) continue;

        const conflictingBlock = await tx.blockedSlot.findFirst({
          where: {
            roomId: room.id,
            startTime: { lt: targetEndTime },
            endTime: { gt: targetStartTime },
          },
        });

        if (conflictingBlock) continue;

        chosenRoomId = room.id;
        break;
      }

      if (!chosenRoomId) {
        throw new Error('Slot jadwal baru tidak tersedia atau bentrok dengan jadwal lain');
      }

      const res = await tx.booking.update({
        where: { id: booking.id },
        data: {
          startTime: targetStartTime,
          endTime: targetEndTime,
          roomId: chosenRoomId,
          rescheduleCount: { increment: 1 },
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'BOOKING_RESCHEDULED',
          entity: 'Booking',
          entityId: booking.id,
          details: JSON.stringify({
            oldStartTime: booking.startTime,
            newStartTime: targetStartTime,
          }),
        },
      });

      return res;
    });

    return NextResponse.json({
      success: true,
      message: 'Jadwal sesi foto berhasil diubah',
      data: {
        bookingCode: updated.bookingCode,
        startTime: updated.startTime.toISOString(),
        endTime: updated.endTime.toISOString(),
        rescheduleCount: updated.rescheduleCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

