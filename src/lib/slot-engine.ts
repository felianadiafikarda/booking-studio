import prisma from './prisma';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export interface TimeSlot {
  time: string; // "09:00"
  startTime: string; // ISO string
  endTime: string; // ISO string
  available: boolean;
  roomId?: string;
  roomName?: string;
  reason?: string;
}

/**
 * Automatically cleans up expired pending bookings
 */
export async function cleanupExpiredHeldSlots(): Promise<number> {
  const now = new Date();
  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.PENDING_PAYMENT,
      expiresAt: { lt: now },
    },
    select: { id: true },
  });

  if (expiredBookings.length === 0) return 0;

  const expiredIds = expiredBookings.map((b) => b.id);

  await prisma.$transaction([
    prisma.booking.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: BookingStatus.CANCELLED },
    }),
    prisma.payment.updateMany({
      where: { bookingId: { in: expiredIds }, status: PaymentStatus.PENDING },
      data: { status: PaymentStatus.EXPIRED },
    }),
  ]);

  return expiredIds.length;
}

/**
 * Calculates available slots for a given date, package, and selected add-ons.
 */
export async function getAvailableSlots(params: {
  dateStr: string; // "YYYY-MM-DD"
  packageId: string;
  addOnIds?: string[];
  roomId?: string;
}): Promise<{
  date: string;
  package: { id: string; name: string; durationMinutes: number };
  totalDurationMinutes: number;
  bufferMinutes: number;
  slots: TimeSlot[];
}> {
  await cleanupExpiredHeldSlots();

  // 1. Fetch package
  const pkg = await prisma.package.findUnique({
    where: { id: params.packageId },
  });

  if (!pkg) {
    throw new Error('Paket foto tidak ditemukan');
  }

  // 2. Fetch add-ons to calculate extra duration
  let extraMinutes = 0;
  if (params.addOnIds && params.addOnIds.length > 0) {
    const addons = await prisma.addOn.findMany({
      where: { id: { in: params.addOnIds }, active: true },
    });
    extraMinutes = addons.reduce((sum, a) => sum + (a.extraMinutes || 0), 0);
  }

  const sessionDurationMinutes = pkg.durationMinutes + extraMinutes;

  // 3. Fetch buffer setting
  const bufferSetting = await prisma.studioSetting.findUnique({
    where: { key: 'buffer_minutes' },
  });
  const bufferMinutes = bufferSetting ? parseInt(bufferSetting.value, 10) : 15;

  // 4. Parse target date
  // e.g. "2026-10-29"
  const [year, month, day] = params.dateStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const dayOfWeek = targetDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ...

  // 5. Fetch available rooms
  const rooms = await prisma.room.findMany({
    where: {
      active: true,
      ...(params.roomId ? { id: params.roomId } : {}),
    },
  });

  if (rooms.length === 0) {
    return {
      date: params.dateStr,
      package: { id: pkg.id, name: pkg.name, durationMinutes: pkg.durationMinutes },
      totalDurationMinutes: sessionDurationMinutes,
      bufferMinutes,
      slots: [],
    };
  }

  // 6. Fetch operating hours for that day
  const operatingHours = await prisma.operatingHour.findMany({
    where: {
      dayOfWeek,
      isActive: true,
    },
  });

  if (operatingHours.length === 0) {
    return {
      date: params.dateStr,
      package: { id: pkg.id, name: pkg.name, durationMinutes: pkg.durationMinutes },
      totalDurationMinutes: sessionDurationMinutes,
      bufferMinutes,
      slots: [],
    };
  }

  // Determine earliest open and latest close across available operating hours
  let earliestOpen = '23:59';
  let latestClose = '00:00';

  for (const oh of operatingHours) {
    if (oh.openTime < earliestOpen) earliestOpen = oh.openTime;
    if (oh.closeTime > latestClose) latestClose = oh.closeTime;
  }

  const [openHour, openMin] = earliestOpen.split(':').map(Number);
  const [closeHour, closeMin] = latestClose.split(':').map(Number);

  const dayStartUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const dayEndUtc = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

  // 7. Fetch existing active bookings on this day
  const now = new Date();
  const existingBookings = await prisma.booking.findMany({
    where: {
      startTime: { lte: dayEndUtc },
      endTime: { gte: dayStartUtc },
      OR: [
        { status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] } },
        { status: BookingStatus.PENDING_PAYMENT, expiresAt: { gt: now } },
      ],
    },
    select: {
      id: true,
      roomId: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  });

  // 8. Fetch blocked slots
  const blockedSlots = await prisma.blockedSlot.findMany({
    where: {
      startTime: { lte: dayEndUtc },
      endTime: { gte: dayStartUtc },
    },
  });

  // 9. Generate candidate slots every 30 minutes from open to close
  const openTimeInMinutes = openHour * 60 + openMin;
  const closeTimeInMinutes = closeHour * 60 + closeMin;

  const slots: TimeSlot[] = [];

  for (
    let currentMin = openTimeInMinutes;
    currentMin + sessionDurationMinutes <= closeTimeInMinutes;
    currentMin += 30 // step candidate by 30 mins for maximum flexibility
  ) {
    const slotHour = Math.floor(currentMin / 60);
    const slotMinute = currentMin % 60;
    const timeLabel = `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`;

    // Construct slot start and end in UTC for consistency with server
    // Note: Studio operates in UTC+7 (WIB).
    // If local time is 09:00 WIB, UTC is 02:00 UTC.
    // To keep it clean and robust, we convert slot times:
    const slotStart = new Date(Date.UTC(year, month - 1, day, slotHour - 7, slotMinute, 0));
    const slotEnd = new Date(slotStart.getTime() + sessionDurationMinutes * 60 * 1000);
    const slotEndWithBuffer = new Date(slotEnd.getTime() + bufferMinutes * 60 * 1000);

    // Can't book slots in the past
    if (slotStart.getTime() <= now.getTime()) {
      continue;
    }

    // Check availability across candidate rooms
    let availableRoom: { id: string; name: string } | null = null;

    for (const room of rooms) {
      // Check if room is open on this day
      const roomOH = operatingHours.find((oh) => !oh.roomId || oh.roomId === room.id);
      if (!roomOH || !roomOH.isActive) continue;

      // Check overlap with bookings (including buffer)
      const hasBookingOverlap = existingBookings.some((b) => {
        if (b.roomId && b.roomId !== room.id) return false;
        const bStart = b.startTime.getTime();
        const bEndWithBuffer = b.endTime.getTime() + bufferMinutes * 60 * 1000;
        return slotStart.getTime() < bEndWithBuffer && slotEndWithBuffer.getTime() > bStart;
      });

      if (hasBookingOverlap) continue;

      // Check overlap with blocked slots
      const hasBlockedOverlap = blockedSlots.some((bs) => {
        if (bs.roomId && bs.roomId !== room.id) return false;
        return slotStart.getTime() < bs.endTime.getTime() && slotEnd.getTime() > bs.startTime.getTime();
      });

      if (hasBlockedOverlap) continue;

      availableRoom = { id: room.id, name: room.name };
      break;
    }

    slots.push({
      time: timeLabel,
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      available: availableRoom !== null,
      roomId: availableRoom ? availableRoom.id : undefined,
      roomName: availableRoom ? availableRoom.name : undefined,
      reason: availableRoom === null ? 'Slot sudah terisi atau diblokir' : undefined,
    });
  }

  return {
    date: params.dateStr,
    package: { id: pkg.id, name: pkg.name, durationMinutes: pkg.durationMinutes },
    totalDurationMinutes: sessionDurationMinutes,
    bufferMinutes,
    slots,
  };
}

