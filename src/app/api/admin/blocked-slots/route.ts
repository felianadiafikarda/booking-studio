import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);
    const blockedSlots = await prisma.blockedSlot.findMany({
      include: { room: true },
      orderBy: { startTime: 'desc' },
    });
    return NextResponse.json({ success: true, data: blockedSlots });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.ADMIN, Role.OWNER]);
    const body = await req.json();
    const { roomId, startTime, endTime, reason } = body;

    if (!startTime || !endTime || !reason) {
      return NextResponse.json({ success: false, message: 'Waktu mulai, waktu selesai, dan alasan wajib diisi' }, { status: 400 });
    }

    const newBlocked = await prisma.blockedSlot.create({
      data: {
        roomId: roomId || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        reason,
        createdBy: user.name,
      },
      include: { room: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'SLOT_BLOCKED',
        entity: 'BlockedSlot',
        entityId: newBlocked.id,
        details: JSON.stringify({ reason, startTime, endTime }),
      },
    });

    return NextResponse.json({ success: true, message: 'Slot berhasil diblokir', data: newBlocked });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

