import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cleanupExpiredHeldSlots } from '@/lib/slot-engine';
import { generateVirtualAccountNumber } from '@/lib/payments';

export async function GET() {
  try {
    const user = await requireAuth();

    // Clean up expired pending held slots first
    await cleanupExpiredHeldSlots();

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
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    const parsed = bookings.map((b) => {
      const isExpired = b.status === 'PENDING_PAYMENT' && new Date(b.expiresAt) <= now;
      const latestPayment = b.payments[0];
      const method = latestPayment?.method || 'QRIS';
      const vaNumber = method.startsWith('VA_')
        ? generateVirtualAccountNumber(method, b.bookingCode)
        : undefined;

      const remainingSeconds =
        b.status === 'PENDING_PAYMENT' && !isExpired
          ? Math.max(0, Math.floor((new Date(b.expiresAt).getTime() - now.getTime()) / 1000))
          : 0;

      return {
        ...b,
        isExpired,
        remainingSeconds,
        subtotal: Number(b.subtotal),
        totalPrice: Number(b.totalPrice),
        dpAmount: Number(b.dpAmount),
        remainingAmount: Number(b.remainingAmount),
        paymentAmountToPay: b.paymentType === 'DP' ? Number(b.dpAmount) : Number(b.totalPrice),
        package: {
          ...b.package,
          price: Number(b.package.price),
        },
        payments: b.payments.map((p) => ({
          ...p,
          amount: Number(p.amount),
          vaNumber: p.method?.startsWith('VA_')
            ? generateVirtualAccountNumber(p.method, b.bookingCode)
            : undefined,
        })),
        activePayment: latestPayment
          ? {
              id: latestPayment.id,
              amount: Number(latestPayment.amount),
              type: latestPayment.type,
              method,
              vaNumber,
              status: latestPayment.status,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
