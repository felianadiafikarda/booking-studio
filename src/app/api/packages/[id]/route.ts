import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = await prisma.package.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!pkg) {
      return NextResponse.json({ success: false, message: 'Paket tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...pkg,
        price: Number(pkg.price),
        features: typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

