import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const reviewSchema = z.object({
  bookingCode: z.string().min(1, 'Kode booking wajib diisi'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Ulasan minimal 5 karakter'),
});

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    const { bookingCode, rating, comment } = parsed.data;

    const booking = await prisma.booking.findUnique({
      where: { bookingCode: bookingCode.toUpperCase() },
      include: { review: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Kode booking tidak ditemukan' }, { status: 404 });
    }

    if (booking.review) {
      return NextResponse.json({ success: false, message: 'Anda sudah memberikan ulasan untuk sesi ini' }, { status: 400 });
    }

    const newReview = await prisma.review.create({
      data: {
        bookingId: booking.id,
        customerName: booking.guestName,
        rating,
        comment,
        isPublished: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Terima kasih atas ulasan dan rating yang Anda berikan!',
      data: newReview,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

