import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PromoType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Kode promo wajib diisi' }, { status: 400 });
    }

    const promo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promo || !promo.active) {
      return NextResponse.json({ success: false, message: 'Kode promo tidak valid atau tidak aktif' }, { status: 400 });
    }

    const now = new Date();
    if (new Date(promo.validUntil) < now) {
      return NextResponse.json({ success: false, message: 'Kode promo telah kedaluwarsa' }, { status: 400 });
    }

    if (promo.usedCount >= promo.quota) {
      return NextResponse.json({ success: false, message: 'Kuota pemakaian promo telah habis' }, { status: 400 });
    }

    const currentSubtotal = Number(subtotal || 0);
    const minSpend = Number(promo.minSpend);
    if (currentSubtotal < minSpend) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum belanja untuk kode ini adalah Rp ${minSpend.toLocaleString('id-ID')}`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (promo.discountType === PromoType.PERCENTAGE) {
      discountAmount = Math.round((currentSubtotal * Number(promo.discountValue)) / 100);
      if (promo.maxDiscount && discountAmount > Number(promo.maxDiscount)) {
        discountAmount = Number(promo.maxDiscount);
      }
    } else {
      discountAmount = Number(promo.discountValue);
    }

    if (discountAmount > currentSubtotal) {
      discountAmount = currentSubtotal;
    }

    return NextResponse.json({
      success: true,
      data: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: Number(promo.discountValue),
        discountAmount,
        minSpend,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

