import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);

    const { searchParams } = new URL(req.url);
    const startStr = searchParams.get('start');
    const endStr = searchParams.get('end');
    const roomId = searchParams.get('roomId');

    const where: any = {};
    if (startStr && endStr) {
      where.startTime = { gte: new Date(startStr), lte: new Date(endStr) };
    }
    if (roomId) {
      where.roomId = roomId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        package: true,
        room: true,
      },
      orderBy: { startTime: 'asc' },
    });

    const blockedSlots = await prisma.blockedSlot.findMany({
      where: roomId ? { roomId } : {},
      include: { room: true },
    });

    const events = [
      ...bookings.map((b) => ({
        id: b.id,
        type: 'BOOKING',
        bookingCode: b.bookingCode,
        title: `${b.guestName} - ${b.package.name}`,
        start: b.startTime.toISOString(),
        end: b.endTime.toISOString(),
        status: b.status,
        roomName: b.room?.name || 'Studio Utama',
        roomId: b.roomId,
        customerName: b.guestName,
        customerPhone: b.guestPhone,
        totalPrice: Number(b.totalPrice),
      })),
      ...blockedSlots.map((bs) => ({
        id: bs.id,
        type: 'BLOCKED',
        bookingCode: 'BLOCKED',
        title: `[Blokir] ${bs.reason}`,
        start: bs.startTime.toISOString(),
        end: bs.endTime.toISOString(),
        status: 'BLOCKED',
        roomName: bs.room?.name || 'Semua Ruangan',
        roomId: bs.roomId,
      })),
    ];

    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

