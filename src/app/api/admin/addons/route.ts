import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);
    const addons = await prisma.addOn.findMany({ orderBy: { price: 'asc' } });
    return NextResponse.json({
      success: true,
      data: addons.map((a) => ({ ...a, price: Number(a.price) })),
    });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);
    const body = await req.json();
    const { name, description, price, extraMinutes = 0, active = true } = body;

    const newAddon = await prisma.addOn.create({
      data: {
        name,
        description,
        price: Number(price),
        extraMinutes: Number(extraMinutes),
        active: Boolean(active),
      },
    });

    return NextResponse.json({ success: true, message: 'Add-on berhasil ditambahkan', data: newAddon });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

