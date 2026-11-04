import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role, PromoType } from '@prisma/client';
import { PromoSchema } from '@/lib/validations/promo';

export async function GET(req: NextRequest) {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || ''; // 'active', 'inactive', 'expired'
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: any = {};

    if (search) {
      where.code = { contains: search, mode: 'insensitive' };
    }

    const now = new Date();
    if (status === 'active') {
      where.active = true;
      where.validUntil = { gte: now };
    } else if (status === 'inactive') {
      where.active = false;
    } else if (status === 'expired') {
      where.validUntil = { lt: now };
    }

    const [total, promos] = await Promise.all([
      prisma.promo.count({ where }),
      prisma.promo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: promos.map((p) => ({
        ...p,
        discountValue: Number(p.discountValue),
        minSpend: Number(p.minSpend),
        maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : null,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth([Role.ADMIN, Role.OWNER]);
    const body = await req.json();

    const parseResult = PromoSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const validData = parseResult.data;

    // Check code uniqueness
    const existing = await prisma.promo.findUnique({
      where: { code: validData.code },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Kode promo "${validData.code}" sudah terdaftar.` },
        { status: 400 }
      );
    }

    const newPromo = await prisma.promo.create({
      data: {
        code: validData.code,
        discountType: validData.discountType as PromoType,
        discountValue: validData.discountValue,
        minSpend: validData.minSpend,
        maxDiscount: validData.maxDiscount ?? null,
        quota: validData.quota,
        validUntil: new Date(validData.validUntil),
        active: validData.active,
      },
    });

    // Record Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: authUser.userId,
          action: 'CREATE_PROMO',
          entity: 'PROMO',
          entityId: newPromo.id,
          details: `Membuat promo ${newPromo.code} (${newPromo.discountType === 'PERCENTAGE' ? `${newPromo.discountValue}%` : `Rp ${newPromo.discountValue}`}, Kuota: ${newPromo.quota})`,
        },
      });
    } catch (e) {
      console.error('Audit log error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Kode promo berhasil dibuat',
      data: {
        ...newPromo,
        discountValue: Number(newPromo.discountValue),
        minSpend: Number(newPromo.minSpend),
        maxDiscount: newPromo.maxDiscount ? Number(newPromo.maxDiscount) : null,
      },
    });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
