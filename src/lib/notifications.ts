/**
 * Notification helper for Lumina Luxe Photo Studio.
 * Formats WhatsApp messages and direct wa.me link, as well as email templates.
 */

export interface BookingNotificationData {
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  packageName: string;
  roomName?: string;
  dateStr: string;
  timeStr: string;
  totalPrice: number;
  dpAmount: number;
  remainingAmount: number;
  paymentType: 'DP' | 'FULL';
  paymentStatus: string;
  status: string;
  notes?: string;
  eTicketUrl: string;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates WhatsApp confirmation message text
 */
export function generateWhatsAppMessage(data: BookingNotificationData): string {
  const isPaid = data.status === 'CONFIRMED' || data.paymentStatus === 'PAID';

  let msg = `✨ *LUMINA LUXE PHOTO STUDIO* ✨\n`;
  msg += `Halo Kak *${data.customerName}*,\n\n`;

  if (isPaid) {
    msg += `🎉 *Booking Sesi Foto Berhasil Terkonfirmasi!*\n\n`;
  } else {
    msg += `📋 *Pesanan Booking Telah Dibuat (Menunggu Pembayaran)*\n\n`;
  }

  msg += `📌 *Detail Pesanan:*\n`;
  msg += `• Kode Booking : *${data.bookingCode}*\n`;
  msg += `• Paket Foto   : ${data.packageName}\n`;
  if (data.roomName) msg += `• Ruangan/Set  : ${data.roomName}\n`;
  msg += `• Tanggal      : ${data.dateStr}\n`;
  msg += `• Jam Sesi     : ${data.timeStr} WIB\n`;
  msg += `• Total Biaya  : ${formatPrice(data.totalPrice)}\n`;

  if (data.paymentType === 'DP') {
    msg += `• DP Dibayar   : ${formatPrice(data.dpAmount)}\n`;
    msg += `• Sisa Tagihan : ${formatPrice(data.remainingAmount)} (Pelunasan di Studio)\n`;
  } else {
    msg += `• Pembayaran   : Lunas (${formatPrice(data.totalPrice)})\n`;
  }

  msg += `\n🎟 *Akses E-Ticket & Status Booking:*\n${data.eTicketUrl}\n\n`;

  if (isPaid) {
    msg += `💡 *Tips Kunjungan Studio:*\n`;
    msg += `1. Harap hadir 10-15 menit sebelum jam sesi dimulai.\n`;
    msg += `2. Tunjukkan kode booking atau QR di E-Ticket kepada resepsionis.\n`;
    msg += `3. Jika ingin ganti jadwal, reschedule mandiri bisa dilakukan maks H-2 lewat link E-Ticket.\n\n`;
  } else {
    msg += `⚠️ Slot Anda ditahan selama 15 menit. Silakan selesaikan pembayaran agar slot tidak otomatis dilepas.\n\n`;
  }

  msg += `Terima kasih telah mempercayakan momen terbaik Anda kepada kami! ❤️\n`;
  msg += `_Lumina Luxe Studio - Jl. Malioboro No. 88, Yogyakarta_`;

  return msg;
}

/**
 * Creates direct WhatsApp API link (wa.me)
 */
export function createWhatsAppLink(phone: string, text: string): string {
  // Normalize Indonesian phone number: 0812... -> 62812...
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates Email HTML template
 */
export function generateEmailHtml(data: BookingNotificationData): string {
  const isPaid = data.status === 'CONFIRMED' || data.paymentStatus === 'PAID';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #18181b; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">LUMINA LUXE PHOTO STUDIO</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #a1a1aa;">Capture Your Precious Moments With Style</p>
      </div>

      <div style="padding: 24px 32px;">
        <h2 style="font-size: 18px; color: #111827; margin-top: 0;">
          ${isPaid ? 'Konfirmasi Pemesanan Sesi Foto' : 'Pemesanan Dibuat - Menunggu Pembayaran'}
        </h2>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
          Halo <strong>${data.customerName}</strong>,<br>
          ${
            isPaid
              ? 'Terima kasih, pembayaran Anda telah berhasil kami terima. Sesi foto Anda sudah resmi terjadwal di sistem kami.'
              : 'Pesanan sesi foto Anda telah kami terima. Harap segera selesaikan pembayaran untuk mengamankan slot jadwal Anda.'
          }
        </p>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span style="color: #6b7280;">Kode Booking</span>
            <strong style="color: #111827; font-family: monospace; font-size: 15px;">${data.bookingCode}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span style="color: #6b7280;">Paket Foto</span>
            <strong style="color: #111827;">${data.packageName}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span style="color: #6b7280;">Jadwal Sesi</span>
            <strong style="color: #111827;">${data.dateStr} | ${data.timeStr} WIB</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span style="color: #6b7280;">Total Biaya</span>
            <strong style="color: #111827;">${formatPrice(data.totalPrice)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <span style="color: #6b7280;">Status Pembayaran</span>
            <strong style="color: ${isPaid ? '#059669' : '#d97706'};">${isPaid ? 'Lunas / Terverifikasi' : 'Menunggu Pembayaran'}</strong>
          </div>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${data.eTicketUrl}" style="background: #18181b; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
            Buka E-Ticket & QR Check-in
          </a>
        </div>

        <p style="color: #6b7280; font-size: 12px; line-height: 1.5; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          Harap tiba 15 menit sebelum jadwal sesi. Apabila membutuhkan bantuan atau perubahan jadwal, hubungi kami via WhatsApp di +62 852-6541-6588.
        </p>
      </div>

      <div style="background: #f4f4f5; padding: 16px; text-align: center; font-size: 12px; color: #71717a;">
        © 2026 Lumina Luxe Photo Studio. All rights reserved.<br>Jl. Malioboro No. 88, Yogyakarta
      </div>
    </div>
  `;
}

