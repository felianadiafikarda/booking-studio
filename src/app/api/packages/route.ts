import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    const parsed = packages.map((p) => ({
      ...p,
      price: Number(p.price),
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

