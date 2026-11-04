import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireAuth();

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ userId: user.userId }, { guestEmail: user.email }],
      },
      include: {
        package: true,
        room: true,
        payments: { orderBy: { createdAt: 'desc' } },
        review: true,
      },
      orderBy: { startTime: 'desc' },
    });

    const parsed = bookings.map((b) => ({
      ...b,
      subtotal: Number(b.subtotal),
      totalPrice: Number(b.totalPrice),
      dpAmount: Number(b.dpAmount),
      remainingAmount: Number(b.remainingAmount),
      package: {
        ...b.package,
        price: Number(b.package.price),
      },
      payments: b.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

