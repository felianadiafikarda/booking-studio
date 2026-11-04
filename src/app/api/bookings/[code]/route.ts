import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import QRCode from 'qrcode';
import { generateWhatsAppMessage, createWhatsAppLink } from '@/lib/notifications';
import { generateVirtualAccountNumber } from '@/lib/payments';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code.toUpperCase() },
      include: {
        package: true,
        room: true,
        bookingAddOns: { include: { addOn: true } },
        payments: { orderBy: { createdAt: 'desc' } },
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking tidak ditemukan' }, { status: 404 });
    }

    // Generate QR Code data URL for e-ticket check-in
    const qrCodeData = await QRCode.toDataURL(
      JSON.stringify({
        code: booking.bookingCode,
        name: booking.guestName,
        package: booking.package.name,
        time: booking.startTime.toISOString(),
      }),
      { width: 256, margin: 2 }
    );

    const latestPayment = booking.payments[0];
    const isPaid = booking.status === 'CONFIRMED' || latestPayment?.status === 'PAID';

    // Format dates for display
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    const dateFormatted = startDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
    const timeFormatted = `${startDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    })} - ${endDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    })}`;

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const eTicketUrl = `${protocol}://${host}/booking/status/${booking.bookingCode}`;

    const waText = generateWhatsAppMessage({
      bookingCode: booking.bookingCode,
      customerName: booking.guestName,
      customerPhone: booking.guestPhone,
      customerEmail: booking.guestEmail,
      packageName: booking.package.name,
      roomName: booking.room?.name,
      dateStr: dateFormatted,
      timeStr: timeFormatted,
      totalPrice: Number(booking.totalPrice),
      dpAmount: Number(booking.dpAmount),
      remainingAmount: Number(booking.remainingAmount),
      paymentType: booking.paymentType,
      paymentStatus: latestPayment?.status || 'PENDING',
      status: booking.status,
      eTicketUrl,
    });

    const waLink = createWhatsAppLink(booking.guestPhone, waText);

    // Reschedule and cancellation eligibility (H-2 / 48 hours)
    const now = new Date();
    const hoursUntilSession = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const canReschedule = hoursUntilSession >= 48 && (booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT');
    const canCancel = hoursUntilSession >= 0 && (booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT');

    const vaNumber = latestPayment?.method?.startsWith('VA_')
      ? generateVirtualAccountNumber(latestPayment.method, booking.bookingCode)
      : undefined;

    const isPendingPayment = booking.status === 'PENDING_PAYMENT';
    const qrisPayload = latestPayment?.method === 'QRIS'
      ? `00020101021226${booking.bookingCode}5204000053033605802ID5914Lumina Studio`
      : undefined;

    let qrisPaymentDataUrl: string | undefined = undefined;
    if (isPendingPayment && qrisPayload) {
      qrisPaymentDataUrl = await QRCode.toDataURL(qrisPayload, { width: 300, margin: 2 });
    }

    const remainingSeconds = isPendingPayment
      ? Math.max(0, Math.floor((new Date(booking.expiresAt).getTime() - now.getTime()) / 1000))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        notes: booking.notes,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        dateFormatted,
        timeFormatted,
        paymentType: booking.paymentType,
        subtotal: Number(booking.subtotal),
        discountAmount: Number(booking.discountAmount),
        promoCode: booking.promoCode,
        totalPrice: Number(booking.totalPrice),
        dpAmount: Number(booking.dpAmount),
        remainingAmount: Number(booking.remainingAmount),
        expiresAt: booking.expiresAt.toISOString(),
        rescheduleCount: booking.rescheduleCount,
        canReschedule,
        canCancel,
        hoursUntilSession: Math.round(hoursUntilSession),
        package: {
          id: booking.package.id,
          name: booking.package.name,
          slug: booking.package.slug,
          durationMinutes: booking.package.durationMinutes,
          maxPeople: booking.package.maxPeople,
          photoCount: booking.package.photoCount,
          features: typeof booking.package.features === 'string' ? JSON.parse(booking.package.features) : booking.package.features,
          imageUrl: booking.package.imageUrl,
        },
        room: booking.room ? { id: booking.room.id, name: booking.room.name } : null,
        addOns: booking.bookingAddOns.map((ba) => ({
          id: ba.id,
          name: ba.addOn.name,
          qty: ba.qty,
          unitPrice: Number(ba.unitPrice),
          subtotal: Number(ba.subtotal),
        })),
        payments: booking.payments.map((p) => ({
          id: p.id,
          type: p.type,
          amount: Number(p.amount),
          status: p.status,
          method: p.method,
          providerRef: p.providerRef,
          paidAt: p.paidAt?.toISOString(),
          vaNumber,
        })),
        qrCodeData,
        qrisPaymentDataUrl,
        qrisPayload,
        remainingSeconds,
        eTicketUrl,
        whatsappLink: waLink,
        hasReview: !!booking.review,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

