import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role, PromoType } from '@prisma/client';
import { UpdatePromoSchema } from '@/lib/validations/promo';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);
    const { id } = await params;

    const promo = await prisma.promo.findUnique({ where: { id } });
    if (!promo) {
      return NextResponse.json({ success: false, message: 'Promo tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...promo,
        discountValue: Number(promo.discountValue),
        minSpend: Number(promo.minSpend),
        maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : null,
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
    const authUser = await requireAuth([Role.ADMIN, Role.OWNER]);
    const { id } = await params;
    const body = await req.json();

    const parseResult = UpdatePromoSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const validData = parseResult.data;

    // Check if promo exists
    const existing = await prisma.promo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Promo tidak ditemukan' }, { status: 404 });
    }

    // If code is being changed, check uniqueness
    if (validData.code && validData.code !== existing.code) {
      const codeTaken = await prisma.promo.findUnique({
        where: { code: validData.code },
      });
      if (codeTaken) {
        return NextResponse.json(
          { success: false, message: `Kode promo "${validData.code}" sudah digunakan.` },
          { status: 400 }
        );
      }
    }

    const data: any = {};
    if (validData.code !== undefined) data.code = validData.code;
    if (validData.discountType !== undefined) data.discountType = validData.discountType as PromoType;
    if (validData.discountValue !== undefined) data.discountValue = validData.discountValue;
    if (validData.minSpend !== undefined) data.minSpend = validData.minSpend;
    if (validData.maxDiscount !== undefined) data.maxDiscount = validData.maxDiscount ?? null;
    if (validData.quota !== undefined) data.quota = validData.quota;
    if (validData.validUntil !== undefined) data.validUntil = new Date(validData.validUntil);
    if (validData.active !== undefined) data.active = validData.active;

    const updated = await prisma.promo.update({
      where: { id },
      data,
    });

    // Record Audit Log
    try {
      const isToggleOnly = Object.keys(data).length === 1 && data.active !== undefined;
      await prisma.auditLog.create({
        data: {
          userId: authUser.userId,
          action: isToggleOnly ? 'TOGGLE_PROMO_STATUS' : 'UPDATE_PROMO',
          entity: 'PROMO',
          entityId: updated.id,
          details: isToggleOnly
            ? `Mengubah status promo ${updated.code} menjadi ${updated.active ? 'Aktif' : 'Nonaktif'}`
            : `Memperbarui data promo ${updated.code}`,
        },
      });
    } catch (e) {
      console.error('Audit log error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Promo berhasil diperbarui',
      data: {
        ...updated,
        discountValue: Number(updated.discountValue),
        minSpend: Number(updated.minSpend),
        maxDiscount: updated.maxDiscount ? Number(updated.maxDiscount) : null,
      },
    });
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
    const authUser = await requireAuth([Role.ADMIN, Role.OWNER]);
    const { id } = await params;

    const existing = await prisma.promo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Promo tidak ditemukan' }, { status: 404 });
    }

    await prisma.promo.delete({ where: { id } });

    // Record Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: authUser.userId,
          action: 'DELETE_PROMO',
          entity: 'PROMO',
          entityId: id,
          details: `Menghapus kode promo ${existing.code}`,
        },
      });
    } catch (e) {
      console.error('Audit log error:', e);
    }

    return NextResponse.json({ success: true, message: `Promo "${existing.code}" berhasil dihapus` });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
