import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { cleanupExpiredHeldSlots } from '@/lib/slot-engine';
import { generateVirtualAccountNumber } from '@/lib/payments';
import { BookingStatus, PaymentPhase, PaymentStatus, PaymentType, PromoType } from '@prisma/client';
import { z } from 'zod';

const bookingSchema = z.object({
  packageId: z.string().min(1, 'Pilih paket foto'),
  roomId: z.string().optional(),
  startTime: z.string().min(1, 'Pilih waktu sesi foto'),
  guestName: z.string().min(2, 'Nama lengkap wajib diisi'),
  guestEmail: z.string().email('Format email tidak valid'),
  guestPhone: z.string().min(8, 'Nomor WhatsApp wajib diisi'),
  notes: z.string().optional(),
  paymentType: z.enum(['DP', 'FULL']).default('DP'),
  paymentMethod: z.string().default('QRIS'),
  promoCode: z.string().optional(),
  addOns: z
    .array(
      z.object({
        addOnId: z.string(),
        qty: z.number().int().min(1).default(1),
      })
    )
    .optional(),
});

function generateBookingCode(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${dateStr}-${randomChars}`;
}

export async function POST(req: NextRequest) {
  try {
    await cleanupExpiredHeldSlots();

    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      packageId,
      startTime: startTimeStr,
      guestName,
      guestEmail,
      guestPhone,
      notes,
      paymentType,
      paymentMethod,
      promoCode,
      addOns = [],
    } = parsed.data;

    const currentUser = await getCurrentUser();
    const startTime = new Date(startTimeStr);

    if (isNaN(startTime.getTime()) || startTime.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, message: 'Waktu sesi foto tidak valid atau sudah lewat' },
        { status: 400 }
      );
    }

    // Fetch package
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg || !pkg.active) {
      return NextResponse.json(
        { success: false, message: 'Paket foto tidak valid atau sudah tidak aktif' },
        { status: 404 }
      );
    }

    // Fetch add-ons and calculate total add-on cost and extra duration
    let extraMinutes = 0;
    let addOnsTotal = 0;
    const addOnRecords: { addOnId: string; qty: number; unitPrice: number; subtotal: number }[] = [];

    if (addOns.length > 0) {
      const dbAddOns = await prisma.addOn.findMany({
        where: { id: { in: addOns.map((a) => a.addOnId) }, active: true },
      });

      for (const item of addOns) {
        const found = dbAddOns.find((a) => a.id === item.addOnId);
        if (found) {
          const itemPrice = Number(found.price);
          const itemSubtotal = itemPrice * item.qty;
          addOnsTotal += itemSubtotal;
          extraMinutes += (found.extraMinutes || 0) * item.qty;
          addOnRecords.push({
            addOnId: found.id,
            qty: item.qty,
            unitPrice: itemPrice,
            subtotal: itemSubtotal,
          });
        }
      }
    }

    const totalDurationMinutes = pkg.durationMinutes + extraMinutes;
    const endTime = new Date(startTime.getTime() + totalDurationMinutes * 60 * 1000);

    // Fetch buffer minutes
    const bufferSetting = await prisma.studioSetting.findUnique({
      where: { key: 'buffer_minutes' },
    });
    const bufferMinutes = bufferSetting ? parseInt(bufferSetting.value, 10) : 15;
    const endTimeWithBuffer = new Date(endTime.getTime() + bufferMinutes * 60 * 1000);

    // Calculate subtotal
    const packagePrice = Number(pkg.price);
    const subtotal = packagePrice + addOnsTotal;

    // Validate promo if present
    let discountAmount = 0;
    let validatedPromoCode: string | null = null;

    if (promoCode) {
      const promo = await prisma.promo.findUnique({
        where: { code: promoCode.toUpperCase().trim() },
      });

      if (promo && promo.active && new Date(promo.validUntil) >= new Date() && promo.usedCount < promo.quota) {
        const minSpend = Number(promo.minSpend);
        if (subtotal >= minSpend) {
          validatedPromoCode = promo.code;
          if (promo.discountType === PromoType.PERCENTAGE) {
            discountAmount = Math.round((subtotal * Number(promo.discountValue)) / 100);
            if (promo.maxDiscount && discountAmount > Number(promo.maxDiscount)) {
              discountAmount = Number(promo.maxDiscount);
            }
          } else {
            discountAmount = Number(promo.discountValue);
          }
          if (discountAmount > subtotal) discountAmount = subtotal;
        }
      }
    }

    const totalPrice = subtotal - discountAmount;

    // Fetch DP percentage setting
    const dpSetting = await prisma.studioSetting.findUnique({
      where: { key: 'down_payment_percentage' },
    });
    const dpPercentage = dpSetting ? parseInt(dpSetting.value, 10) : 30;

    let dpAmount = 0;
    let remainingAmount = 0;
    let initialPaymentAmount = 0;

    if (paymentType === 'DP') {
      dpAmount = Math.round((totalPrice * dpPercentage) / 100);
      remainingAmount = totalPrice - dpAmount;
      initialPaymentAmount = dpAmount;
    } else {
      dpAmount = totalPrice;
      remainingAmount = 0;
      initialPaymentAmount = totalPrice;
    }

    // 15 minutes hold expiry
    const holdMinutes = 15;
    const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

    // Prevent user from creating duplicate booking on the same schedule if they have an active unpaid booking
    const userMatchFilter = currentUser?.userId
      ? { OR: [{ userId: currentUser.userId }, { guestEmail: guestEmail.toLowerCase().trim() }] }
      : { guestEmail: guestEmail.toLowerCase().trim() };

    const existingPendingBooking = await prisma.booking.findFirst({
      where: {
        ...userMatchFilter,
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: { gt: new Date() },
        startTime: { lt: endTimeWithBuffer },
        endTime: { gt: startTime },
      },
      include: {
        package: true,
        payments: { where: { status: PaymentStatus.PENDING } },
      },
    });

    if (existingPendingBooking) {
      return NextResponse.json(
        {
          success: false,
          code: 'PENDING_PAYMENT_EXISTS',
          message: `Anda masih memiliki tagihan yang belum dibayar (Kode: ${existingPendingBooking.bookingCode}) untuk sesi jadwal ini. Silakan selesaikan pembayaran tagihan yang ada atau batalkan terlebih dahulu sebelum memesan jadwal baru.`,
          existingBookingCode: existingPendingBooking.bookingCode,
        },
        { status: 409 }
      );
    }

    // Find candidate rooms before starting the transaction to minimize transaction duration
    const rooms = await prisma.room.findMany({
      where: { active: true, ...(parsed.data.roomId ? { id: parsed.data.roomId } : {}) },
    });

    if (rooms.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada ruangan studio yang tersedia' },
        { status: 400 }
      );
    }

    // Find a room without booking or blocked conflict
    let selectedRoomId: string | null = null;
    const now = new Date();

    for (const room of rooms) {
      // Check conflicting active bookings
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          roomId: room.id,
          startTime: { lt: endTimeWithBuffer },
          endTime: { gt: startTime },
          OR: [
            { status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] } },
            { status: BookingStatus.PENDING_PAYMENT, expiresAt: { gt: now } },
          ],
        },
      });

      if (conflictingBooking) continue;

      // Check blocked slots
      const conflictingBlock = await prisma.blockedSlot.findFirst({
        where: {
          roomId: room.id,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });

      if (conflictingBlock) continue;

      selectedRoomId = room.id;
      break;
    }

    if (!selectedRoomId) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Slot jadwal yang Anda pilih baru saja dipesan oleh pelanggan lain. Silakan pilih slot jam lain.',
        },
        { status: 409 }
      );
    }

    const bookingCode = generateBookingCode();

    // Execute atomic creation & conflict verification in a lean transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // Quick concurrency double-check for the selected room
        const concurrentBooking = await tx.booking.findFirst({
          where: {
            roomId: selectedRoomId,
            startTime: { lt: endTimeWithBuffer },
            endTime: { gt: startTime },
            OR: [
              { status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] } },
              { status: BookingStatus.PENDING_PAYMENT, expiresAt: { gt: new Date() } },
            ],
          },
        });

        if (concurrentBooking) {
          throw new Error(
            'Slot jadwal yang Anda pilih baru saja dipesan oleh pelanggan lain. Silakan pilih slot jam lain.'
          );
        }

        // Create Booking
        const newBooking = await tx.booking.create({
          data: {
            bookingCode,
            userId: currentUser?.userId || null,
            guestName,
            guestEmail,
            guestPhone,
            packageId,
            roomId: selectedRoomId,
            startTime,
            endTime,
            status: BookingStatus.PENDING_PAYMENT,
            paymentType: paymentType as PaymentType,
            subtotal,
            discountAmount,
            promoCode: validatedPromoCode,
            totalPrice,
            dpAmount,
            remainingAmount,
            notes: notes || null,
            expiresAt,
            bookingAddOns: {
              create: addOnRecords.map((ar) => ({
                addOnId: ar.addOnId,
                qty: ar.qty,
                unitPrice: ar.unitPrice,
                subtotal: ar.subtotal,
              })),
            },
            payments: {
              create: {
                type: paymentType === 'DP' ? PaymentPhase.DP : PaymentPhase.FULL,
                amount: initialPaymentAmount,
                status: PaymentStatus.PENDING,
                method: paymentMethod,
                provider: 'SIMULATOR',
                providerRef: `PAY-${bookingCode}-1`,
              },
            },
          },
          include: {
            package: true,
            room: true,
            bookingAddOns: { include: { addOn: true } },
            payments: true,
          },
        });

        // Increment promo usage if used
        if (validatedPromoCode) {
          await tx.promo.update({
            where: { code: validatedPromoCode },
            data: { usedCount: { increment: 1 } },
          });
        }

        return newBooking;
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    // Record audit log asynchronously outside the transaction to prevent blocking or closing the checkout
    prisma.auditLog
      .create({
        data: {
          userId: currentUser?.userId || null,
          action: 'BOOKING_CREATED',
          entity: 'Booking',
          entityId: result.id,
          details: JSON.stringify({
            bookingCode: result.bookingCode,
            totalPrice,
            paymentType,
          }),
        },
      })
      .catch((err) => console.error('Failed to write audit log:', err));

    const primaryPayment = result.payments[0];
    const vaNumber = generateVirtualAccountNumber(paymentMethod, result.bookingCode);

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dibuat. Slot ditahan selama 15 menit.',
      data: {
        bookingId: result.id,
        bookingCode: result.bookingCode,
        status: result.status,
        expiresAt: result.expiresAt.toISOString(),
        payment: {
          paymentId: primaryPayment.id,
          amount: Number(primaryPayment.amount),
          type: primaryPayment.type,
          method: paymentMethod,
          vaNumber: paymentMethod.startsWith('VA_') ? vaNumber : undefined,
          qrisPayload: paymentMethod === 'QRIS' ? `00020101021226${result.bookingCode}5204000053033605802ID5914Lumina Studio` : undefined,
        },
        summary: {
          packageName: result.package.name,
          roomName: result.room?.name,
          startTime: result.startTime.toISOString(),
          endTime: result.endTime.toISOString(),
          subtotal: Number(result.subtotal),
          discountAmount: Number(result.discountAmount),
          totalPrice: Number(result.totalPrice),
          dpAmount: Number(result.dpAmount),
          remainingAmount: Number(result.remainingAmount),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan saat memproses booking' },
      { status: 400 }
    );
  }
}

