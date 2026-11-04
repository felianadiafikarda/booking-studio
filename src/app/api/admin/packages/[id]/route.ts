import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);
    const { id } = await params;
    const body = await req.json();

    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.description !== undefined) data.description = body.description;
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.durationMinutes !== undefined) data.durationMinutes = Number(body.durationMinutes);
    if (body.maxPeople !== undefined) data.maxPeople = Number(body.maxPeople);
    if (body.photoCount !== undefined) data.photoCount = Number(body.photoCount);
    if (body.features !== undefined) data.features = JSON.stringify(body.features);
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
    if (body.active !== undefined) data.active = Boolean(body.active);
    if (body.order !== undefined) data.order = Number(body.order);

    const updated = await prisma.package.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, message: 'Paket berhasil diperbarui', data: updated });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);
    const { id } = await params;

    // Check if package has bookings
    const bookingsCount = await prisma.booking.count({ where: { packageId: id } });
    if (bookingsCount > 0) {
      // Soft-delete by setting active: false
      await prisma.package.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({ success: true, message: 'Paket dinonaktifkan karena telah memiliki data riwayat booking' });
    }

    await prisma.package.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Paket berhasil dihapus' });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

