import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const addons = await prisma.addOn.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });

    const parsed = addons.map((a) => ({
      ...a,
      price: Number(a.price),
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

