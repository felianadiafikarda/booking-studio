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
    if (body.description !== undefined) data.description = body.description;
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.extraMinutes !== undefined) data.extraMinutes = Number(body.extraMinutes);
    if (body.active !== undefined) data.active = Boolean(body.active);

    const updated = await prisma.addOn.update({ where: { id }, data });
    return NextResponse.json({ success: true, message: 'Add-on berhasil diperbarui', data: updated });
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

    const count = await prisma.bookingAddOn.count({ where: { addOnId: id } });
    if (count > 0) {
      await prisma.addOn.update({ where: { id }, data: { active: false } });
      return NextResponse.json({ success: true, message: 'Add-on dinonaktifkan karena telah ada di riwayat booking' });
    }

    await prisma.addOn.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Add-on berhasil dihapus' });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

