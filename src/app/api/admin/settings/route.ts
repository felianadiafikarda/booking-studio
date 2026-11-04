import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);

    const [settings, operatingHours, rooms] = await Promise.all([
      prisma.studioSetting.findMany(),
      prisma.operatingHour.findMany({
        orderBy: [{ dayOfWeek: 'asc' }],
        include: { room: true },
      }),
      prisma.room.findMany(),
    ]);

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      data: {
        settings: settingsMap,
        operatingHours,
        rooms,
      },
    });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth([Role.OWNER]); // Only owner can change settings
    const body = await req.json();
    const { settings, operatingHours } = body;

    await prisma.$transaction(async (tx) => {
      if (settings && typeof settings === 'object') {
        for (const [key, value] of Object.entries(settings)) {
          await tx.studioSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
          });
        }
      }

      if (Array.isArray(operatingHours)) {
        for (const oh of operatingHours) {
          if (oh.id) {
            await tx.operatingHour.update({
              where: { id: oh.id },
              data: {
                openTime: oh.openTime,
                closeTime: oh.closeTime,
                isActive: Boolean(oh.isActive),
                bufferMinutes: Number(oh.bufferMinutes || 15),
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          userId: user.userId,
          action: 'SETTINGS_UPDATED',
          entity: 'StudioSetting',
          details: JSON.stringify({ updatedBy: user.name }),
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Pengaturan studio berhasil diperbarui' });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

