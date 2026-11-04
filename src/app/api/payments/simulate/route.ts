import { NextRequest, NextResponse } from 'next/server';
import { confirmBookingPayment } from '@/lib/payments';

export async function POST(req: NextRequest) {
  try {
    const { bookingCode, paymentId, method = 'QRIS' } = await req.json();

    if (!bookingCode && !paymentId) {
      return NextResponse.json(
        { success: false, message: 'bookingCode atau paymentId wajib disertakan' },
        { status: 400 }
      );
    }

    const result = await confirmBookingPayment({
      bookingCode,
      paymentId,
      method,
      providerRef: `SIM-${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Pembayaran berhasil disimulasikan dan booking terkonfirmasi!',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

