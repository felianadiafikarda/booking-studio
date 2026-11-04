import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);

    const packages = await prisma.package.findMany({
      orderBy: { order: 'asc' },
    });

    const parsed = packages.map((p) => ({
      ...p,
      price: Number(p.price),
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth([Role.ADMIN, Role.OWNER]);
    const body = await req.json();

    const {
      name,
      slug,
      description,
      price,
      durationMinutes = 60,
      maxPeople = 4,
      photoCount = 10,
      features = [],
      imageUrl,
      active = true,
      order = 0,
    } = body;

    const newPkg = await prisma.package.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        price: Number(price),
        durationMinutes: Number(durationMinutes),
        maxPeople: Number(maxPeople),
        photoCount: Number(photoCount),
        features: JSON.stringify(features),
        imageUrl,
        active: Boolean(active),
        order: Number(order),
      },
    });

    return NextResponse.json({ success: true, message: 'Paket berhasil ditambahkan', data: newPkg });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

