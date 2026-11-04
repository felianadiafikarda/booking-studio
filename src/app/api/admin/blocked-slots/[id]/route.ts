import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth([Role.ADMIN, Role.OWNER]);
    const { id } = await params;

    const blocked = await prisma.blockedSlot.findUnique({ where: { id } });
    if (!blocked) {
      return NextResponse.json({ success: false, message: 'Data blokir slot tidak ditemukan' }, { status: 404 });
    }

    await prisma.blockedSlot.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'SLOT_UNBLOCKED',
        entity: 'BlockedSlot',
        entityId: id,
        details: JSON.stringify({ reason: blocked.reason }),
      },
    });

    return NextResponse.json({ success: true, message: 'Blokir slot berhasil dibuka' });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

