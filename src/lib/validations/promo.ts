import { z } from 'zod';

export const PromoSchema = z.object({
  code: z
    .string()
    .min(3, 'Kode promo minimal 3 karakter')
    .max(30, 'Kode promo maksimal 30 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode promo hanya boleh berisi huruf kapital, angka, strip (-), dan underscore (_)')
    .transform((val) => val.toUpperCase().trim()),
  discountType: z.enum(['PERCENTAGE', 'FIXED'], {
    message: 'Tipe diskon harus PERCENTAGE atau FIXED',
  }),
  discountValue: z
    .number({ message: 'Nilai diskon harus berupa angka' })
    .positive('Nilai diskon harus lebih besar dari 0'),
  minSpend: z
    .number({ message: 'Minimal transaksi harus berupa angka' })
    .min(0, 'Minimal transaksi tidak boleh bernilai negatif')
    .default(0),
  maxDiscount: z
    .number({ message: 'Maksimal diskon harus berupa angka' })
    .positive('Maksimal diskon harus lebih besar dari 0')
    .nullable()
    .optional(),
  quota: z
    .number({ message: 'Kuota harus berupa angka' })
    .int('Kuota harus berupa bilangan bulat')
    .min(1, 'Kuota minimal 1 penggunaan')
    .default(100),
  validUntil: z
    .string({ message: 'Tanggal kedaluwarsa wajib diisi' })
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'Format tanggal kedaluwarsa tidak valid',
    }),
  active: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
      return false;
    }
    return true;
  },
  {
    message: 'Diskon persentase tidak boleh melebihi 100%',
    path: ['discountValue'],
  }
);

export const UpdatePromoSchema = z.object({
  code: z
    .string()
    .min(3, 'Kode promo minimal 3 karakter')
    .max(30, 'Kode promo maksimal 30 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode promo hanya boleh berisi huruf kapital, angka, strip (-), dan underscore (_)')
    .transform((val) => val.toUpperCase().trim())
    .optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  discountValue: z.number().positive('Nilai diskon harus lebih besar dari 0').optional(),
  minSpend: z.number().min(0, 'Minimal transaksi tidak boleh negatif').optional(),
  maxDiscount: z.number().positive('Maksimal diskon harus lebih besar dari 0').nullable().optional(),
  quota: z.number().int().min(1, 'Kuota minimal 1').optional(),
  validUntil: z
    .string()
    .refine((val) => !isNaN(new Date(val).getTime()), 'Format tanggal tidak valid')
    .optional(),
  active: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.discountType === 'PERCENTAGE' && data.discountValue !== undefined && data.discountValue > 100) {
      return false;
    }
    return true;
  },
  {
    message: 'Diskon persentase tidak boleh melebihi 100%',
    path: ['discountValue'],
  }
);

