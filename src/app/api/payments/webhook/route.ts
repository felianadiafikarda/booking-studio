import { NextRequest, NextResponse } from 'next/server';
import { confirmBookingPayment } from '@/lib/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Standard webhook payload structure support (Midtrans/Xendit/Custom)
    const bookingCode = body.order_id || body.bookingCode || body.external_id;
    const transactionStatus = body.transaction_status || body.status;
    const paymentMethod = body.payment_type || body.payment_method || 'QRIS';
    const providerRef = body.transaction_id || body.id;

    if (!bookingCode) {
      return NextResponse.json({ success: false, message: 'Invalid webhook payload: missing booking identifier' }, { status: 400 });
    }

    // Midtrans status: capture / settlement = success
    const isSuccess =
      transactionStatus === 'settlement' ||
      transactionStatus === 'capture' ||
      transactionStatus === 'PAID' ||
      transactionStatus === 'COMPLETED';

    if (isSuccess) {
      await confirmBookingPayment({
        bookingCode,
        method: paymentMethod,
        providerRef,
      });
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

