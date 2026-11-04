import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/slot-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('packageId');
    const dateStr = searchParams.get('date');
    const roomId = searchParams.get('roomId') || undefined;
    const addOnIdsRaw = searchParams.get('addOnIds');
    const addOnIds = addOnIdsRaw ? addOnIdsRaw.split(',').filter(Boolean) : undefined;

    if (!packageId || !dateStr) {
      return NextResponse.json(
        { success: false, message: 'Parameter packageId dan date wajib diisi' },
        { status: 400 }
      );
    }

    const data = await getAvailableSlots({
      dateStr,
      packageId,
      addOnIds,
      roomId,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

