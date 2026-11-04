import prisma from './prisma';
import { BookingStatus, PaymentPhase, PaymentStatus } from '@prisma/client';

export interface PaymentSimulationResult {
  paymentId: string;
  bookingCode: string;
  status: PaymentStatus;
  paidAmount: number;
  paymentMethod: string;
  paidAt: Date;
}

export function generateVirtualAccountNumber(method: string, bookingCode: string): string {
  // Generate deterministic realistic Indonesian VA numbers
  const numPart = bookingCode.replace(/\D/g, '').padEnd(6, '9').substring(0, 6);
  switch (method) {
    case 'VA_BCA':
      return `88012${numPart}45`;
    case 'VA_MANDIRI':
      return `89012${numPart}88`;
    case 'VA_BRI':
      return `80123${numPart}12`;
    default:
      return `98765${numPart}01`;
  }
}

/**
 * Marks payment as completed and confirms the booking.
 * Idempotent: safe to run multiple times with same providerRef or paymentId.
 */
export async function confirmBookingPayment(params: {
  paymentId?: string;
  bookingCode?: string;
  method?: string;
  providerRef?: string;
}): Promise<PaymentSimulationResult> {
  return await prisma.$transaction(async (tx) => {
    // 1. Find payment
    const payment = await tx.payment.findFirst({
      where: params.paymentId
        ? { id: params.paymentId }
        : { booking: { bookingCode: params.bookingCode } },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      throw new Error('Data pembayaran tidak ditemukan');
    }

    if (payment.status === PaymentStatus.PAID) {
      // Already paid (idempotent response)
      return {
        paymentId: payment.id,
        bookingCode: payment.booking.bookingCode,
        status: payment.status,
        paidAmount: Number(payment.amount),
        paymentMethod: payment.method || 'QRIS',
        paidAt: payment.paidAt || new Date(),
      };
    }

    const now = new Date();
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        method: params.method || payment.method || 'QRIS',
        providerRef: params.providerRef || `REF-${Date.now()}`,
        paidAt: now,
      },
    });

    // 2. Update booking status to CONFIRMED
    await tx.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
      },
    });

    // 3. Log audit
    await tx.auditLog.create({
      data: {
        action: 'PAYMENT_CONFIRMED',
        entity: 'Booking',
        entityId: payment.bookingId,
        details: JSON.stringify({
          bookingCode: payment.booking.bookingCode,
          amount: Number(payment.amount),
          type: payment.type,
          method: updatedPayment.method,
        }),
      },
    });

    return {
      paymentId: updatedPayment.id,
      bookingCode: payment.booking.bookingCode,
      status: updatedPayment.status,
      paidAmount: Number(updatedPayment.amount),
      paymentMethod: updatedPayment.method || 'QRIS',
      paidAt: now,
    };
  });
}

/**
 * Calculates refund amount for cancellation
 */
export async function calculateRefund(bookingId: string): Promise<{
  eligibleForRefund: boolean;
  refundPercentage: number;
  refundAmount: number;
  reason: string;
}> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payments: true },
  });

  if (!booking) {
    throw new Error('Booking tidak ditemukan');
  }

  const paidPayments = booking.payments.filter((p) => p.status === PaymentStatus.PAID);
  const totalPaid = paidPayments.reduce((acc, p) => acc + Number(p.amount), 0);

  if (totalPaid === 0) {
    return {
      eligibleForRefund: false,
      refundPercentage: 0,
      refundAmount: 0,
      reason: 'Belum ada pembayaran yang berhasil.',
    };
  }

  const now = new Date();
  const sessionStartTime = new Date(booking.startTime);
  const hoursUntilSession = (sessionStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Policy:
  // > 48 hours (H-2): 70% refund of paid amount
  // <= 48 hours: 0% refund (DP / payment hangus)
  if (hoursUntilSession >= 48) {
    const refundAmount = Math.round(totalPaid * 0.7);
    return {
      eligibleForRefund: true,
      refundPercentage: 70,
      refundAmount,
      reason: 'Pembatalan memenuhi syarat H-2 (Refund 70% dari nilai yang sudah dibayar).',
    };
  } else {
    return {
      eligibleForRefund: false,
      refundPercentage: 0,
      refundAmount: 0,
      reason: 'Pembatalan kurang dari 48 jam sebelum sesi foto. Sesuai kebijakan studio, dana yang sudah dibayarkan tidak dapat dikembalikan.',
    };
  }
}

